import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

const OPTIONS = Object.freeze(['atk', 'def', 'hp']);

function parseArgs(argv) {
  const config = { purchases: 5, limit: 5_000, compositions: false, multipliers: {}, cycle: null, json: false };
  for (const arg of argv) {
    if (arg === '--json') config.json = true;
    else if (arg === '--compositions') config.compositions = true;
    else if (arg.startsWith('--multiplier=')) {
      const [floorText, multiplierText] = arg.slice('--multiplier='.length).split(':');
      const floor = Number(floorText);
      const multiplier = Number(multiplierText);
      if (!Number.isInteger(floor) || floor < 1 || floor > 10 || !Number.isFinite(multiplier) || multiplier <= 0) {
        throw new Error('--multiplier must use FLOOR:POSITIVE_NUMBER, e.g. --multiplier=5:1.4.');
      }
      config.multipliers[floor] = multiplier;
    }
    else if (arg.startsWith('--cycle=')) {
      const cycle = arg.slice('--cycle='.length).split(',').filter(Boolean);
      if (!cycle.length || cycle.some((option) => !OPTIONS.includes(option))) {
        throw new Error('--cycle must be a comma-separated non-empty subset of atk,def,hp.');
      }
      config.cycle = cycle;
    }
    else if (arg.startsWith('--purchases=')) config.purchases = Number(arg.slice('--purchases='.length));
    else if (arg.startsWith('--limit=')) config.limit = Number(arg.slice('--limit='.length));
    else if (arg === '--help') config.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(config.purchases) || config.purchases < 1 || config.purchases > 12) {
    throw new Error('--purchases must be an integer from 1 to 12.');
  }
  if (!Number.isInteger(config.limit) || config.limit < 1) throw new Error('--limit must be a positive integer.');
  return config;
}

function installFrozenDemo() {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies: ENEMIES });
}

function plansOfLength(length, prefix = []) {
  if (prefix.length === length) return [prefix];
  return OPTIONS.flatMap((option) => plansOfLength(length, [...prefix, option]));
}

// A shop is a single uninterrupted interaction: once the player reaches it,
// no combat or map event happens between purchases. For a fixed shop visit,
// only the count of ATK/DEF/HP purchases matters. This compressed probe is a
// policy search aid, not a replacement for the full movement solver.
function compositionPlans(length) {
  const output = [];
  for (let atk = 0; atk <= length; atk += 1) {
    for (let def = 0; def <= length - atk; def += 1) {
      const hp = length - atk - def;
      output.push([
        ...Array(atk).fill('atk'),
        ...Array(def).fill('def'),
        ...Array(hp).fill('hp')
      ]);
    }
  }
  return output;
}

function compressedPlans(length) {
  // The frozen demo's first six purchases happen at F1 and the next six at
  // F5. Retaining that boundary avoids falsely treating two separate resource
  // conversion moments as interchangeable.
  if (length !== 12) return compositionPlans(length);
  const early = compositionPlans(6);
  const middle = compositionPlans(6);
  return early.flatMap((beforeF5) => middle.map((atF5) => [...beforeF5, ...atF5]));
}

function score(report) {
  return (report.solvable ? 1e15 : 0)
    + Number(report.floor ?? 0) * 1e12
    + Number(report.cores ?? 0) * 1e10
    + Number(report.battles ?? 0) * 1e7
    + Number(report.final?.hp ?? 0);
}

const config = parseArgs(process.argv.slice(2));
if (config.help) {
  console.log('Usage: node scripts/probe-demo-10f-shop-prefixes.mjs [--purchases=N] [--limit=N] [--compositions] [--cycle=atk,hp,def] [--multiplier=5:1.4] [--json]');
  process.exit(0);
}
installFrozenDemo();
for (const [floorNumber, multiplier] of Object.entries(config.multipliers)) {
  FLOORS[Number(floorNumber) - 1].shopEffectMultiplier = multiplier;
}
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const candidates = (config.cycle
  ? [null]
  : (config.compositions
    ? compressedPlans(config.purchases)
    : plansOfLength(config.purchases))).slice(0, config.limit);
const reports = candidates.map((shopPlan) => ({
  shopPlan,
  report: runGreedyShopStrategy({
    shopPlan,
    shopCycle: config.cycle ?? ['def'],
    holyPolicy: 'immediate',
    progressionPriority: 'legacy-clear',
    maxIterations: 8_000
  })
}));
reports.sort((a, b) => score(b.report) - score(a.report)
  || b.report.final.hp - a.report.final.hp
  || a.shopPlan.join('').localeCompare(b.shopPlan.join('')));
const summary = {
  model: 'adaptive-shop-prefix-probe-v1',
  purchases: config.purchases,
  compressedByShopVisit: config.compositions,
  numericOverlay: Object.fromEntries(Object.entries(config.multipliers).map(([floor, multiplier]) => [`f${floor}`, multiplier])),
  cycle: config.cycle,
  attempted: reports.length,
  winners: reports.filter(({ report }) => report.solvable).length,
  best: reports.slice(0, 12).map(({ shopPlan, report }) => ({
    shopPlan,
    solvable: report.solvable,
    floor: report.floor,
    cores: report.cores,
    hp: report.final.hp,
    atk: report.final.atk,
    def: report.final.def,
    purchaseLog: report.purchaseLog.map((purchase) => ({
      purchase: purchase.purchase,
      floor: purchase.floor,
      optionId: purchase.optionId,
      cost: purchase.cost
    })),
    failure: report.failure
  }))
};
console.log(config.json ? JSON.stringify(summary, null, 2) : JSON.stringify(summary));
