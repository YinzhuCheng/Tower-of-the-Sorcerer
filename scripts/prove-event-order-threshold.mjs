import { proveFixedPurchaseEventOrderThreshold } from '../src/analyzer/event-order-threshold-proof.js';
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
const report = proveFixedPurchaseEventOrderThreshold({
  candidate: REVIEW_CANDIDATES.distributedPressureV1,
  maxExpanded: integerFlag('max-expanded', 50_000),
  maxGenerated: integerFlag('max-generated', 400_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const s = report.solver ?? {};
  console.log('Whole-game fixed-purchase event-order threshold proof');
  console.log(`candidate=${report.candidateId} status=${report.status} exploit=${report.exploitFound} exactNoExploit=${report.exactNoExploit}`);
  console.log(`threshold>${report.threshold?.strictGreaterThan} expanded=${s.expandedStates} generated=${s.generatedStates} bound=${s.prunedBound} dominated=${s.prunedDominated} stop=${s.stoppedReason}`);
  if (report.exploitFound) {
    console.log(`EXPLOIT hp=${report.exploit.terminalHp} delta=${report.exploit.deltaHp} replay=${report.exploit.replayOk} cert=${report.exploit.certificateHash}`);
  }
}
