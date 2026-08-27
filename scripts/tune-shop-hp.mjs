import { dryRunShopHpTuning } from '../src/tuner/shop-hp-tuner.js';

function parseArgs(argv) {
  const config = { json: false, maxExpanded: 5_000, maxGenerated: 50_000 };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg.startsWith('--multipliers=')) {
      config.multipliers = arg.slice('--multipliers='.length).split(',').map(Number);
    } else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/tune-shop-hp.mjs [options]\n\nOptions:\n  --multipliers=1,.8,.6,.45,.3,.2,.1\n  --max-expanded=N\n  --max-generated=N\n  --json\n`);
  process.exit(0);
}

const report = dryRunShopHpTuning(config);
if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Tuner ${report.model} | dryRun=${report.dryRun} | baseline=${report.baseline}`);
  for (const candidate of report.candidates) {
    const evaluation = candidate.evaluation;
    const margin = evaluation.pressure?.minNormalizedHpMargin;
    console.log([
      candidate.id,
      `value=${candidate.value}`,
      `hard=${evaluation.acceptedHardConstraints ? 'PASS' : `FAIL:${evaluation.rejection}`}`,
      `margin=${Number.isFinite(margin) ? (margin * 100).toFixed(2) + '%' : '-'}`,
      `pressure=${evaluation.pressure?.status ?? '-'}`,
      `finalHP=${evaluation.route?.final?.hp ?? '-'}`,
      `expanded=${evaluation.solver?.expandedStates ?? '-'}`,
      `score=${Number.isFinite(evaluation.score) ? evaluation.score.toFixed(4) : 'inf'}`
    ].join(' | '));
  }
  if (report.bestAccepted) {
    console.log(`best: ${report.bestAccepted.id} | value=${report.bestAccepted.value} | score=${report.bestAccepted.evaluation.score.toFixed(4)}`);
  }
}
