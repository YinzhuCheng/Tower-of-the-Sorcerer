import { solve } from '../src/solver/search.js';
import { replayTowerCertificate } from '../src/solver/replay.js';
import { createTowerAdapter } from '../src/solver/tower-adapter.js';
import { createBoundedTowerAdapter } from '../src/solver/tower-bounds.js';
import { findBestGreedyIncumbent, findBestKnownIncumbent } from '../src/solver/tower-incumbent.js';

function parseArgs(argv) {
  const config = {
    mode: 'existence',
    maxExpanded: 100_000,
    maxGenerated: 1_000_000,
    seedIncumbent: true,
    json: false
  };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg === '--no-incumbent') config.seedIncumbent = false;
    else if (arg.startsWith('--mode=')) config.mode = arg.slice('--mode='.length);
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

function summarizePortfolio(portfolio) {
  if (!portfolio) return null;
  return {
    attemptedCount: portfolio.attemptedCount,
    feasibleCount: portfolio.feasibleCount,
    best: portfolio.best ? {
      id: portfolio.best.id,
      cycle: portfolio.best.cycle,
      holyPolicy: portfolio.best.holyPolicy,
      holyAcquisition: portfolio.best.result.holyAcquisition,
      witnessType: portfolio.best.witness.type,
      hp: portfolio.best.result.final.hp,
      final: portfolio.best.result.final,
      purchaseCounts: portfolio.best.result.purchaseCounts
    } : null,
    candidates: portfolio.results.map((entry) => ({
      id: entry.id,
      cycle: entry.cycle,
      holyPolicy: entry.holyPolicy,
      solvable: entry.result.solvable,
      hp: entry.result.solvable ? entry.result.final.hp : null,
      failure: entry.result.failure
    }))
  };
}

function summarizeBestKnown(best) {
  if (!best) return null;
  return {
    id: best.id,
    source: best.source,
    hp: best.result.final.hp,
    cycle: best.cycle,
    holyPolicy: best.holyPolicy,
    explicitShopPlan: Boolean(best.shopPlan),
    shopPlan: best.shopPlan ?? null,
    witnessType: best.witness.type,
    purchaseCounts: best.result.purchaseCounts
  };
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/analyze-game.mjs [options]\n\nOptions:\n  --mode=existence|optimize\n  --max-expanded=N\n  --max-generated=N\n  --no-incumbent       Disable authoritative best-known witness in optimize mode\n  --json\n`);
  process.exit(0);
}

const optimizing = config.mode === 'optimize';
const adapter = optimizing ? createBoundedTowerAdapter() : createTowerAdapter();
const portfolio = optimizing && config.seedIncumbent ? findBestGreedyIncumbent() : null;
const known = portfolio ? findBestKnownIncumbent({ portfolio }) : null;
const incumbent = known?.best ?? null;
const incumbentWitness = incumbent?.witness ?? null;
const incumbentValue = incumbent?.result.final.hp ?? null;
const initialUpperBound = optimizing && adapter.objectiveUpperBound
  ? adapter.objectiveUpperBound(adapter.createInitialState())
  : null;

const report = solve({
  adapter,
  mode: config.mode,
  maxExpanded: config.maxExpanded,
  maxGenerated: config.maxGenerated,
  incumbentWitness
});
if (report.certificate) {
  report.certificate.authoritativeReplay = replayTowerCertificate(report.certificate, { adapter });
}
report.optimizationSeed = optimizing ? {
  portfolio: summarizePortfolio(portfolio),
  bestKnown: summarizeBestKnown(incumbent),
  verification: report.incumbentVerification,
  initialUpperBound,
  initialGap: incumbentValue == null || initialUpperBound == null
    ? null
    : initialUpperBound - incumbentValue
} : null;

if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Solver ${report.solverVersion} (${report.mode}) | state=${report.stateEncoding}`);
  if (report.optimizationSeed?.bestKnown) {
    const best = report.optimizationSeed.bestKnown;
    console.log(`incumbent witness: ${best.hp} HP via ${best.id} [source=${best.source}, Holy=${best.holyPolicy}] (${best.witnessType}) | verified=${report.incumbentVerification?.ok === true} | initial upper: ${initialUpperBound} | gap: ${report.optimizationSeed.initialGap}`);
  } else if (optimizing) {
    console.log(`incumbent witness: disabled/unavailable | initial upper: ${initialUpperBound}`);
  }
  console.log(`solvable: ${report.solvable} | exact: ${report.exact} | stopped: ${report.stoppedReason ?? 'exhausted'}`);
  console.log(`expanded: ${report.expandedStates} | generated: ${report.generatedStates} | dominated: ${report.prunedDominated} | bound: ${report.prunedBound}`);
  console.log(`structural states: ${report.structuralStates} | active labels: ${report.activeLabels} | peak frontier: ${report.frontierPeak}`);
  console.log(`depth: ${report.profile.maxDepth} | goal depth: ${report.profile.goalDepth ?? '-'} | queue peak: ${report.profile.queuePeak}`);
  console.log(`branching mean/max: ${report.profile.branching.mean.toFixed(2)}/${report.profile.branching.max} | normalized steps: ${report.profile.normalizationSteps}`);
  console.log(`frontier key chars mean/max: ${report.profile.structuralKeyChars.mean.toFixed(1)}/${report.profile.structuralKeyChars.max}`);
  console.log(`actions: ${JSON.stringify(report.profile.generatedByAction)}`);
  console.log(`stages: ${JSON.stringify(report.profile.expandedByStage)}`);
  if (report.objective.best != null) {
    console.log(`${report.objective.type}: best-known=${report.objective.best} | search=${report.objective.searchBest ?? '-'} | verified-seed=${report.objective.seededLowerBound ?? '-'} | requested=${report.objective.requestedLowerBound ?? '-'}`);
  }
  if (report.certificate) console.log(`certificate: ${report.certificate.certificateHash} | replay: ${report.certificate.authoritativeReplay.ok ? 'PASS' : 'FAIL'}`);
}

if (report.certificate && !report.certificate.authoritativeReplay.ok) process.exitCode = 2;
if (report.solvable === false && report.existenceExact) process.exitCode = 1;
