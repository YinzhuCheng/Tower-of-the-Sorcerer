import { searchV2LocalizedRepairs } from '../src/tuner/v2-localized-repair-search.js';

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
const report = searchV2LocalizedRepairs({
  maxPurchasePasses: integerFlag('max-purchase-passes', 12),
  recoveryMaxActiveLabels: integerFlag('recovery-max-active-labels', 50_000),
  maxRelativeSoftening: numberFlag('max-relative-softening', 0.50),
  minimumRescuesPerCluster: integerFlag('minimum-rescues-per-cluster', 1),
  minimumTotalRescues: integerFlag('minimum-total-rescues', 2),
  targetCatastrophicCount: integerFlag('target-catastrophic-count', 4),
  maxCandidateCombinations: integerFlag('max-candidate-combinations', 12),
  refineTopK: integerFlag('refine-top-k', 4)
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`V2 localized repair: ${report.interpretation}`);
  console.log(`baseline hp=${report.baseline.replay.terminalHp} margin=${report.baseline.replay.minNormalizedHpMargin} catastrophic=${report.baseline.counterfactuals.catastrophicMutations}/${report.baseline.counterfactuals.totalMutations}`);
  for (const frontier of report.frontiers) {
    console.log(`cluster ${frontier.cluster.enemyId} event=${frontier.cluster.eventId} size=${frontier.cluster.size}`);
    for (const field of frontier.fields) {
      const thresholds = field.thresholds.map((entry) => `${entry.targetRescues}:${entry.originalValue}->${entry.edit.value}`).join(', ');
      console.log(`  ${field.field} ${thresholds || 'no rescue boundary'}`);
    }
  }
  for (const candidate of report.refinedCandidates) {
    const r = candidate.refinement ?? {};
    console.log(`candidate ${candidate.id} edits=${JSON.stringify(candidate.repairEdits)} cost=${candidate.relativeEdit.toFixed(4)} hp=${r.bestTerminalHp ?? null} margin=${r.minNormalizedHpMargin ?? null} catastrophic=${r.counterfactuals?.catastrophicMutations ?? null} local=${r.localOptimal ?? null} pass=${r.localGatePassed ?? false}`);
  }
  const selected = report.selected;
  console.log(`selected=${selected?.id ?? null} pass=${selected?.refinement?.localGatePassed ?? false} edits=${JSON.stringify(selected?.repairEdits ?? [])}`);
}
