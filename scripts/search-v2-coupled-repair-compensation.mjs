import { searchV2CoupledRepairCompensation } from '../src/tuner/v2-coupled-repair-search.js';

function integerFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

function numberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}

const json = process.argv.includes('--json');
const report = searchV2CoupledRepairCompensation({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12),
  recoveryMaxActiveLabels: integerFlag('recovery-max-active-labels', 50_000),
  minCompensationFloor: integerFlag('min-compensation-floor', 6),
  maxRelativeHardening: numberFlag('max-relative-hardening', 1.50),
  maxFrontierParameters: integerFlag('max-frontier-parameters', 18),
  refineTopK: integerFlag('refine-top-k', 8),
  targetCatastrophicCount: integerFlag('target-catastrophic-count', 4)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`Coupled repair/pressure search: ${report.interpretation}`);
  const repair = report.repairSeed?.reconstructed ?? {};
  console.log(`repair hp=${repair.terminalHp} margin=${repair.minNormalizedHpMargin} local=${repair.localOptimal}`);
  for (const entry of report.compensationFrontier.filter((x) => x.targetReachable).slice(0, 12)) {
    console.log(`frontier ${entry.parameterKey} f${entry.floor} ${entry.originalValue}->${entry.boundaryValue} rel=${entry.relativeEdit} fixedHp=${entry.boundaryReplay?.terminalHp} fixedMargin=${entry.boundaryReplay?.minNormalizedHpMargin}`);
  }
  for (const candidate of report.candidates) {
    console.log(`candidate ${candidate.id} edits=${JSON.stringify(candidate.compensationEdits)} hp=${candidate.terminalHp} margin=${candidate.minNormalizedHpMargin} catastrophic=${candidate.counterfactuals?.catastrophicMutations} unknown=${candidate.recovery?.unknownMutations} local=${candidate.localOptimal} pass=${candidate.localGatePassed}`);
  }
  const selected = report.selected;
  console.log(`selected=${selected?.id ?? null} pass=${selected?.localGatePassed ?? false} edits=${JSON.stringify(selected?.compensationEdits ?? [])} semantic=${selected?.semanticFingerprint ?? null}`);
}
