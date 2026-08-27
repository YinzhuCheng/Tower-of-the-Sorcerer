import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_MODE_PRESSURE } from '../src/game/demo-10-floor-hard-mode.js';
import { DEMO10_EXPERT_TARGETS, DEMO10_QUALITY_TARGETS, DEMO10_SIMPLE_BUILD_PORTFOLIO, demoTenFloorExpertLoss, demoTenFloorQualityLoss, summarizeDemoTenFloorPortfolio } from '../src/game/demo-10-floor-quality.js';

applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
applyDemoTenFloorHardMode({ enemies: ENEMIES });
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const { runExpertNoHpStrategy } = await import('../src/solver/expert-strategy.js');

const palaceMagicCandidates = [240];
const blackSealMagicCandidates = [250, 260, 270, 280, 290];
const blackSealDefCandidates = [95, 100, 105];
function runSimplePortfolio() { return DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => runGreedyShopStrategy({ shopCycle, holyPolicy: 'immediate', maxIterations: 8_000 })); }
function evaluate(palaceMagicPower, blackSealMagicPower, blackSealDef) {
  ENEMIES.palaceWarden.magicPower = palaceMagicPower;
  ENEMIES.blackSealKeeper.magicPower = blackSealMagicPower;
  ENEMIES.blackSealKeeper.def = blackSealDef;
  const expertReport = runExpertNoHpStrategy({ holyPolicy: 'immediate', maxIterations: 8_000, horizon: 2, attackAdvantageRequired: 2_000 });
  const expert = summarizeDemoTenFloorPortfolio([expertReport], DEMO10_EXPERT_TARGETS);
  const simpleReports = runSimplePortfolio();
  const boundary = summarizeDemoTenFloorPortfolio(simpleReports, DEMO10_QUALITY_TARGETS);
  const hpClean = expertReport.purchaseCounts.hp === 0 && expertReport.purchaseLog.every((entry) => entry.optionId !== 'hp');
  const valid = expert.violations.length === 0 && boundary.violations.length === 0 && hpClean;
  const editDistance = Math.abs(blackSealMagicPower - DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower) / DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower + Math.abs(blackSealDef - DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef) / DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef;
  return { palaceMagicPower, blackSealMagicPower, blackSealDef, valid, hpClean, score: demoTenFloorExpertLoss(expert, DEMO10_EXPERT_TARGETS) + demoTenFloorQualityLoss(boundary, DEMO10_QUALITY_TARGETS) / 20 + editDistance * 2, expert: { solvable: expertReport.solvable, floor: expertReport.floor, hp: expertReport.final.hp, atk: expertReport.final.atk, def: expertReport.final.def, purchases: expertReport.purchases, purchaseCounts: expertReport.purchaseCounts, shopPlan: expertReport.planning?.shopPlan, margin: expertReport.minNormalizedHpMargin, f8BossMeanMargin: expert.lateFloors[8].meanBossMinMargin, f9BossMeanMargin: expert.lateFloors[9].meanBossMinMargin, f10BossMeanMargin: expert.lateFloors[10].meanBossMinMargin, violations: expert.violations, failure: expertReport.failure }, boundary: { solvableBuilds: boundary.solvableBuilds, terminalHpSpread: boundary.terminalHpSpread, bestMargin: boundary.winner?.minNormalizedHpMargin ?? null, weakestMargin: boundary.weakestWinningReport?.minNormalizedHpMargin ?? null, violations: boundary.violations, attempts: simpleReports.map((report) => ({ shopCycle: report.shopCycle.join('-'), solvable: report.solvable, floor: report.floor, hp: report.final.hp, failure: report.failure })) } };
}
const original = { palaceMagicPower: ENEMIES.palaceWarden.magicPower, blackSealMagicPower: ENEMIES.blackSealKeeper.magicPower, blackSealDef: ENEMIES.blackSealKeeper.def };
const candidates = [];
try { for (const palaceMagicPower of palaceMagicCandidates) for (const blackSealMagicPower of blackSealMagicCandidates) for (const blackSealDef of blackSealDefCandidates) candidates.push(evaluate(palaceMagicPower, blackSealMagicPower, blackSealDef)); }
finally { ENEMIES.palaceWarden.magicPower = original.palaceMagicPower; ENEMIES.blackSealKeeper.magicPower = original.blackSealMagicPower; ENEMIES.blackSealKeeper.def = original.blackSealDef; }
candidates.sort((a, b) => Number(b.valid) - Number(a.valid) || a.score - b.score || b.blackSealMagicPower - a.blackSealMagicPower || b.blackSealDef - a.blackSealDef);
const best = candidates[0] ?? null;
console.log('DEMO10_LATE_GAME_TUNER');
console.log(JSON.stringify({ model: 'expert-def-threshold-no-hp-hard-mode-v1', selectedCurrent: original, target: { primaryPlayer: 'DEF-first; ATK only on meaningful downstream thresholds; shop HP forbidden', expertTargets: DEMO10_EXPERT_TARGETS, naiveBoundaryTargets: DEMO10_QUALITY_TARGETS, productionWriteAllowed: false }, recommended: best, topCandidates: candidates.slice(0, 8) }, null, 2));
if (!best) throw new Error('Hard-mode tuner produced no candidates.');
