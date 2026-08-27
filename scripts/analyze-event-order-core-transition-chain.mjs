import { analyzeEventOrderJointBestResponse } from '../src/analyzer/event-order-joint-best-response.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function integerFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const json = process.argv.includes('--json');
const fromCores = integerFlag('from-cores', 6);
const joint = analyzeEventOrderJointBestResponse({
  candidate: REVIEW_CANDIDATES.distributedPressureV1,
  fromCores,
  toCores: integerFlag('to-cores', fromCores + 1),
  boundaryMaxExpanded: integerFlag('boundary-max-expanded', 8_000),
  boundaryMaxGenerated: integerFlag('boundary-max-generated', 100_000),
  boundaryMaxGoals: integerFlag('boundary-max-goals', 64),
  maxTransitionSeeds: integerFlag('max-transition-seeds', 8),
  transitionMaxExpanded: integerFlag('transition-max-expanded', 5_000),
  transitionMaxGenerated: integerFlag('transition-max-generated', 70_000),
  suffixMaxExpanded: integerFlag('suffix-max-expanded', 8_000),
  suffixMaxGenerated: integerFlag('suffix-max-generated', 100_000),
  maxPurchasePasses: integerFlag('max-purchase-passes', 12)
});

// Preserve the existing chain report shape so CI/history tooling remains
// comparable, and append the stronger joint-local player response.
const report = {
  ...joint.chain,
  jointPurchaseResponse: joint.jointPurchaseResponse,
  bestKnownTerminalHp: joint.bestKnownTerminalHp,
  improvementOverReference: joint.improvementOverReference,
  jointInterpretation: joint.interpretation
};

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const bridge = report.bridge ?? {};
  const suffix = report.suffix?.solver ?? {};
  const local = report.jointPurchaseResponse ?? {};
  console.log('Threshold core-transition certificate chain + purchase 1-opt');
  console.log(`candidate=${report.candidateId} transition=c${report.fromCores}->c${report.toCores} status=${report.status} exploit=${report.exploitFound} exactNoExploit=${report.exactNoExploit}`);
  console.log(`bridge cores=${bridge.cores} hp=${bridge.resources?.hp} gold=${bridge.resources?.gold} p=${bridge.shopPurchases} ub=${bridge.optimisticTerminalHpUpperBound}`);
  console.log(`suffix solvable=${suffix.solvable} exact=${suffix.exact} expanded=${suffix.expandedStates} generated=${suffix.generatedStates} stop=${suffix.stoppedReason}`);
  console.log(`exploit hp=${report.exploit?.terminalHp ?? null} delta=${report.exploit?.deltaHp ?? null} replay=${report.exploit?.replayOk ?? null}`);
  console.log(`joint seedHp=${local.seedTerminalHp ?? null} bestHp=${local.bestTerminalHp ?? null} improvement=${local.totalImprovement ?? null} passes=${local.improvementPasses ?? null} localOptimal=${local.localOptimal ?? null}`);
}
