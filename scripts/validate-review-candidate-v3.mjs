import { validateDistributedPressureV3 } from '../src/tuner/review-candidate-v3-validation.js';

function integerFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const json = process.argv.includes('--json');
const report = validateDistributedPressureV3({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12),
  existenceMaxExpanded: integerFlag('existence-max-expanded', 10_000),
  existenceMaxGenerated: integerFlag('existence-max-generated', 120_000),
  eventOrderMaxExpanded: integerFlag('event-order-max-expanded', 50_000),
  eventOrderMaxGenerated: integerFlag('event-order-max-generated', 400_000),
  recoveryMaxActiveLabels: integerFlag('recovery-max-active-labels', 50_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const eo = report.eventOrder ?? {};
  console.log(`V3 status=${report.status} failures=${report.failures.join(',') || 'none'}`);
  console.log(`reference hp=${report.reference?.terminalHp} margin=${report.reference?.minNormalizedHpMargin}`);
  console.log(`existence solvable=${report.existence?.solvable} exact=${report.existence?.exact} stop=${report.existence?.stoppedReason}`);
  console.log(`counterfactual catastrophic=${report.counterfactuals?.catastrophicMutations}/${report.counterfactuals?.totalMutations} improved=${report.counterfactuals?.improvedMutationCount}`);
  console.log(`recovery exactUnrecoverable=${report.recoveryAwareCounterfactuals?.exactUnrecoverableMutations} unknown=${report.recoveryAwareCounterfactuals?.unknownMutations}`);
  console.log(`eventOrder status=${eo.status} exploit=${eo.exploitFound} exactNo=${eo.exactNoExploit}`);
}
