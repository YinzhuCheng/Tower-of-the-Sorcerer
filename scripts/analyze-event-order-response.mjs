import { analyzeFixedPurchaseEventOrder } from '../src/analyzer/event-order-best-response.js';
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
const report = analyzeFixedPurchaseEventOrder({
  candidate: REVIEW_CANDIDATES.distributedPressureV1,
  maxExpanded: integerFlag('max-expanded', 12_000),
  maxGenerated: integerFlag('max-generated', 180_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const solver = report.solver ?? {};
  const exploit = report.exploit ?? {};
  console.log('Fixed-purchase event-order best response');
  console.log(`candidate=${report.candidateId} status=${report.status} exact=${report.coverageExact} exploit=${report.exploitFound}`);
  console.log(`referenceHp=${report.reference?.terminalHp} searchBest=${solver.objective?.searchBest} bestKnown=${solver.objective?.best}`);
  console.log(`expanded=${solver.expandedStates} generated=${solver.generatedStates} stop=${solver.stoppedReason}`);
  if (report.exploitFound) {
    console.log(`EXPLOIT deltaHp=${exploit.deltaHp} relativeGain=${exploit.relativeGain} replay=${exploit.replayOk} cert=${exploit.certificateHash}`);
  }
  const actions = solver.profile?.generatedByAction ?? {};
  console.log(`actions=${Object.entries(actions).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(',')}`);
}
