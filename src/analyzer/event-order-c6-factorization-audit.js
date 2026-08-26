import { ENEMIES } from '../game/data.js';
import { calculateBattle } from '../game/engine.js';
import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { FrontierIndex } from '../solver/frontier.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { stableStringify } from '../solver/state.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function hasGateToken(floorState) {
  return floorState?.map?.some((row) => row.some((token) => typeof token === 'string' && token.startsWith('gate:'))) ?? false;
}

/**
 * Switch history and rune sequence progress are engine-dead after every gate on
 * that floor is gone. Boss defeat remains live because upward stairs read it.
 */
export function canonicalizeInactivePuzzleMeta(compactState, materializedState) {
  return compactState.floorMeta.map((meta, floor) => {
    const gateLive = hasGateToken(materializedState.floorStates?.[floor]);
    return {
      switches: gateLive ? [...meta.switches].sort() : [],
      sequenceProgress: gateLive ? Number(meta.sequenceProgress ?? 0) : 0,
      bossDefeated: Boolean(meta.bossDefeated)
    };
  });
}

function relicSignature(relics = {}) {
  return Object.keys(relics).sort().map((key) => `${key}:${relics[key] ? 1 : 0}`).join(',');
}

function safePuzzleCanonicalObject(sample, { includeVisited = true, includeComponent = true } = {}) {
  const state = sample.state;
  return {
    floor: state.floor,
    ...(includeComponent ? { componentAnchor: state.componentAnchor } : {}),
    eventStates: state.eventStates,
    floorMeta: canonicalizeInactivePuzzleMeta(state, sample.materialized),
    relics: relicSignature(state.relics),
    shopPurchases: state.shopPurchases,
    ...(includeVisited ? { visitedFloors: state.visitedFloors } : {}),
    victory: state.victory
  };
}

function safePuzzleCanonicalKey(sample) {
  return stableStringify(safePuzzleCanonicalObject(sample));
}

function projectionSummary(samples, keyOf, resourceFields) {
  const frontier = new FrontierIndex({ fields: resourceFields });
  let nextId = 1;
  for (const sample of samples) {
    const label = {
      id: nextId++,
      resources: sample.resources,
      active: true
    };
    frontier.insert(keyOf(sample), label);
  }
  return {
    structuralStates: frontier.structuralStates,
    activeLabels: frontier.activeCount(),
    peakWidth: frontier.peakWidth
  };
}

function slotIndexesByFloor(catalog) {
  const byFloor = new Map();
  for (let index = 0; index < catalog.events.length; index += 1) {
    const event = catalog.events[index];
    if (!byFloor.has(event.floor)) byFloor.set(event.floor, []);
    byFloor.get(event.floor).push(index);
  }
  return byFloor;
}

function eventSignature(state, indexes) {
  return indexes.map((index) => state.eventStates[index]).join('.');
}

function variableSlotSummary(samples, catalog, floor, indexes) {
  const variableByType = {};
  let variableSlots = 0;
  for (const index of indexes) {
    const values = new Set(samples.map((sample) => sample.state.eventStates[index]));
    if (values.size <= 1) continue;
    variableSlots += 1;
    const type = catalog.events[index]?.type ?? 'unknown';
    variableByType[type] = (variableByType[type] ?? 0) + 1;
  }
  const signatures = new Set(samples.map((sample) => eventSignature(sample.state, indexes)));
  return {
    floor,
    dynamicSlots: indexes.length,
    variableSlots,
    variableByType,
    uniqueEventSignatures: signatures.size
  };
}

function remainingEnemyProfile(sample, catalog) {
  const remainingZeroDamageSafe = [];
  const remainingZeroDamageLuckyPending = [];
  const remainingPositiveDamage = [];
  for (let index = 0; index < catalog.events.length; index += 1) {
    const event = catalog.events[index];
    if (event.type !== 'enemy') continue;
    const token = sample.materialized.floorStates[event.floor]?.map?.[event.y]?.[event.x];
    if (typeof token !== 'string' || !token.startsWith('enemy:')) continue;
    const enemyId = token.slice('enemy:'.length);
    const enemy = ENEMIES[enemyId];
    if (!enemy || enemy.boss) continue;
    const battle = calculateBattle(sample.state.stats, enemy, sample.state.relics);
    if (!battle.winnable || !Number.isFinite(battle.totalDamage)) continue;
    if (battle.totalDamage === 0) {
      if (sample.state.relics?.lucky) remainingZeroDamageSafe.push(event.eventId);
      else remainingZeroDamageLuckyPending.push(event.eventId);
    } else {
      remainingPositiveDamage.push(event.eventId);
    }
  }
  return {
    remainingZeroDamageSafe: remainingZeroDamageSafe.sort(),
    remainingZeroDamageLuckyPending: remainingZeroDamageLuckyPending.sort(),
    remainingPositiveDamage: remainingPositiveDamage.sort()
  };
}

function histogram(values) {
  const out = {};
  for (const value of values) out[String(value)] = (out[String(value)] ?? 0) + 1;
  return out;
}

/**
 * Audit why the c6 threshold goal frontier keeps growing. This is diagnostic:
 * only `safePuzzleCanonical` is a proof-safe quotient candidate. Other omitted
 * fields are reported only to quantify where cardinality lives.
 */
export function analyzeV3C6FactorizationAudit({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  targetCores = 6,
  maxGoals = 512,
  maxExpanded = 50_000,
  maxGenerated = 700_000
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  return withBalanceEdits(snapshot.edits, () => {
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({
      shopPlan: snapshot.purchasePolicy.shopPlan,
      shopCycle: snapshot.purchasePolicy.shopCycle
    });
    const reference = resolveReviewCandidateReference({
      candidate: snapshot,
      adapter: fixedAdapter,
      referenceWitness
    });
    if (!reference.ok || !Number.isFinite(reference.terminalHp)) {
      return {
        schemaVersion: 1,
        model: 'v3-c6-factorization-audit-v0.1',
        status: 'candidate-snapshot-drift',
        productionWriteAllowed: false,
        exactNoExploit: false,
        referenceFailures: reference.failures ?? ['reference_resolution_failed']
      };
    }

    const threshold = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: fixedAdapter });
    const boundaryAdapter = createCoreBoundaryAdapter({ targetCores, baseAdapter: thresholdAdapter });
    const frontier = collectGoalFrontier({
      adapter: boundaryAdapter,
      maxExpanded,
      maxGenerated,
      maxGoals,
      solverVersion: `v3-c6-factorization-audit-v0.1-g${maxGoals}`
    });
    const catalog = fixedAdapter.eventCatalog();
    const samples = [];
    for (const goal of frontier.goals) {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: boundaryAdapter });
      if (!replay.ok || !replay.state) continue;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      if (!(upperBound > threshold)) continue;
      const state = replay.state;
      const materialized = fixedAdapter.materializeState(state);
      const actions = fixedAdapter.enumerateActions(state);
      const enemyProfile = remainingEnemyProfile({ state, materialized }, catalog);
      const reachableZeroDamageEnemies = actions.filter((action) => {
        if (action?.kind !== 'tile' || action?.parsed?.type !== 'enemy') return false;
        const enemy = ENEMIES[action.parsed.id];
        if (!enemy || enemy.boss || !state.relics?.lucky) return false;
        const battle = calculateBattle(state.stats, enemy, state.relics);
        return battle.winnable && battle.totalDamage === 0;
      }).map((action) => action.eventId).sort();
      samples.push({
        state,
        materialized,
        resources: fixedAdapter.resources(state),
        upperBound,
        enemyProfile,
        reachableZeroDamageEnemies,
        affordableFixedShop: actions.some((action) => action?.kind === 'shop'),
        actionSurface: actions.map((action) => `${action.kind}:${action.eventId}`).sort().join('|')
      });
    }

    const raw = projectionSummary(samples, (sample) => fixedAdapter.frontierKey(sample.state), fixedAdapter.resourceFields);
    const safePuzzleCanonical = projectionSummary(samples, safePuzzleCanonicalKey, fixedAdapter.resourceFields);
    const omitVisitedDiagnostic = projectionSummary(samples, (sample) => stableStringify(
      safePuzzleCanonicalObject(sample, { includeVisited: false })
    ), fixedAdapter.resourceFields);
    const omitComponentDiagnostic = projectionSummary(samples, (sample) => stableStringify(
      safePuzzleCanonicalObject(sample, { includeComponent: false })
    ), fixedAdapter.resourceFields);

    const byFloor = slotIndexesByFloor(catalog);
    const floorVariation = [...byFloor.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([floor, indexes]) => variableSlotSummary(samples, catalog, floor, indexes));

    const safeEnemySetSignatures = new Set(samples.map((sample) => sample.enemyProfile.remainingZeroDamageSafe.join('|')));
    const actionSurfaceSignatures = new Set(samples.map((sample) => sample.actionSurface));
    const relicSignatures = new Set(samples.map((sample) => relicSignature(sample.state.relics)));
    const visitedSignatures = new Set(samples.map((sample) => sample.state.visitedFloors.join(',')));
    const componentSignatures = new Set(samples.map((sample) => `${sample.state.floor}:${sample.state.componentAnchor}`));

    return {
      schemaVersion: 1,
      model: 'v3-c6-factorization-audit-v0.1',
      status: 'diagnostic-complete',
      productionWriteAllowed: false,
      exactNoExploit: false,
      reference: {
        terminalHp: threshold,
        minNormalizedHpMargin: reference.minNormalizedHpMargin
      },
      boundary: {
        maxGoals,
        coverageExact: frontier.coverageExact,
        stoppedReason: frontier.stoppedReason,
        activeGoalLabels: frontier.activeGoalLabels,
        replayVerifiedRelevantGoals: samples.length,
        expandedStates: frontier.expandedStates,
        generatedStates: frontier.generatedStates
      },
      projections: {
        raw,
        safePuzzleCanonical,
        omitVisitedDiagnostic,
        omitComponentDiagnostic,
        actionSurfaceStructuralStates: actionSurfaceSignatures.size
      },
      stateAxes: {
        purchaseHistogram: histogram(samples.map((sample) => sample.state.shopPurchases)),
        relicSignatures: relicSignatures.size,
        visitedSignatures: visitedSignatures.size,
        componentSignatures: componentSignatures.size
      },
      floorVariation,
      monotoneCandidates: {
        goalsWithReachableZeroDamageEnemy: samples.filter((sample) => sample.reachableZeroDamageEnemies.length > 0).length,
        reachableZeroDamageEnemyCountHistogram: histogram(samples.map((sample) => sample.reachableZeroDamageEnemies.length)),
        goalsWithAnyRemainingZeroDamageSafeEnemy: samples.filter((sample) => sample.enemyProfile.remainingZeroDamageSafe.length > 0).length,
        remainingZeroDamageSafeCountHistogram: histogram(samples.map((sample) => sample.enemyProfile.remainingZeroDamageSafe.length)),
        remainingZeroDamageSafeSetSignatures: safeEnemySetSignatures.size,
        goalsWithAffordableFixedShop: samples.filter((sample) => sample.affordableFixedShop).length
      },
      interpretation: 'audit_only_no_quotient_or_normalization_change_applied'
    };
  });
}
