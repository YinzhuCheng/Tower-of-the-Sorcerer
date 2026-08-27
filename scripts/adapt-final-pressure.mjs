import { adaptFinalPressureCandidate } from '../src/tuner/adaptive-final-pressure.js';

function parseArgs(argv) {
  const config = {
    hpReward: 90,
    targetMargin: 0.165,
    maxOuterIterations: 6,
    maxLocalPasses: 12,
    maxExpanded: 5_000,
    maxGenerated: 50_000,
    json: false
  };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg.startsWith('--hp-reward=')) config.hpReward = Number(arg.slice('--hp-reward='.length));
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

function validate(config) {
  if (!Number.isFinite(config.hpReward) || config.hpReward <= 0) throw new Error('--hp-reward must be a positive number.');
  if (!Number.isFinite(config.targetMargin) || config.targetMargin <= 0 || config.targetMargin >= 1) throw new Error('--target-margin must be between 0 and 1.');
  for (const key of ['maxOuterIterations', 'maxLocalPasses', 'maxExpanded', 'maxGenerated']) {
    if (!Number.isInteger(config[key]) || config[key] <= 0) throw new Error(`${key} must be a positive integer.`);
  }
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/adapt-final-pressure.mjs [options]\n\nOptions:\n  --hp-reward=90\n  --target-margin=0.165\n  --max-outer=6\n  --max-local-passes=12\n  --max-expanded=5000\n  --max-generated=50000\n  --json\n`);
  process.exit(0);
}
validate(config);

const report = adaptFinalPressureCandidate(config);

if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Adaptive tuner ${report.model} | hp=${report.hpReward} | magic=${report.magicPower ?? '-'} | target=${(report.targetMargin * 100).toFixed(1)}%`);
  console.log(`converged=${report.converged === true} | hard=${report.acceptedHardConstraints ? 'PASS' : `FAIL:${report.rejection ?? '-'}`}`);
  for (const iteration of report.iterations ?? []) {
    console.log([
      `iter=${iteration.outer}`,
      `magic=${iteration.magicPower}->${iteration.nextMagicPower}`,
      `terminalHP=${iteration.terminalHp}`,
      `voidMargin=${(iteration.voidCoreMargin * 100).toFixed(2)}%`,
      `minMargin=${(iteration.minNormalizedHpMargin * 100).toFixed(2)}%`,
      `localPasses=${iteration.localImprovementPasses}`,
      `localOptimal=${iteration.localOptimal}`,
      `purchases=${JSON.stringify(iteration.purchaseCounts)}`
    ].join(' | '));
  }
  if (report.route) {
    console.log(`final route: HP=${report.route.final.hp} | minMargin=${(report.route.minNormalizedHpMargin * 100).toFixed(2)}% | purchases=${JSON.stringify(report.route.purchaseCounts)}`);
  }
  if (report.solver) {
    console.log(`existence: solvable=${report.solver.solvable} exact=${report.solver.exact} expanded=${report.solver.expandedStates} generated=${report.solver.generatedStates}`);
  }
  if (report.counterfactuals) {
    console.log(`counterfactuals: recovery=${(report.counterfactuals.recoveryRate * 100).toFixed(1)}% catastrophic=${(report.counterfactuals.catastrophicRate * 100).toFixed(1)}% highRegret=${(report.counterfactuals.highRegretRate * 100).toFixed(1)}% improvements=${report.counterfactuals.improvedMutationCount}`);
  }
}
