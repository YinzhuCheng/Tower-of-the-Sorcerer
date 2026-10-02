import { getAct3Charter, isAct3CharterCompleted } from '../game/act3-charters.js';
import { ACT3_HANDOFFS, getAct3Handoff, getSelectedAct3Handoff } from '../game/act3-handoff-priorities.js';
import { FLOORS } from '../game/data.js';
import { replayTowerStepSkeletonToState } from '../solver/replay.js';
import { deriveRouteInsights } from '../solver/route-insights.js';
import { runDemoThirtyFloorMilestones } from './demo-30-floor-milestone-solver.js';

export const DEMO30_CHARTER_IDS = Object.freeze(['shelter', 'audit', 'relay']);
export const DEMO30_HANDOFF_IDS = Object.freeze(ACT3_HANDOFFS.map((handoff) => handoff.id));
export const DEMO30_HANDOFF_ROUTE_SPECS = Object.freeze([
  Object.freeze({ id: 'shelter-proofread', charterId: 'shelter', handoffId: 'proofread' }),
  Object.freeze({ id: 'audit-beacon', charterId: 'audit', handoffId: 'beacon' }),
  Object.freeze({ id: 'relay-escort', charterId: 'relay', handoffId: 'escort' })
]);

// The release portfolio intentionally proves three authored high-pressure
// combinations.  The full matrix is a diagnostic, not a release gate: some
// combinations are allowed to be harsher or even fail, as long as the result
// is visible to authors rather than being mistaken for an untested route.
export const DEMO30_HANDOFF_DECISION_MATRIX_SPECS = Object.freeze(
  DEMO30_CHARTER_IDS.flatMap((charterId) => DEMO30_HANDOFF_IDS.map((handoffId) => Object.freeze({
    id: `${charterId}-${handoffId}`,
    charterId,
    handoffId
  })))
);

const CHARTER_DEADLINE_FLOOR = Object.freeze({ shelter: 21, audit: 22, relay: 23 });

function strategicDecisionsFrom(result) {
  const seen = new Set();
  return Object.freeze((result?.milestones ?? [])
    .flatMap((stage) => stage.actionOrdering?.strategicDecisionSamples ?? [])
    .filter((note) => note.critical === true)
    .filter((note) => {
      const key = `${note.stage}:${note.selectedEventId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map((note) => Object.freeze(note)));
}

function mapPathExists(map, start, target, blockedKey = null) {
  if (!map?.length || !start || !target) return false;
  const width = map[0]?.length ?? 0;
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    if (point.x === target.x && point.y === target.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = point.x + dx;
      const y = point.y + dy;
      const key = `${x},${y}`;
      if (x < 0 || y < 0 || x >= width || y >= map.length || key === blockedKey || seen.has(key) || map[y][x] === '#') continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return false;
}

function findMapTokens(map, predicate) {
  const found = [];
  for (let y = 0; y < (map?.length ?? 0); y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      if (predicate(map[y][x])) found.push({ x, y });
    }
  }
  return found;
}

function mapDistances(map, start) {
  const distance = new Map();
  if (!map?.length || !start) return distance;
  const width = map[0]?.length ?? 0;
  const queue = [start];
  distance.set(`${start.x},${start.y}`, 0);
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    const here = distance.get(`${point.x},${point.y}`) ?? 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = point.x + dx;
      const y = point.y + dy;
      const key = `${x},${y}`;
      if (x < 0 || y < 0 || x >= width || y >= map.length || distance.has(key) || map[y][x] === '#') continue;
      distance.set(key, here + 1);
      queue.push({ x, y });
    }
  }
  return distance;
}

function progressTargets(map, floor) {
  return [
    ...findMapTokens(map, (token) => token === 'U'),
    ...findMapTokens(map, (token) => (floor?.exitGuardians ?? []).some((id) => token === `enemy:${id}`)),
    // F30 deliberately has no exit stair. Its two-phase arena is therefore
    // the terminal target for corridor detection.
    ...findMapTokens(map, (token) => token === 'enemy:archiveWarden' || token === 'enemy:errataCore')
  ];
}

/** This keeps a bounded proof route narrow without deleting a battle that is
 * physically required to reach this floor's stair *or its still-living exit
 * guardian*.  The check reads the current map, so a defeated guardian no
 * longer drags dead branches into later stages. */
function isProgressChokepoint(state, action) {
  const map = state?.floorStates?.[state.floor]?.map;
  const floor = FLOORS[state?.floor];
  if (!map || !floor || action.x == null || action.y == null) return false;
  const blockedKey = `${action.x},${action.y}`;
  const targets = progressTargets(map, floor);
  return targets.some((target) => {
    if (!mapPathExists(map, { x: state.x, y: state.y }, target)) return false;
    return !mapPathExists(map, { x: state.x, y: state.y }, target, blockedKey);
  });
}

function isProgressRouteEnemy(state, action) {
  const map = state?.floorStates?.[state.floor]?.map;
  const floor = FLOORS[state?.floor];
  if (!map || !floor || action.x == null || action.y == null) return false;
  const origin = { x: state.x, y: state.y };
  const fromOrigin = mapDistances(map, origin);
  const here = fromOrigin.get(`${action.x},${action.y}`);
  if (!Number.isFinite(here)) return false;
  const targets = progressTargets(map, floor);
  return targets.some((target) => {
    const targetDistance = fromOrigin.get(`${target.x},${target.y}`);
    const fromTarget = mapDistances(map, target).get(`${action.x},${action.y}`);
    return Number.isFinite(targetDistance) && Number.isFinite(fromTarget) && here + fromTarget === targetDistance;
  });
}

/** Restricts only the irreversible F21 macro.  All tile actions, battle
 * tiers, shop choices and the normalizer remain the authoritative adapter's
 * own logic, which means a completed portfolio is a genuine gameplay proof. */
export function createCharterRouteAdapter(baseAdapter, charterId) {
  const charter = getAct3Charter(charterId);
  if (!charter) throw new Error(`Unknown Act III charter '${charterId}'.`);
  return {
    ...baseAdapter,
    enumerateActions(state) {
      const engineState = baseAdapter.materializeState(state);
      const actions = baseAdapter.enumerateActions(state).filter((action) => {
        if (action.kind === 'charter') return action.charterId === charterId;
        if (engineState.floor < 20 || action.kind !== 'tile' || action.parsed?.type !== 'enemy') return true;
        const floor = FLOORS[engineState.floor];
        const isExitGuardian = (floor?.exitGuardians ?? []).includes(action.parsed.id);
        const inCharterAnnex = !isAct3CharterCompleted(engineState, charterId)
          && floor?.number === CHARTER_DEADLINE_FLOOR[charterId] + 1;
        const enemy = action.parsed.id;
        return Boolean(isExitGuardian || inCharterAnnex || isProgressChokepoint(engineState, action)
          || isProgressRouteEnemy(engineState, action)
          || ['archiveWarden', 'errataCore'].includes(enemy));
      });
      if (isAct3CharterCompleted(engineState, charterId)) return actions;
      const gate = actions.find((action) => action.kind === 'tile' && action.token === `gate:${charter.gateId}`);
      if (gate) return [gate];
      if (engineState.floor >= CHARTER_DEADLINE_FLOOR[charterId]) {
        return actions.filter((action) => !(action.kind === 'tile' && action.token === 'U'));
      }
      return actions;
    },
    isGoal(state) {
      const engineState = baseAdapter.materializeState(state);
      return isAct3CharterCompleted(engineState, charterId) && baseAdapter.isGoal(state);
    },
    stageKey(state) {
      return `${baseAdapter.stageKey?.(state) ?? 'all'}/charter:${charterId}`;
    },
    searchHeuristic(state) {
      const engineState = baseAdapter.materializeState(state);
      return (baseAdapter.searchHeuristic?.(state) ?? 0)
        + (engineState.charter?.selectedId === charterId ? 4e10 : 0)
        + (isAct3CharterCompleted(engineState, charterId) ? 9e10 : 0)
        + engineState.floor * 1e8;
    }
  };
}

/** The player chooses this axis by combat order, not through a solver-only
 * switch.  This adapter merely asks the proof to demonstrate one named first
 * guardian; tile travel, damage and every remaining fight stay authoritative. */
export function createHandoffRouteAdapter(baseAdapter, handoffId) {
  const handoff = getAct3Handoff(handoffId);
  if (!handoff) throw new Error(`Unknown Act III handoff '${handoffId}'.`);
  const priorityEnemyIds = new Set(ACT3_HANDOFFS.map((entry) => entry.triggerEnemyId));
  return {
    ...baseAdapter,
    enumerateActions(state) {
      const engineState = baseAdapter.materializeState(state);
      const actions = baseAdapter.enumerateActions(state);
      if (engineState.floor !== 26 || engineState.handoff?.selectedId || engineState.handoff?.legacyOpen) return actions;
      return actions.filter((action) => action.kind !== 'tile' || action.parsed?.type !== 'enemy'
        || !priorityEnemyIds.has(action.parsed.id) || action.parsed.id === handoff.triggerEnemyId);
    },
    stageKey(state) {
      return `${baseAdapter.stageKey?.(state) ?? 'all'}/handoff:${handoffId}`;
    },
    searchHeuristic(state) {
      const engineState = baseAdapter.materializeState(state);
      return (baseAdapter.searchHeuristic?.(state) ?? 0)
        + (getSelectedAct3Handoff(engineState)?.id === handoffId ? 7e10 : 0);
    }
  };
}

export function evaluateAct3CharterPortfolio({
  adapter,
  routeSteps,
  charterIds = DEMO30_CHARTER_IDS,
  maxExpanded = 18_000,
  maxGenerated = 360_000,
  includeDiagnostics = false,
  onStage = null
} = {}) {
  if (!adapter) throw new Error('Act III charter portfolio requires an adapter.');
  const entries = charterIds.map((id) => {
    const routeAdapter = createCharterRouteAdapter(adapter, id);
    const result = runDemoThirtyFloorMilestones({
      adapter: routeAdapter,
      routeSteps,
      maxExpanded,
      maxGenerated,
      onStage: (stage) => onStage?.(id, stage)
    });
    const replay = result.completed
      ? replayTowerStepSkeletonToState(result.routeSteps, { adapter: routeAdapter, requireGoal: true })
      : { ok: false, final: null, battleLog: [] };
    const charter = getAct3Charter(id);
    const stalledStage = result.milestones.find((stage) => !stage.reached) ?? null;
    const stalled = stalledStage?.diagnostics?.progressWitness ?? null;
    const stalledReplay = includeDiagnostics && stalled
      ? replayTowerStepSkeletonToState(stalled.steps, {
        adapter: routeAdapter,
        initialState: stalledStage.initialState,
        requireGoal: false
      })
      : null;
    const diagnosticActions = stalledReplay?.ok
      ? routeAdapter.enumerateActions(stalledReplay.state)
      : [];
    const diagnosticTransitions = includeDiagnostics && stalledReplay?.ok
      ? diagnosticActions.map((action) => {
        const applied = routeAdapter.applyAction(routeAdapter.cloneState(stalledReplay.state), action);
        const normalized = applied?.ok && routeAdapter.normalize
          ? routeAdapter.normalize(applied.state)
          : null;
        const nextState = normalized?.state ?? applied?.state ?? null;
        return Object.freeze({
          action: Object.freeze({ kind: action.kind, token: action.token, eventId: action.eventId, enemyId: action.parsed?.id ?? null, magicTier: action.magicTier ?? null }),
          ok: Boolean(applied?.ok),
          next: nextState ? routeAdapter.summarizeState(nextState) : null,
          nextActions: nextState ? Object.freeze(routeAdapter.enumerateActions(nextState).map((nextAction) => nextAction.eventId)) : Object.freeze([])
        });
      })
      : [];
    return Object.freeze({
      id,
      charter,
      completed: result.completed && replay.ok,
      result,
      replay,
      minNormalizedHpMargin: replay.minNormalizedHpMargin,
      insights: deriveRouteInsights({ steps: result.routeSteps, battleLog: replay.battleLog, charter }),
      strategicDecisions: strategicDecisionsFrom(result),
      diagnostics: includeDiagnostics ? Object.freeze({
        progressReplayOk: stalledReplay?.ok ?? null,
        progressReplayFailure: stalledReplay?.failures?.[0] ?? null,
        availableActions: stalledReplay?.ok
          ? Object.freeze(diagnosticActions.map((action) => Object.freeze({
            kind: action.kind,
            token: action.token,
            eventId: action.eventId,
            enemyId: action.parsed?.id ?? null,
            magicTier: action.magicTier ?? null
          })))
          : Object.freeze([]),
        transitions: Object.freeze(diagnosticTransitions)
      }) : null
    });
  });
  return Object.freeze({
    id: 'demo30-act3-charter-portfolio-v1',
    entries: Object.freeze(entries),
    publishable: entries.length === 3 && entries.every((entry) => entry.completed)
  });
}

export function evaluateAct3HandoffPortfolio({
  adapter,
  routeSteps,
  routeSpecs = DEMO30_HANDOFF_ROUTE_SPECS,
  maxExpanded = 18_000,
  maxGenerated = 360_000,
  onStage = null
} = {}) {
  if (!adapter) throw new Error('Act III handoff portfolio requires an adapter.');
  const entries = routeSpecs.map((spec) => {
    const charter = getAct3Charter(spec.charterId);
    const handoff = getAct3Handoff(spec.handoffId);
    if (!charter || !handoff) throw new Error(`Invalid Act III handoff route '${spec.id}'.`);
    const routeAdapter = createHandoffRouteAdapter(createCharterRouteAdapter(adapter, charter.id), handoff.id);
    const result = runDemoThirtyFloorMilestones({
      adapter: routeAdapter,
      routeSteps,
      maxExpanded,
      maxGenerated,
      onStage: (stage) => onStage?.(spec.id, stage)
    });
    const replay = result.completed
      ? replayTowerStepSkeletonToState(result.routeSteps, { adapter: routeAdapter, requireGoal: true })
      : { ok: false, final: null, battleLog: [] };
    const selected = replay.ok ? getSelectedAct3Handoff(replay.final) : null;
    return Object.freeze({
      ...spec,
      charter,
      handoff,
      completed: result.completed && replay.ok && selected?.id === handoff.id,
      result,
      replay,
      minNormalizedHpMargin: replay.minNormalizedHpMargin,
      insights: deriveRouteInsights({ steps: result.routeSteps, battleLog: replay.battleLog, charter, handoff: selected }),
      strategicDecisions: strategicDecisionsFrom(result)
    });
  });
  return Object.freeze({
    id: 'demo30-act3-handoff-portfolio-v1',
    entries: Object.freeze(entries),
    publishable: entries.length === DEMO30_HANDOFF_ROUTE_SPECS.length && entries.every((entry) => entry.completed)
  });
}

function summarizeDecisionAxis(entries, axis, ids) {
  return Object.freeze(ids.map((id) => {
    const cells = entries.filter((entry) => entry[axis] === id);
    const completed = cells.filter((entry) => entry.completed);
    const margins = completed.map((entry) => entry.minNormalizedHpMargin).filter(Number.isFinite);
    return Object.freeze({
      id,
      total: cells.length,
      completed: completed.length,
      blocked: cells.length - completed.length,
      minCompletedMargin: margins.length ? Math.min(...margins) : null,
      maxCompletedMargin: margins.length ? Math.max(...margins) : null
    });
  }));
}

/**
 * Convert a full charter × first-guardian sweep into compact author-facing
 * evidence.  It deliberately distinguishes a failed cell from an untested
 * one: callers must pass every expected matrix entry before a row/column can
 * claim coverage.
 */
export function summarizeAct3HandoffDecisionMatrix({
  entries = [],
  charterIds = DEMO30_CHARTER_IDS,
  handoffIds = DEMO30_HANDOFF_IDS
} = {}) {
  const expectedCells = charterIds.length * handoffIds.length;
  const coveredEntries = entries.filter((entry) => charterIds.includes(entry.charterId)
    && handoffIds.includes(entry.handoffId));
  const completedEntries = coveredEntries.filter((entry) => entry.completed);
  const margins = completedEntries.map((entry) => entry.minNormalizedHpMargin).filter(Number.isFinite);
  return Object.freeze({
    expectedCells,
    evaluatedCells: coveredEntries.length,
    coverageComplete: coveredEntries.length === expectedCells,
    completedCells: completedEntries.length,
    blockedCells: coveredEntries.length - completedEntries.length,
    minCompletedMargin: margins.length ? Math.min(...margins) : null,
    maxCompletedMargin: margins.length ? Math.max(...margins) : null,
    byCharter: summarizeDecisionAxis(coveredEntries, 'charterId', charterIds),
    byHandoff: summarizeDecisionAxis(coveredEntries, 'handoffId', handoffIds)
  });
}

/**
 * Run all nine irreversible Act III commitments with the same authoritative
 * milestones used by the release portfolio.  This is intentionally opt-in in
 * the CLI because it is a design diagnostic, not a cheap smoke test.
 */
export function evaluateAct3HandoffDecisionMatrix({
  adapter,
  routeSteps,
  maxExpanded = 18_000,
  maxGenerated = 360_000,
  onStage = null
} = {}) {
  const portfolio = evaluateAct3HandoffPortfolio({
    adapter,
    routeSteps,
    routeSpecs: DEMO30_HANDOFF_DECISION_MATRIX_SPECS,
    maxExpanded,
    maxGenerated,
    onStage
  });
  return Object.freeze({
    id: 'demo30-act3-handoff-decision-matrix-v1',
    entries: portfolio.entries,
    ...summarizeAct3HandoffDecisionMatrix({ entries: portfolio.entries })
  });
}
