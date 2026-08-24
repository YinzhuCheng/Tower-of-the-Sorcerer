import { solve } from '../src/solver/search.js';
import { replayTowerCertificate } from '../src/solver/replay.js';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';

function parseArgs(argv) {
  const config = { mode: 'existence', maxExpanded: 100_000, maxGenerated: 1_000_000, json: false };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg.startsWith('--mode=')) config.mode = arg.slice('--mode='.length);
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/analyze-game.mjs [options]\n\nOptions:\n  --mode=existence|optimize\n  --max-expanded=N\n  --max-generated=N\n  --json\n`);
  process.exit(0);
}

const adapter = createTowerAdapter();
const report = solve({ adapter, ...config });
if (report.certificate) {
  report.certificate.authoritativeReplay = replayTowerCertificate(report.certificate, { adapter });
}

if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Solver ${report.solverVersion} (${report.mode}) | state=${report.stateEncoding}`);
  console.log(`solvable: ${report.solvable} | exact: ${report.exact} | stopped: ${report.stoppedReason ?? 'exhausted'}`);
  console.log(`expanded: ${report.expandedStates} | generated: ${report.generatedStates} | dominated: ${report.prunedDominated} | bound: ${report.prunedBound}`);
  console.log(`structural states: ${report.structuralStates} | active labels: ${report.activeLabels} | peak frontier: ${report.frontierPeak}`);
  console.log(`depth: ${report.profile.maxDepth} | goal depth: ${report.profile.goalDepth ?? '-'} | queue peak: ${report.profile.queuePeak}`);
  console.log(`branching mean/max: ${report.profile.branching.mean.toFixed(2)}/${report.profile.branching.max} | normalized steps: ${report.profile.normalizationSteps}`);
  console.log(`structural key chars mean/max: ${report.profile.structuralKeyChars.mean.toFixed(1)}/${report.profile.structuralKeyChars.max}`);
  console.log(`actions: ${JSON.stringify(report.profile.generatedByAction)}`);
  console.log(`stages: ${JSON.stringify(report.profile.expandedByStage)}`);
  if (report.objective.best != null) console.log(`${report.objective.type}: ${report.objective.best}`);
  if (report.certificate) console.log(`certificate: ${report.certificate.certificateHash} | replay: ${report.certificate.authoritativeReplay.ok ? 'PASS' : 'FAIL'}`);
}

if (report.certificate && !report.certificate.authoritativeReplay.ok) process.exitCode = 2;
if (report.solvable === false && report.existenceExact) process.exitCode = 1;
