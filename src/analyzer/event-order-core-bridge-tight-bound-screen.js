import { createCoreBoundaryAdapter } from '../solver/core-boundary-adapter.js';
import { createFixedPurchasePolicyTowerAdapter } from '../solver/fixed-purchase-policy-adapter.js';
import { explainFixedPurchaseTerminalHpUpperBound } from '../solver/fixed-purchase-bound-diagnostics.js';
import { collectGoalFrontier } from '../solver/goal-frontier.js';
import { createObjectiveThresholdAdapter } from '../solver/objective-threshold-adapter.js';
import { previewDiscreteHarvestAndPureHpAccessTightening } from '../solver/discrete-harvest-bound-preview.js';
import { replayTowerCertificateToState } from '../solver/replay.js';
import { withBalanceEdits } from '../tuner/balance-overlay.js';
import { resolveReviewCandidateReference } from '../tuner/review-candidate-reference.js';
import { cloneReviewCandidate, REVIEW_CANDIDATES } from '../tuner/review-candidates.js';

function certificateHash(certificate) { return certificate?.certificateHash ?? null; }
function range(values) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? { min: Math.min(...finite), max: Math.max(...finite) } : { min: null, max: null };
}

export function summarizeTightBoundBridgeScreen(entries, threshold) {
  const byPurchase = {};
  for (const entry of entries) {
    const key = String(entry.shopPurchases);
    if (!byPurchase[key]) byPurchase[key] = { total: 0, prunable: 0, oldUpper: [], tightUpper: [], tightening: [] };
    const group = byPurchase[key];
    group.total += 1;
    group.prunable += entry.tightUpperBound <= threshold ? 1 : 0;
    group.oldUpper.push(entry.oldUpperBound);
    group.tightUpper.push(entry.tightUpperBound);
    group.tightening.push(entry.tightening);
  }
  return {
    total: entries.length,
    prunable: entries.filter((entry) => entry.tightUpperBound <= threshold).length,
    residual: entries.filter((entry) => entry.tightUpperBound > threshold).length,
    oldUpper: range(entries.map((entry) => entry.oldUpperBound)),
    tightUpper: range(entries.map((entry) => entry.tightUpperBound)),
    tightening: range(entries.map((entry) => entry.tightening)),
    byPurchase: Object.fromEntries(Object.entries(byPurchase).map(([key, group]) => [key, {
      total: group.total,
      prunable: group.prunable,
      residual: group.total - group.prunable,
      oldUpper: range(group.oldUpper),
      tightUpper: range(group.tightUpper),
      tightening: range(group.tightening)
    }]))
  };
}

/** Batch-screen representative V3 c7 frontiers with the sound discrete/access preview. */
export function analyzeV3C7TightBoundScreen({
  candidate = REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness = null,
  fromCores = 6,
  toCores = 7,
  fromBoundaryMaxExpanded = 8_000,
  fromBoundaryMaxGenerated = 100_000,
  fromBoundaryMaxGoals = 64,
  maxPrefixSeeds = 3,
  bridgeMaxExpandedPerPrefix = 6_000,
  bridgeMaxGeneratedPerPrefix = 90_000,
  bridgeMaxGoalsPerPrefix = 32
} = {}) {
  const snapshot = cloneReviewCandidate(candidate);
  return withBalanceEdits(snapshot.edits, () => {
    const fixedAdapter = createFixedPurchasePolicyTowerAdapter({ shopPlan: snapshot.purchasePolicy.shopPlan, shopCycle: snapshot.purchasePolicy.shopCycle });
    const reference = resolveReviewCandidateReference({ candidate: snapshot, adapter: fixedAdapter, referenceWitness });
    if (!reference.ok || !Number.isFinite(reference.terminalHp)) return { schemaVersion: 1, model: 'v3-c7-tight-bound-screen-v0.1', status: 'candidate-snapshot-drift', productionWriteAllowed: false, exactNoExploit: false };
    const threshold = reference.terminalHp;
    const thresholdAdapter = createObjectiveThresholdAdapter({ threshold, baseAdapter: fixedAdapter });
    const fromAdapter = createCoreBoundaryAdapter({ targetCores: fromCores, baseAdapter: thresholdAdapter });
    const toAdapter = createCoreBoundaryAdapter({ targetCores: toCores, baseAdapter: thresholdAdapter });
    const fromFrontier = collectGoalFrontier({ adapter: fromAdapter, maxExpanded: fromBoundaryMaxExpanded, maxGenerated: fromBoundaryMaxGenerated, maxGoals: fromBoundaryMaxGoals, solverVersion: 'v3-tight-screen-c6-v0.1' });
    const prefixes = fromFrontier.goals.map((goal) => {
      const replay = replayTowerCertificateToState(goal.certificate, { adapter: fromAdapter });
      if (!replay.ok || !replay.state) return null;
      const upperBound = fixedAdapter.objectiveUpperBound(replay.state);
      return upperBound > threshold ? { certificate: goal.certificate, state: replay.state, resources: fixedAdapter.resources(replay.state), upperBound } : null;
    }).filter(Boolean).sort((a,b)=>b.upperBound-a.upperBound || (b.resources?.gold??0)-(a.resources?.gold??0)).slice(0,maxPrefixSeeds);

    const attempts=[];
    const allEntries=[];
    for (const prefix of prefixes) {
      const frontier=collectGoalFrontier({ adapter:toAdapter, initialState:prefix.state, maxExpanded:bridgeMaxExpandedPerPrefix, maxGenerated:bridgeMaxGeneratedPerPrefix, maxGoals:bridgeMaxGoalsPerPrefix, solverVersion:`v3-tight-screen-c7-v0.1-g${bridgeMaxGoalsPerPrefix}` });
      const entries=[];
      for (const goal of frontier.goals) {
        const replay=replayTowerCertificateToState(goal.certificate,{adapter:toAdapter,initialState:prefix.state});
        if(!replay.ok||!replay.state) continue;
        const oldUpperBound=fixedAdapter.objectiveUpperBound(replay.state);
        if(!(oldUpperBound>threshold)) continue;
        const explanation=explainFixedPurchaseTerminalHpUpperBound({adapter:fixedAdapter,state:replay.state,shopPlan:snapshot.purchasePolicy.shopPlan,shopCycle:snapshot.purchasePolicy.shopCycle});
        const preview=previewDiscreteHarvestAndPureHpAccessTightening({adapter:fixedAdapter,state:replay.state,boundExplanation:explanation,floorId:7});
        const best=preview.best??{};
        const access=best.strongestAccessConstraint??{};
        const resources=fixedAdapter.resources(replay.state);
        const entry={ certificateHash:certificateHash(goal.certificate), resources, shopPurchases:replay.state.shopPurchases, oldUpperBound, tightUpperBound:preview.previewUpperBound, tightening:oldUpperBound-preview.previewUpperBound, oldSlack:oldUpperBound-threshold, tightSlack:preview.previewUpperBound-threshold, prunable:preview.previewUpperBound<=threshold, zeroDamageGold:preview.harvest.zeroDamageGold, bestPurchaseCount:best.purchaseCount, requiredEnemyGold:best.requiredEnemyGold, fractionalHarvestDamage:best.fractionalHarvestDamage, discreteHarvestDamage:best.discreteHarvestDamage, accessItem:access.itemId??null, accessDamageLowerBound:access.accessDamageLowerBound??null, accessAdditionalPenalty:best.accessAdditionalPenalty??0 };
        entries.push(entry); allEntries.push(entry);
      }
      attempts.push({ prefixCertificateHash:certificateHash(prefix.certificate), prefixResources:prefix.resources, prefixUpperBound:prefix.upperBound, frontier:{activeGoalLabels:frontier.activeGoalLabels,stoppedReason:frontier.stoppedReason,coverageExact:frontier.coverageExact,expandedStates:frontier.expandedStates,generatedStates:frontier.generatedStates}, summary:summarizeTightBoundBridgeScreen(entries,threshold), entries });
    }
    return { schemaVersion:1, model:'v3-c7-tight-bound-screen-v0.1', status:'diagnostic-complete', productionWriteAllowed:false, proofBoundModified:false, exactNoExploit:false, soundBridgeBoundCandidate:true, reference:{terminalHp:threshold,minNormalizedHpMargin:reference.minNormalizedHpMargin}, prefixCount:prefixes.length, overall:summarizeTightBoundBridgeScreen(allEntries,threshold), attempts, interpretation:'representative_c7_frontiers_were_batch_screened_with_discrete_harvest_and_single_reward_access_constraints_before_proof_integration' };
  });
}
