import { analyzeDifficultyV2 } from '../src/analyzer/difficulty-v2.js';
import { analyzeSinglePurchaseCounterfactuals } from '../src/analyzer/purchase-counterfactuals.js';
import { solve } from '../src/solver/search.js';
import { createBoundedTowerAdapter } from '../src/solver/tower-bounds.js';
import { findBestGreedyIncumbent, findBestKnownIncumbent } from '../src/solver/tower-incumbent.js';

function parseArgs(argv) {
  const config = {
    withSolver: false,
    maxExpanded: 2_000,
    maxGenerated: 40_000,
    json: false
  };
  for (const arg of argv) {
    if (arg === '--with-solver') config.withSolver = true;
    else if (arg === '--json') config.json = true;
    else if (arg.startsWith('--max-expanded=')) config.maxExpanded = Number(arg.slice('--max-expanded='.length));
    else if (arg.startsWith('--max-generated=')) config.maxGenerated = Number(arg.slice('--max-generated='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return config;
}

function pct(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : '-';
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log(`Usage: node scripts/analyze-difficulty.mjs [options]\n\nOptions:\n  --with-solver        Include bounded optimize telemetry for C\n  --max-expanded=N     Solver expansion cap (default 2000)\n  --max-generated=N    Solver generation cap (default 40000)\n  --json\n`);
  process.exit(0);
}

const portfolio = findBestGreedyIncumbent();
const known = findBestKnownIncumbent({ portfolio });
const representativeEntry = known.best;
const counterfactuals = analyzeSinglePurchaseCounterfactuals({ bestEntry: representativeEntry });
let solverReport = null;
if (config.withSolver) {
  const adapter = createBoundedTowerAdapter();
  solverReport = solve({
    adapter,
    mode: 'optimize',
    incumbentWitness: representativeEntry.witness,
    maxExpanded: config.maxExpanded,
    maxGenerated: config.maxGenerated
  });
}

const report = analyzeDifficultyV2({
  portfolio,
  representativeEntry,
  counterfactuals,
  solverReport
});

if (config.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const { P, R, W, T, F, V, K, C } = report.dimensions;
  console.log(`Difficulty ${report.model} | provisional=${report.provisional}`);
  console.log(`representative: ${report.representative.strategyId} [${report.representative.source}] | HP=${report.representative.terminalHp} | Holy=${report.representative.holyPolicy}`);
  console.log(`P pressure: min=${pct(P.minNormalizedHpMargin)} p10=${pct(P.p10NormalizedHpMargin)} status=${P.status}`);
  if (P.tightestBattle) {
    console.log(`  tightest battle: F${P.tightestBattle.floor} ${P.tightestBattle.enemyId} | damage=${P.tightestBattle.totalDamage}/${P.tightestBattle.hpBefore}`);
  }
  console.log(`R single-purchase regret: high=${pct(R.highRegretStrategyRate)} median=${pct(R.medianNormalizedRegret)} p90=${pct(R.p90NormalizedRegret)} 1-opt=${R.locallyOneOptimal}`);
  console.log(`W portfolio width proxy: N_eff=${Number.isFinite(W.effectiveStrategyCount) ? W.effectiveStrategyCount.toFixed(2) : '-'} coverage=${pct(W.bestKnownCoverageRatio)} sufficient=${W.coverageSufficientForNearOptimalClaims}`);
  console.log(`T single-purchase trap: catastrophic=${pct(T.catastrophicStrategyRate)} high-regret=${pct(T.highRegretStrategyRate)}`);
  console.log(`F single-purchase forgiveness: recovery=${pct(F.policyRecoveryRate)} min-retention=${pct(F.minTerminalHpRetention)}`);
  console.log(`V portfolio proxy: near-opt=${V.nearOptimalStrategyCount ?? '-'} min-distance=${Number.isFinite(V.minNearOptimalRouteDistance) ? V.minNearOptimalRouteDistance.toFixed(3) : '-'} coverage=${pct(V.bestKnownCoverageRatio)}`);
  console.log(`K knowledge: ${K.measured ? 'measured' : 'not measured'}`);
  console.log(`C complexity: ${C.measured ? `expanded=${C.expandedStates} generated=${C.generatedStates} queue=${C.queuePeak}` : 'not measured (use --with-solver)'}`);
  console.log(`provisional loss: ${report.provisionalLoss.total.toFixed(3)} ${JSON.stringify(report.provisionalLoss.terms)} excluded=${JSON.stringify(report.provisionalLoss.excluded)}`);
  console.log(`diagnostics: ${report.diagnostics.length ? '' : 'none'}`);
  for (const diagnostic of report.diagnostics) {
    console.log(`  [${diagnostic.dimension}] ${diagnostic.code}: ${diagnostic.message}`);
  }
}
