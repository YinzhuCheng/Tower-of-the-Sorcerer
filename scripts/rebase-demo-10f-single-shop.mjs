import { DIALOGUES, ENEMIES, FLOORS, GRID_SIZE } from '../src/game/data.js';
import { applyDemoTenFloorContent } from '../src/game/demo-10-floor-content.js';
import { applyDemoTenFloorHardMode, DEMO10_HARD_ROUTE_PROOF } from '../src/game/demo-10-floor-hard-mode.js';
import { applyDemoTenFloorSpatialRedesign } from '../src/game/demo-10-floor-spatial-redesign.js';
import { applyDemoTenFloorProgressionTopology } from '../src/game/demo-10-floor-progression-topology.js';
import { applyDemoTenFloorPalaceSpatialRedesign } from '../src/game/demo-10-floor-palace-spatial-redesign.js';
import { applyDemoTenFloorProgressionGrammar } from '../src/game/demo-10-floor-progression.js';
import {
  assertDemoTenFloorSolverLocks,
  captureDemoTenFloorSolverLocks
} from '../src/tuner/demo-10-floor-solver-profile.js';

// This is deliberately a small, ordered surface. It only reduces the ordinary
// F3/F4 bridge encounters that stand between the early core pair and F5's sole
// conversion checkpoint. No candidate can modify a Boss, card, gate, stair,
// key relic, core reward, room wall, or shop tier.
const F3_ORDINARY = Object.freeze(['tideLancer', 'whaleSinger', 'shellGuard']);
const F4_ORDINARY = Object.freeze(['swordApprentice', 'swordKnight', 'bladePriestess']);
const F3_SCALES = Object.freeze([0.55, 0.6, 0.65, 0.7, 0.75, 0.8]);
const F4_SCALES = Object.freeze([0.45, 0.5, 0.55, 0.6, 0.65, 0.7]);
const TARGET_MARGIN = 0.12;
const HARD_WINDOW = Object.freeze({ min: 0.04, max: 0.2 });

function numericSnapshot(enemyIds) {
  return Object.fromEntries(enemyIds.map((enemyId) => {
    const enemy = ENEMIES[enemyId];
    return [enemyId, Object.fromEntries(['hp', 'atk', 'def', 'magicPower']
      .filter((field) => Number.isFinite(enemy?.[field]))
      .map((field) => [field, enemy[field]]))];
  }));
}

function restoreSnapshot(snapshot) {
  for (const [enemyId, values] of Object.entries(snapshot)) Object.assign(ENEMIES[enemyId], values);
}

function applyScale(snapshot, enemyIds, scale) {
  for (const enemyId of enemyIds) {
    const baseline = snapshot[enemyId];
    for (const [field, value] of Object.entries(baseline)) {
      ENEMIES[enemyId][field] = Math.max(1, Math.round(value * scale));
    }
  }
}

function installFrozenDemo() {
  applyDemoTenFloorContent({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionTopology({ enemies: ENEMIES, floors: FLOORS });
  applyDemoTenFloorSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
  applyDemoTenFloorProgressionGrammar({ enemies: ENEMIES, floors: FLOORS, dialogues: DIALOGUES });
  applyDemoTenFloorPalaceSpatialRedesign({ floors: FLOORS, gridSize: GRID_SIZE });
}

function compareCandidates(left, right) {
  const marginDelta = Math.abs(left.margin - TARGET_MARGIN) - Math.abs(right.margin - TARGET_MARGIN);
  if (marginDelta !== 0) return marginDelta;
  // If two candidates are equally close to the target, prefer the harder one.
  const hardnessDelta = right.f3Scale + right.f4Scale - left.f3Scale - left.f4Scale;
  if (hardnessDelta !== 0) return hardnessDelta;
  return left.f3Scale - right.f3Scale || left.f4Scale - right.f4Scale;
}

installFrozenDemo();
const originalBridge = numericSnapshot([...F3_ORDINARY, ...F4_ORDINARY]);
applyDemoTenFloorHardMode({ enemies: ENEMIES });
const publishedBridge = numericSnapshot([...F3_ORDINARY, ...F4_ORDINARY]);
const locks = captureDemoTenFloorSolverLocks({ floors: FLOORS, enemies: ENEMIES });
const [{ runGreedyShopStrategy }, { createTowerAdapter }, { replayTowerStepSkeleton }] = await Promise.all([
  import('../src/solver/greedy-strategy.js'),
  import('../src/solver/tower-adapter.js'),
  import('../src/solver/replay.js')
]);

const candidates = [];
try {
  for (const f3Scale of F3_SCALES) {
    for (const f4Scale of F4_SCALES) {
      applyScale(originalBridge, F3_ORDINARY, f3Scale);
      applyScale(originalBridge, F4_ORDINARY, f4Scale);
      assertDemoTenFloorSolverLocks(locks, { floors: FLOORS, enemies: ENEMIES });

      const route = runGreedyShopStrategy({ ...DEMO10_HARD_ROUTE_PROOF, traceActions: true, maxIterations: 8_000 });
      const replay = route.solvable
        ? replayTowerStepSkeleton(route.routeSteps, { adapter: createTowerAdapter(), requireGoal: true })
        : { ok: false, minNormalizedHpMargin: null };
      if (!route.solvable || !replay.ok) continue;
      const margin = replay.minNormalizedHpMargin;
      if (!Number.isFinite(margin) || margin < HARD_WINDOW.min || margin > HARD_WINDOW.max) continue;
      candidates.push({
        f3Scale,
        f4Scale,
        margin,
        steps: route.routeSteps.length,
        final: replay.final.stats,
        bridge: numericSnapshot([...F3_ORDINARY, ...F4_ORDINARY])
      });
    }
  }
} finally {
  restoreSnapshot(publishedBridge);
}

candidates.sort(compareCandidates);
const selected = candidates[0] ?? null;
console.log(JSON.stringify({
  model: 'demo-10f-single-shop-bridge-rebase-v1',
  topologyLocks: 'Bosses, cards, gates, stairs, core rewards and key relics remain invariant.',
  evaluated: F3_SCALES.length * F4_SCALES.length,
  hardWindow: HARD_WINDOW,
  targetMargin: TARGET_MARGIN,
  candidates: candidates.slice(0, 12),
  selected,
  publishedBridge,
  matchesPublished: selected != null && JSON.stringify(selected.bridge) === JSON.stringify(publishedBridge)
}, null, 2));
