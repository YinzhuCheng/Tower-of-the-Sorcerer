import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';

// These are discovery policies only. A candidate is accepted later only when
// the full solver creates and authoritatively replays a certificate; a failure
// in any one policy is deliberately not a rejection criterion.
const DISCOVERY_CYCLES = Object.freeze([
  ['atk', 'def', 'hp'],
  ['atk', 'hp', 'def'],
  ['def', 'atk', 'hp'],
  ['def', 'hp', 'atk'],
  ['hp', 'atk', 'def'],
  ['hp', 'def', 'atk']
]);

const DEFAULT_TIERS = Object.freeze({
  f1: Object.freeze([1, 1.2, 1.4, 1.6, 1.7, 1.8, 1.9, 2]),
  f5: Object.freeze([1.15, 1.35, 1.55, 1.75, 1.95, 2.15, 2.2, 2.25, 2.3, 2.5]),
  f9: Object.freeze([1.3, 1.6, 1.9, 2.2, 2.5, 2.75, 2.8, 3])
});

function installFrozenDemo() {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorHardMode({ enemies: ENEMIES });
}

function relativeEdit(tiers, baseline) {
  return Object.keys(tiers).reduce((sum, id) => sum + Math.abs(tiers[id] - baseline[id]) / baseline[id], 0);
}

function summarizeWin(cycle, report) {
  return {
    cycle,
    final: { ...report.final },
    minNormalizedHpMargin: report.minNormalizedHpMargin,
    purchases: report.purchases,
    purchaseCounts: { ...report.purchaseCounts },
    f9Purchases: report.purchaseLog.filter((purchase) => purchase.floor === 9).length
  };
}

installFrozenDemo();
const { runGreedyShopStrategy } = await import('../src/solver/greedy-strategy.js');
const baseline = Object.freeze({
  f1: FLOORS[0].shopEffectMultiplier,
  f5: FLOORS[4].shopEffectMultiplier,
  f9: FLOORS[8].shopEffectMultiplier
});
const candidates = [];

for (const f1 of DEFAULT_TIERS.f1) {
  for (const f5 of DEFAULT_TIERS.f5) {
    for (const f9 of DEFAULT_TIERS.f9) {
      const tiers = { f1, f5, f9 };
      FLOORS[0].shopEffectMultiplier = f1;
      FLOORS[4].shopEffectMultiplier = f5;
      FLOORS[8].shopEffectMultiplier = f9;
      const wins = DISCOVERY_CYCLES.map((cycle) => {
        const report = runGreedyShopStrategy({
          shopCycle: cycle,
          holyPolicy: 'immediate',
          progressionPriority: 'legacy-clear',
          maxIterations: 8_000
        });
        return report.solvable ? summarizeWin(cycle, report) : null;
      }).filter(Boolean);
      if (wins.length) {
        candidates.push({
          tiers,
          editLoss: relativeEdit(tiers, baseline),
          // Difficulty tie-break: retain the least forgiving available seed;
          // this never asks every discovery policy to survive.
          leastForgivingWin: [...wins].sort((a, b) => a.final.hp - b.final.hp)[0],
          discoveryWins: wins
        });
      }
    }
  }
}

FLOORS[0].shopEffectMultiplier = baseline.f1;
FLOORS[4].shopEffectMultiplier = baseline.f5;
FLOORS[8].shopEffectMultiplier = baseline.f9;

candidates.sort((a, b) => a.editLoss - b.editLoss
  || a.leastForgivingWin.final.hp - b.leastForgivingWin.final.hp
  || a.tiers.f1 - b.tiers.f1
  || a.tiers.f5 - b.tiers.f5
  || a.tiers.f9 - b.tiers.f9);

console.log(JSON.stringify({
  model: 'demo-10f-topology-frozen-shop-tier-search-v1',
  baseline,
  evaluated: DEFAULT_TIERS.f1.length * DEFAULT_TIERS.f5.length * DEFAULT_TIERS.f9.length,
  discoveryPolicyCount: DISCOVERY_CYCLES.length,
  candidatesWithAtLeastOneWin: candidates.length,
  candidates: candidates.slice(0, 16)
}, null, 2));
