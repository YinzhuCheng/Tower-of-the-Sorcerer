import { dryRunFinalPressureTuning } from '../src/tuner/final-pressure-tuner.js';

function parseArgs(argv) {
  const config = { json: false, maxExpanded: 5_000, maxGenerated: 50_000 };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg.startsWith('--hp-rewards=')) config.hpRewards = arg.slice('--hp-rewards='.length).split(',').map(Number);
    else if (arg.startsWith('--target-margin=')) config.targetMargin = Number(arg.slice('--target-margin='.length));
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/tune-final-pressure.mjs [options]\n\nOptions:\n  --hp-rewards=900,540,270,180,90\n  --target-margin=0.165\n  --max-expanded=N\n  --max-generated=N\n  --json\n`);
  process.exit(0);
}

const report = dryRunFinalPressureTuning(config);
if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Tuner ${report.model} | target=${(report.targetMargin * 100).toFixed(1)}% | baseline magic=${report.baselineMagicPower}`);
  for (const candidate of report.candidates) {
    const evaluation = candidate.evaluation;
    console.log([
      candidate.id,
      `hp=${candidate.hpReward}`,
      `magic=${candidate.magicPower ?? '-'}`,
      `predicted=${candidate.predictedAfterMagicEdit ? (candidate.predictedAfterMagicEdit.normalizedHpMargin * 100).toFixed(2) + '%' : '-'}`,
      `hard=${evaluation ? (evaluation.acceptedHardConstraints ? 'PASS' : `FAIL:${evaluation.rejection}`) : 'DERIVE_FAIL'}`,
      `actual=${evaluation && Number.isFinite(evaluation.pressure?.minNormalizedHpMargin) ? (evaluation.pressure.minNormalizedHpMargin * 100).toFixed(2) + '%' : '-'}`,
      `finalHP=${evaluation?.route?.final?.hp ?? '-'}`,
      `score=${evaluation && Number.isFinite(evaluation.score) ? evaluation.score.toFixed(4) : 'inf'}`
    ].join(' | '));
  }
  if (report.bestAccepted) console.log(`best: ${report.bestAccepted.id} | score=${report.bestAccepted.evaluation.score.toFixed(4)}`);
}
