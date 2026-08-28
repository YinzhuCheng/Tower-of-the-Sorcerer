import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import { DEMO10_CODESIGN_POLICY_SPECS, summarizeDemoTenFloorCheckpoints } from '../src/analyzer/demo-10-floor-checkpoints.js';
import { DEMO10_EXPERT_TARGETS, demoTenFloorExpertLoss, summarizeDemoTenFloorPortfolio } from '../src/game/demo-10-floor-quality.js';
import { runTowerCodesignBeamSearch } from '../src/tuner/codesign-beam-search.js';
import { proposeDemoTenFloorAdaptiveMutations } from '../src/tuner/demo-10-floor-adaptive-mutations.js';
import { createDemoTenFloorMutationCatalog, demoTenFloorCandidateEditLoss, demoTenFloorCandidateKey, expandDemoTenFloorCandidate, withDemoTenFloorCandidate } from '../src/tuner/demo-10-floor-mutations.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy, EXPERT_NO_HP_STRATEGY_ID } = await import('../src/solver/expert-strategy.js');
const baselineExpertPlanning = runExpertNoHpStrategy({ holyPolicy: 'immediate', maxIterations: 8_000, horizon: 2, attackAdvantageRequired: 2_000 });
const frozenExpertShopPlan = Object.freeze([...baselineExpertPlanning.planning.shopPlan]);
const catalog = createDemoTenFloorMutationCatalog();
const fullDiagnosticPolicyCount = DEMO10_CODESIGN_POLICY_SPECS.length;
const diagnosticSpecs = DEMO10_CODESIGN_POLICY_SPECS.filter((_, index) => index % 3 === 0);
const expertSpec = Object.freeze({ id: EXPERT_NO_HP_STRATEGY_ID });
function runDiagnosticPolicy(spec) { return runGreedyShopStrategy({ shopCycle: spec.shopCycle, shopPlan: spec.shopPlan, holyPolicy: spec.holyPolicy, maxIterations: 8_000 }); }
function runExpertPolicy() {
  const report = runGreedyShopStrategy({ shopCycle: ['def'], shopPlan: frozenExpertShopPlan, holyPolicy: 'immediate', maxIterations: 8_000 });
  return { ...report, strategyId: EXPERT_NO_HP_STRATEGY_ID, strategy: { shopHpAllowed: false, defaultInvestment: 'def', witnessMode: 'frozen-baseline-plan-with-def-fallback' }, planning: { shopPlan: [...frozenExpertShopPlan] } };
}
function compactCheckpoint(checkpoints) { return Object.fromEntries(Object.entries(checkpoints.floors).map(([floor, profile]) => [floor, { sampledPolicies: profile.sampledPolicies, uniqueResourceStates: profile.uniqueResourceStates, paretoWidth: profile.paretoWidth, policyMultiplicity: Number(profile.policyMultiplicity.toFixed(3)), eventOrderHistoryInflation: profile.eventOrderHistoryInflation }])); }
function compactMutationPlan(plan) { return { reasons: plan.reasons, issueFloors: plan.issueFloors, unhandledFloors: plan.unhandledFloors, policyMultiplicityIgnored: plan.policyMultiplicityIgnored, selectedMutationCount: plan.selectedMutationIds.length, selectedMutationIds: plan.selectedMutationIds }; }
function evaluateCandidate(candidate) {
  return withDemoTenFloorCandidate(candidate, catalog, () => {
    const expertReport = runExpertPolicy();
    const quality = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);
    const hpClean = expertReport.purchaseCounts.hp === 0 && expertReport.purchaseLog.every((entry) => entry.optionId !== 'hp');
    const witnessVerified = quality.violations.length === 0 && Boolean(quality.winner?.solvable) && hpClean;
    if (!witnessVerified) return { solvabilityWitnessVerified: false, qualityLoss: 1000 + quality.violations.length, funLoss: 1, editLoss: demoTenFloorCandidateEditLoss(candidate, catalog), prunabilityEvidence: {}, compact: { qualityViolations: quality.violations, expertSolvable: expertReport.solvable, hpClean } };
    const diagnosticReports = diagnosticSpecs.map(runDiagnosticPolicy);
    const checkpoints = summarizeDemoTenFloorCheckpoints([expertReport, ...diagnosticReports], { policySpecs: [expertSpec, ...diagnosticSpecs] });
    const mutationPlan = proposeDemoTenFloorAdaptiveMutations(checkpoints, catalog);
    return { solvabilityWitnessVerified: true, qualityLoss: demoTenFloorExpertLoss(quality, DEMO10_EXPERT_TARGETS) / 50, funLoss: checkpoints.choiceLoss, editLoss: demoTenFloorCandidateEditLoss(candidate, catalog), prunabilityEvidence: checkpoints.prunabilityEvidence, checkpointDiagnostics: checkpoints, mutationPlan, compact: { qualityViolations: quality.violations, expertSolvable: expertReport.solvable, expertMargin: expertReport.minNormalizedHpMargin, expertPurchaseCounts: expertReport.purchaseCounts, expertShopPlan: expertReport.planning?.shopPlan, f9ShopCoverage: quality.f9ShopCoverage, checkpointChoiceLoss: checkpoints.choiceLoss, maxParetoWidth: checkpoints.maxParetoWidth, meanParetoWidth: checkpoints.meanParetoWidth, maxPolicyMultiplicity: checkpoints.maxPolicyMultiplicity, eventOrderHistoryInflationMeasured: checkpoints.eventOrderHistoryInflationMeasured, oversizedCheckpoints: checkpoints.oversizedCheckpoints, collapsedCheckpoints: checkpoints.collapsedCheckpoints, adaptiveMutationPlan: compactMutationPlan(mutationPlan), checkpoints: compactCheckpoint(checkpoints) } };
  });
}
function expandFromEvidence(candidate, _round, parentEvaluation) { const requested = parentEvaluation?.mutationPlan?.selectedMutationIds ?? []; const activeIds = new Set([...(candidate.mutationIds ?? []), ...requested]); return expandDemoTenFloorCandidate(candidate, catalog.filter((mutation) => activeIds.has(mutation.id)), { maxEdits: 2 }); }
const result = runTowerCodesignBeamSearch({ seeds: [{ mutationIds: [] }], expand: expandFromEvidence, evaluate: evaluateCandidate, keyOf: demoTenFloorCandidateKey, beamWidth: 6, rounds: 2, scoreOptions: { qualityWeight: 0.55, funWeight: 0.20, prunabilityWeight: 0.20, editWeight: 0.05, prunabilityOptions: { weights: { paretoWidth: 0.72, historyInflation: 0.28 } } } });
const compactEntry = (entry) => entry ? ({ key: entry.key, mutationIds: entry.candidate.mutationIds, score: entry.score.score, prunabilityScore: entry.score.prunability.score, compact: entry.evaluation.compact }) : null;
console.log('DEMO10_CODESIGN_SEARCH');
console.log(JSON.stringify({ model: result.model, milestone: 'hard-mode-expert-10f', primaryPlayerModel: EXPERT_NO_HP_STRATEGY_ID, frozenExpertWitness: true, heuristicOnly: result.heuristicOnly, productionWriteAllowed: result.productionWriteAllowed, mutationCatalogSize: catalog.length, policyPortfolioSize: diagnosticSpecs.length + 1, qualityPolicyCount: 1, diagnosticPolicyCount: diagnosticSpecs.length, fullDiagnosticPolicyCount, evaluatedCandidates: result.evaluatedCandidates, history: result.history, best: compactEntry(result.best), portfolio: result.portfolio.map(compactEntry) }, null, 2));
if (result.productionWriteAllowed !== false) throw new Error('10F co-design search must never enable production writes.');
if (!result.best || !Number.isFinite(result.best.score.score)) throw new Error('10F co-design search failed to retain any expert-gated candidate.');
