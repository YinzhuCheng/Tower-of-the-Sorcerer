import { ENEMIES } from '../game/data.js';
import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import { PROMOTED_PURCHASE_PLANS } from '../solver/tower-incumbent.js';
import { withBalanceEdits } from './balance-overlay.js';
import { evaluateProtectedBalanceCandidate, rankBalanceCandidates } from './numeric-evaluator.js';

export const PRESSURE_TARGET_MIDPOINT = 0.165;

function protectedPlan() {
  const plan = PROMOTED_PURCHASE_PLANS[0];
  if (!plan) throw new Error('Final pressure tuner requires a promoted purchase plan.');
  return plan;
}

function replayProtectedPlan() {
  const plan = protectedPlan();
  return runGreedyShopStrategy({
    shopCycle: [...plan.cycle],
    shopPlan: [...plan.shopPlan],
    holyPolicy: plan.holyPolicy
  });
}

function voidCoreCheckpoint(route) {
  const checkpoint = route.battleLog.find((entry) => entry.enemyId === 'voidCore');
  if (!checkpoint) throw new Error('Protected route did not reach voidCore.');
  return checkpoint;
}

function wardedHitDamage(magicPower, ward) {
  return ward ? Math.ceil(magicPower * 0.8) : magicPower;
}

export function predictedFinalMargin({ hpBefore, counterAttacks, magicPower, ward = true }) {
  const totalDamage = wardedHitDamage(magicPower, ward) * counterAttacks;
  return {
    magicPower,
    enemyDamage: wardedHitDamage(magicPower, ward),
    counterAttacks,
    totalDamage,
    winnable: totalDamage < hpBefore,
    normalizedHpMargin: (hpBefore - totalDamage - 1) / Math.max(1, hpBefore)
  };
}

export function deriveFinalMagicPower({
  hpBefore,
  counterAttacks,
  ward = true,
  targetMargin = PRESSURE_TARGET_MIDPOINT,
  minMagicPower = ENEMIES.voidCore.magicPower,
  maxMagicPower = 1_000
} = {}) {
  if (!Number.isFinite(hpBefore) || hpBefore <= 1) throw new Error('deriveFinalMagicPower requires positive hpBefore.');
  if (!Number.isInteger(counterAttacks) || counterAttacks <= 0) throw new Error('deriveFinalMagicPower requires positive counterAttacks.');

  let best = null;
  for (let magicPower = Math.max(1, Math.ceil(minMagicPower)); magicPower <= maxMagicPower; magicPower += 1) {
    const predicted = predictedFinalMargin({ hpBefore, counterAttacks, magicPower, ward });
    if (!predicted.winnable) break;
    const distance = Math.abs(predicted.normalizedHpMargin - targetMargin);
    if (!best || distance < best.distance || (distance === best.distance && magicPower < best.magicPower)) {
      best = { ...predicted, distance };
    }
  }
  if (!best) throw new Error('No winnable final magic-power candidate found.');
  return best;
}

export function derivePairedPressureCandidates({
  hpRewards = [900, 540, 270, 180, 90],
  targetMargin = PRESSURE_TARGET_MIDPOINT
} = {}) {
  const baselineMagicPower = ENEMIES.voidCore.magicPower;
  return hpRewards.map((hpReward) => {
    const hpEdits = [
      { target: 'shop', id: 'hp', field: 'effect.hp', value: hpReward },
      { target: 'shop', id: 'hp', field: 'effect.maxHp', value: hpReward }
    ];
    const route = withBalanceEdits(hpEdits, () => replayProtectedPlan());
    if (!route.solvable) {
      return {
        id: `shop-hp-${hpReward}-protected-fail`,
        hpReward,
        baselineMagicPower,
        derivationFailed: true,
        failure: route.failure,
        edits: hpEdits
      };
    }
    const checkpoint = voidCoreCheckpoint(route);
    const derived = deriveFinalMagicPower({
      hpBefore: checkpoint.statsBefore.hp,
      counterAttacks: checkpoint.battle.counterAttacks,
      ward: route.relics.ward,
      targetMargin,
      minMagicPower: baselineMagicPower
    });
    return {
      id: `shop-hp-${hpReward}-void-magic-${derived.magicPower}`,
      hpReward,
      magicPower: derived.magicPower,
      baselineMagicPower,
      targetMargin,
      derivationFailed: false,
      protectedBeforeMagicEdit: {
        finalHp: route.final.hp,
        hpBeforeVoidCore: checkpoint.statsBefore.hp,
        counterAttacks: checkpoint.battle.counterAttacks,
        currentMagicPower: baselineMagicPower,
        currentTotalDamage: checkpoint.battle.totalDamage,
        currentMargin: checkpoint.normalizedHpMargin
      },
      predictedAfterMagicEdit: derived,
      edits: [
        ...hpEdits,
        { target: 'enemy', id: 'voidCore', field: 'magicPower', value: derived.magicPower }
      ]
    };
  });
}

export function dryRunFinalPressureTuning({
  hpRewards,
  targetMargin = PRESSURE_TARGET_MIDPOINT,
  maxExpanded = 5_000,
  maxGenerated = 50_000,
  editPenaltyWeight = 0.05
} = {}) {
  const derived = derivePairedPressureCandidates({ hpRewards, targetMargin });
  const evaluated = derived.map((candidate) => {
    if (candidate.derivationFailed) return { ...candidate, evaluation: null };
    return {
      ...candidate,
      evaluation: evaluateProtectedBalanceCandidate({
        id: candidate.id,
        edits: candidate.edits,
        maxExpanded,
        maxGenerated,
        editPenaltyWeight
      })
    };
  });
  const evaluations = evaluated.filter((entry) => entry.evaluation).map((entry) => entry.evaluation);
  const rankedEvaluations = rankBalanceCandidates(evaluations);
  const byId = new Map(evaluated.map((entry) => [entry.id, entry]));
  const ranked = rankedEvaluations.map((evaluation) => ({ ...byId.get(evaluation.id), evaluation }));
  const failed = evaluated.filter((entry) => !entry.evaluation);
  return {
    schemaVersion: 1,
    model: 'paired-final-pressure-tuner-v0.1',
    dryRun: true,
    targetMargin,
    baselineMagicPower: ENEMIES.voidCore.magicPower,
    candidates: [...ranked, ...failed],
    bestAccepted: ranked.find((entry) => entry.evaluation.acceptedHardConstraints) ?? null
  };
}
