import { validateDistributedPressureV2 } from '../src/tuner/review-candidate-v2-validation.js';

function integerFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const json = process.argv.includes('--json');
const report = validateDistributedPressureV2({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12),
  existenceMaxExpanded: integerFlag('existence-max-expanded', 10_000),
  existenceMaxGenerated: integerFlag('existence-max-generated', 120_000),
  eventOrderMaxExpanded: integerFlag('event-order-max-expanded', 50_000),
  eventOrderMaxGenerated: integerFlag('event-order-max-generated', 400_000)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const cf = report.counterfactuals ?? {};
  const eo = report.eventOrder ?? {};
  console.log(`V2 status=${report.status} hp=${report.reference?.terminalHp} margin=${report.reference?.minNormalizedHpMargin} witness=${report.reference?.referenceWitnessHash}`);
  console.log(`EXISTENCE solvable=${report.existence?.solvable} exact=${report.existence?.exact} replay=${report.existence?.replayOk} expanded=${report.existence?.expandedStates} generated=${report.existence?.generatedStates}`);
  console.log(`HOLY complete=${report.holyCoverage?.coverageComplete} delayedProven=${(report.holyCoverage?.delayedPoliciesProvenInfeasible ?? []).join(',')}`);
  console.log(`ROBUST recovery=${cf.recoveryRate} catastrophic=${cf.catastrophicRate} regret=${cf.highRegretRate} improvements=${cf.improvedMutationCount}`);
  console.log(`EVENT_ORDER status=${eo.status} exploit=${eo.exploitFound} exactNo=${eo.exactNoExploit} expanded=${eo.solver?.expandedStates} generated=${eo.solver?.generatedStates} hp=${eo.exploit?.terminalHp} delta=${eo.exploit?.deltaHp}`);
  console.log(`FAILURES ${report.failures.join(',') || 'none'}`);
}
