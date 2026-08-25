import { analyzeThresholdCoreTransitionChain } from '../src/analyzer/event-order-core-transition-chain.js';
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
const report = analyzeThresholdCoreTransitionChain({
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
  suffixMaxGenerated: integerFlag('suffix-max-generated', 100_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const bridge = report.bridge ?? {};
  const suffix = report.suffix?.solver ?? {};
  console.log('Threshold core-transition certificate chain');
  console.log(`candidate=${report.candidateId} transition=c${report.fromCores}->c${report.toCores} status=${report.status} exploit=${report.exploitFound} exactNoExploit=${report.exactNoExploit}`);
  console.log(`bridge cores=${bridge.cores} hp=${bridge.resources?.hp} gold=${bridge.resources?.gold} p=${bridge.shopPurchases} ub=${bridge.optimisticTerminalHpUpperBound}`);
  console.log(`suffix solvable=${suffix.solvable} exact=${suffix.exact} expanded=${suffix.expandedStates} generated=${suffix.generatedStates} stop=${suffix.stoppedReason}`);
  console.log(`exploit hp=${report.exploit?.terminalHp ?? null} delta=${report.exploit?.deltaHp ?? null} replay=${report.exploit?.replayOk ?? null}`);
}
