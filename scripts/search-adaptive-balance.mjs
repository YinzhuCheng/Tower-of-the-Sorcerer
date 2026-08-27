import { searchAdaptiveBalanceCandidates } from '../src/tuner/adaptive-candidate-search.js';

function parseArgs(argv) {
  const config = { hpRewards: [90, 180, 270], targetMargin: 0.165, maxOuterIterations: 6, maxLocalPasses: 12, maxExpanded: 5_000, maxGenerated: 50_000, json: false };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg.startsWith('--hp-rewards=')) config.hpRewards = arg.slice('--hp-rewards='.length).split(',').map(Number);
    else if (arg.startsWith('--target-margin=')) config.targetMargin = Number(arg.slice('--target-margin='.length));
    else if (arg.startsWith('--max-outer=')) config.maxOuterIterations = Number(arg.slice('--max-outer='.length));
    else if (arg.startsWith('--max-local-passes=')) config.maxLocalPasses = Number(arg.slice('--max-local-passes='.length));
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log('Usage: node scripts/search-adaptive-balance.mjs [--hp-rewards=90,180,270] [--target-margin=.165] [--max-outer=6] [--max-local-passes=12] [--json]');
  process.exit(0);
}
const report = searchAdaptiveBalanceCandidates(config);
if (config.json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Adaptive balance search | target=${(report.targetMargin * 100).toFixed(1)}%`);
  for (const entry of report.candidates) {
    const r = entry.report;
    console.log(`hp=${r.hpReward} magic=${r.magicPower ?? '-'} hard=${r.acceptedHardConstraints ? 'PASS' : `FAIL:${r.rejection}`} converged=${r.converged} margin=${Number.isFinite(r.route?.minNormalizedHpMargin) ? (r.route.minNormalizedHpMargin * 100).toFixed(2)+'%' : '-'} recovery=${Number.isFinite(r.counterfactuals?.recoveryRate) ? (r.counterfactuals.recoveryRate * 100).toFixed(1)+'%' : '-'} catastrophic=${Number.isFinite(r.counterfactuals?.catastrophicRate) ? (r.counterfactuals.catastrophicRate * 100).toFixed(1)+'%' : '-'} score=${Number.isFinite(entry.score) ? entry.score.toFixed(4) : 'inf'}`);
  }
  if (report.bestAccepted) console.log(`best: hp=${report.bestAccepted.report.hpReward} magic=${report.bestAccepted.report.magicPower} score=${report.bestAccepted.score.toFixed(4)}`);
}
