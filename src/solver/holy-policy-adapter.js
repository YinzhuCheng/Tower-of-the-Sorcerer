import { HOLY_POLICIES } from './greedy-strategy.js';
import { createTowerAdapter } from './tower-adapter.js';

function actionIsHoly(action) {
  return action?.kind === 'tile'
    && action?.parsed?.type === 'item'
    && action?.parsed?.id === 'holy';
}

function finalEncounterAvailable(actions) {
  return actions.some((action) =>
    action?.kind === 'tile'
    && action?.parsed?.type === 'enemy'
    && ['finalQueen', 'voidCore'].includes(action.parsed.id)
  );
}

export function holyPolicyTriggerReached(state, holyPolicy, actions = []) {
  if (!HOLY_POLICIES.includes(holyPolicy)) throw new Error(`Unknown Holy policy: ${holyPolicy}`);
  if (state?.relics?.holy) return true;
  if (holyPolicy === 'immediate') return true;
  if (holyPolicy === 'after-core-6') return (state?.cores ?? 0) >= 6;
  if (holyPolicy === 'after-core-7') return (state?.cores ?? 0) >= 7;
  if (holyPolicy === 'before-final') return finalEncounterAvailable(actions);
  return false;
}

export function filterHolyPolicyActions(state, actions, holyPolicy) {
  const list = [...actions];
  if (state?.relics?.holy || holyPolicy === 'immediate') return list;
  const allowHoly = holyPolicyTriggerReached(state, holyPolicy, list);
  return allowHoly ? list : list.filter((action) => !actionIsHoly(action));
}

/**
 * Wraps the canonical Tower adapter without changing engine semantics.
 * The wrapper only removes Holy pickup actions that occur before the requested
 * policy trigger. Goal states are additionally required to have acquired Holy,
 * so a route cannot satisfy the policy by simply never collecting the relic.
 */
export function createHolyPolicyTowerAdapter({
  holyPolicy,
  baseAdapter = createTowerAdapter()
} = {}) {
  if (!HOLY_POLICIES.includes(holyPolicy)) throw new Error(`Unknown Holy policy: ${holyPolicy}`);
  return {
    ...baseAdapter,
    enumerateActions(state) {
      const actions = baseAdapter.enumerateActions(state);
      return filterHolyPolicyActions(state, actions, holyPolicy);
    },
    isGoal(state) {
      return baseAdapter.isGoal(state) && state.relics?.holy === true;
    },
    stageKey(state) {
      const base = baseAdapter.stageKey ? baseAdapter.stageKey(state) : 'all';
      return `${base}/holy:${state.relics?.holy ? 1 : 0}`;
    },
    rulesVersion() {
      return `${baseAdapter.rulesVersion?.() ?? 'tower'}+holy-policy:${holyPolicy}`;
    },
    holyPolicy
  };
}

export function extractShopPlanFromSolverCertificate(certificate) {
  if (!certificate?.steps) return [];
  return certificate.steps
    .filter((step) => step.kind === 'shop' && typeof step.action?.optionId === 'string')
    .map((step) => step.action.optionId);
}

export function extractHolyStepFromSolverCertificate(certificate) {
  return certificate?.steps?.find((step) =>
    step.kind === 'tile'
    && step.action?.token === 'item:holy'
  ) ?? null;
}
