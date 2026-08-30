import { ROUTE_DOCTRINES, getRouteDoctrine, isRouteDoctrineCompleted } from '../game/route-doctrines.js';
import { simulateWarCouncil } from '../game/war-council.js';
import { replayTowerStepSkeletonToState } from '../solver/replay.js';
import { deriveRouteInsights } from '../solver/route-insights.js';
import { runDemoTwentyFloorMilestones } from './demo-20-floor-milestone-solver.js';
import { withDemoTwentyFloorCandidate } from './demo-20-floor-mutations.js';

export const DEMO20_ROUTE_PORTFOLIO_ID = 'demo20-mutually-exclusive-doctrine-portfolio-v1';

function survivorIds(state) {
  return new Set((state?.council?.outcome?.survivors ?? []).map((unit) => unit.id));
}

function routeSatisfied(state, doctrine) {
  return state?.victory === true
    && state?.doctrine?.selectedId === doctrine.id
    && isRouteDoctrineCompleted(state)
    && survivorIds(state).has(doctrine.allyId);
}

function engineStateFor(adapter, state) {
  return adapter.materializeState ? adapter.materializeState(state) : state;
}

function doctrineMilestones(doctrine) {
  return Object.freeze([
    Object.freeze({
      id: `${doctrine.id}-commit`,
      label: `签署${doctrine.title}`,
      isGoal(state, adapter) {
        return engineStateFor(adapter, state).doctrine?.selectedId === doctrine.id;
      }
    }),
    Object.freeze({
      id: `${doctrine.id}-bond`,
      label: `取得${doctrine.allyName ?? doctrine.allyId}的专属信物`,
      isGoal(state, adapter) {
        return isRouteDoctrineCompleted(engineStateFor(adapter, state));
      }
    }),
    Object.freeze({
      id: `${doctrine.id}-council`,
      label: `让${doctrine.allyName ?? doctrine.allyId}存活通过会战`,
      isGoal(state, adapter) {
        const engineState = engineStateFor(adapter, state);
        return engineState.council?.completed === true
          && survivorIds(engineState).has(doctrine.allyId);
      }
    }),
    Object.freeze({ id: `${doctrine.id}-victory`, label: '击败起源核心', isGoal(state, adapter) {
      return routeSatisfied(engineStateFor(adapter, state), doctrine);
    } })
  ]);
}

const SPECIALIST_DEADLINE_FLOOR = Object.freeze({
  // The forward-witness adapter intentionally forbids retrospective tours.
  // These deadlines therefore express the authored point of no return for a
  // specialist detour and remove only self-evidently failed "skip my route"
  // branches from a route-specific witness search.
  ember: 14,
  tide: 12,
  shadow: 15
});

/** A route-specific witness is deliberately more demanding than ordinary
 * victory: it must take the selected specialist vault and preserve that ally
 * through the public council puzzle.  The heuristic is ordering-only; Pareto
 * pruning and replay remain authoritative. */
export function createDoctrineRouteAdapter(baseAdapter, doctrineId) {
  const doctrine = getRouteDoctrine(doctrineId);
  if (!doctrine) throw new Error(`Unknown doctrine route: ${doctrineId}`);
  return {
    ...baseAdapter,
    objectiveType: `doctrine-${doctrine.id}-terminal-hp`,
    enumerateActions(state) {
      const engineState = baseAdapter.materializeState(state);
      const beforeBond = !isRouteDoctrineCompleted(engineState);
      const actions = baseAdapter.enumerateActions(state).filter((action) => {
        if (action.kind === 'doctrine') return action.doctrineId === doctrine.id;
        if (action.kind !== 'council') return true;
        const report = simulateWarCouncil(engineState, action.plan);
        return report.won && report.survivors.some((unit) => unit.id === doctrine.allyId);
      });
      if (!beforeBond) return actions;

      // Once the published specialist gate is reachable, opening it is the
      // only route-progressing choice.  It merely commits the already chosen
      // two-card (or guardian) cost; battle, shop, and all ordinary gameplay
      // choices remain authoritative below it.
      const specialistGate = actions.find((action) => action.kind === 'tile'
        && doctrine.gateIds.includes(String(action.token ?? '').replace('gate:', '')));
      if (specialistGate) return [specialistGate];

      const deadline = SPECIALIST_DEADLINE_FLOOR[doctrine.id];
      if (engineState.floor >= deadline) {
        return actions.filter((action) => !(action.kind === 'tile' && action.token === 'U'));
      }
      return actions;
    },
    isGoal(state) {
      return routeSatisfied(baseAdapter.materializeState(state), doctrine);
    },
    stageKey(state) {
      return `${baseAdapter.stageKey?.(state) ?? 'all'}/route:${doctrine.id}`;
    },
    searchHeuristic(state) {
      const engineState = baseAdapter.materializeState(state);
      let score = 0;
      if (engineState.doctrine?.selectedId === doctrine.id) score += 4e10;
      if (isRouteDoctrineCompleted(engineState)) score += 9e10;
      if (survivorIds(engineState).has(doctrine.allyId)) score += 3e10;
      // A forward-facing score does not discard returns or shop choices; it
      // only prevents high-HP merchant loops from crowding out the authored
      // specialist checkpoint during witness construction.
      score += engineState.floor * 1e8;
      // The selected specialist item is behind a published gate.  Favoring
      // its completion limits blind item sweeps but cannot prune alternatives.
      if (engineState.floor >= 18 && !isRouteDoctrineCompleted(engineState)) score -= 6e10;
      return score;
    }
  };
}

function compactStage(stage) {
  return Object.freeze({
    id: stage.milestone,
    reached: stage.reached,
    stoppedReason: stage.stoppedReason,
    expanded: stage.expandedStates,
    generated: stage.generatedStates
  });
}

export function evaluateDoctrineRoutePortfolio({
  adapter,
  routeSteps,
  maxExpanded = 28_000,
  maxGenerated = 520_000
} = {}) {
  if (!adapter) throw new Error('Doctrine route portfolio requires a base adapter.');
  const entries = ROUTE_DOCTRINES.map((doctrine) => {
    const routeAdapter = createDoctrineRouteAdapter(adapter, doctrine.id);
    const search = runDemoTwentyFloorMilestones({
      adapter: routeAdapter,
      routeSteps,
      maxExpanded,
      maxGenerated
    });
    const replay = search.completed
      ? replayTowerStepSkeletonToState(search.routeSteps, { adapter: routeAdapter, requireGoal: true })
      : { ok: false, battleLog: [], final: null };
    const finalState = replay.state ? routeAdapter.materializeState(replay.state) : null;
    return Object.freeze({
      id: doctrine.id,
      title: doctrine.title,
      specialistRoute: doctrine.route,
      councilGoal: doctrine.councilGoal,
      completed: Boolean(search.completed && replay.ok && finalState && routeSatisfied(finalState, doctrine)),
      milestones: Object.freeze(search.milestones.map(compactStage)),
      final: replay.final,
      minNormalizedHpMargin: replay.minNormalizedHpMargin,
      insights: deriveRouteInsights({
        steps: search.routeSteps,
        battleLog: replay.battleLog,
        doctrine
      })
    });
  });
  return Object.freeze({
    id: DEMO20_ROUTE_PORTFOLIO_ID,
    searchBudget: Object.freeze({ maxExpanded, maxGenerated, strategy: 'route-directed-heuristic-ordering-only' }),
    publishable: entries.length === ROUTE_DOCTRINES.length && entries.every((entry) => entry.completed),
    entries: Object.freeze(entries)
  });
}

/** Run the exact same three-route proof under one reversible numeric
 * candidate.  A hardening proposal is useful only when its outcome is
 * reported route-by-route; it must never be mistaken for a universal balance
 * improvement merely because the generic ending remains reachable. */
export function evaluateDoctrineRoutePortfolioCandidate({
  candidate = { mutationIds: [] },
  catalog,
  dependencies = {},
  ...portfolioOptions
} = {}) {
  if (!Array.isArray(catalog)) throw new Error('Doctrine route candidate evaluation requires a mutation catalog.');
  return withDemoTwentyFloorCandidate(
    candidate,
    catalog,
    () => evaluateDoctrineRoutePortfolio(portfolioOptions),
    dependencies
  );
}
