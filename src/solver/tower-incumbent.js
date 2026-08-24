import { HOLY_POLICIES, runGreedyShopStrategy } from './greedy-strategy.js';

export const GREEDY_INCUMBENT_WITNESS_TYPE = 'greedy-route-policy-v3';
const SHOP_OPTIONS = ['atk', 'def', 'hp'];

const BASE_SHOP_STRATEGIES = [
  { id: 'def-atk-hp', cycle: ['def', 'atk', 'hp'] },
  { id: 'def-hp-atk', cycle: ['def', 'hp', 'atk'] },
  { id: 'atk-def-hp', cycle: ['atk', 'def', 'hp'] },
  { id: 'atk-hp-def', cycle: ['atk', 'hp', 'def'] },
  { id: 'hp-def-atk', cycle: ['hp', 'def', 'atk'] },
  { id: 'hp-atk-def', cycle: ['hp', 'atk', 'def'] },
  { id: 'all-atk', cycle: ['atk'] },
  { id: 'all-def', cycle: ['def'] },
  { id: 'all-hp', cycle: ['hp'] }
];

export const DEFAULT_INCUMBENT_STRATEGIES = BASE_SHOP_STRATEGIES.flatMap((strategy) =>
  HOLY_POLICIES.map((holyPolicy) => ({
    id: holyPolicy === 'immediate' ? strategy.id : `${strategy.id}@${holyPolicy}`,
    baseId: strategy.id,
    cycle: [...strategy.cycle],
    holyPolicy
  }))
);

// Promoted only after authoritative local search reached a 1-opt fixed point.
// Keeping the explicit sequence makes the incumbent reproducible and avoids
// paying the 24-pass discovery cost in every CI / tuning iteration.
export const PROMOTED_PURCHASE_PLANS = Object.freeze([
  Object.freeze({
    id: 'purchase-1opt-v1',
    cycle: Object.freeze(['def', 'atk', 'hp']),
    holyPolicy: 'immediate',
    expectedHp: 26_041,
    shopPlan: Object.freeze([
      'def', 'def', 'def', 'def',
      'hp', 'hp', 'hp', 'hp', 'hp',
      'hp', 'hp', 'hp', 'hp', 'hp',
      'hp', 'hp', 'hp', 'hp', 'hp',
      'atk',
      'hp', 'hp', 'hp', 'hp', 'hp',
      'hp', 'hp', 'hp', 'hp', 'hp'
    ])
  })
]);

function validateShopOptions(options, label) {
  if (options == null) return;
  if (!Array.isArray(options)) throw new Error(`${label} must be an array or null.`);
  for (const optionId of options) {
    if (!SHOP_OPTIONS.includes(optionId)) throw new Error(`${label} contains unknown shop option: ${optionId}`);
  }
}

export function makeGreedyIncumbentWitness({
  id = null,
  cycle,
  holyPolicy = 'immediate',
  shopPlan = null
} = {}) {
  if (!Array.isArray(cycle) || cycle.length === 0) {
    throw new Error('Greedy incumbent witness requires a non-empty shop cycle.');
  }
  validateShopOptions(cycle, 'shopCycle');
  validateShopOptions(shopPlan, 'shopPlan');
  if (!HOLY_POLICIES.includes(holyPolicy)) {
    throw new Error(`Greedy incumbent witness has unknown Holy policy: ${holyPolicy}`);
  }
  return {
    type: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: id,
    shopCycle: [...cycle],
    shopPlan: shopPlan ? [...shopPlan] : null,
    holyPolicy
  };
}

export function verifyGreedyIncumbentWitness(witness) {
  if (!witness || witness.type !== GREEDY_INCUMBENT_WITNESS_TYPE) {
    return { ok: false, reason: 'Unsupported Tower incumbent witness type.' };
  }
  if (!Array.isArray(witness.shopCycle) || witness.shopCycle.length === 0) {
    return { ok: false, reason: 'Greedy incumbent witness has no shop cycle.' };
  }
  try {
    validateShopOptions(witness.shopCycle, 'shopCycle');
    validateShopOptions(witness.shopPlan, 'shopPlan');
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
  if (!HOLY_POLICIES.includes(witness.holyPolicy)) {
    return { ok: false, reason: 'Greedy incumbent witness has an unknown Holy policy.' };
  }

  let result;
  try {
    result = runGreedyShopStrategy({
      shopCycle: witness.shopCycle,
      shopPlan: witness.shopPlan,
      holyPolicy: witness.holyPolicy
    });
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
  if (!result.solvable) {
    return { ok: false, reason: result.failure ?? 'Greedy incumbent witness did not reach victory.' };
  }

  return {
    ok: true,
    value: result.final.hp,
    objectiveType: 'terminal_hp',
    witnessType: GREEDY_INCUMBENT_WITNESS_TYPE,
    strategyId: witness.strategyId ?? null,
    summary: {
      final: { ...result.final },
      holyPolicy: result.holyPolicy,
      holyAcquisition: result.holyAcquisition,
      explicitShopPlan: Boolean(witness.shopPlan),
      shopPlanLength: witness.shopPlan?.length ?? 0,
      cores: result.cores,
      purchases: result.purchases,
      purchaseCounts: { ...result.purchaseCounts },
      battles: result.battles,
      turns: result.turns
    }
  };
}

function runPromotedPlan(plan) {
  const cycle = [...plan.cycle];
  const shopPlan = [...plan.shopPlan];
  const holyPolicy = plan.holyPolicy ?? 'immediate';
  const witness = makeGreedyIncumbentWitness({
    id: plan.id,
    cycle,
    holyPolicy,
    shopPlan
  });
  const result = runGreedyShopStrategy({ cycle, shopPlan, shopCycle: cycle, holyPolicy });
  if (!result.solvable) {
    throw new Error(`Promoted incumbent ${plan.id} is no longer solvable: ${result.failure ?? 'unknown failure'}`);
  }
  if (Number.isFinite(plan.expectedHp) && result.final.hp !== plan.expectedHp) {
    throw new Error(`Promoted incumbent ${plan.id} drifted: expected ${plan.expectedHp}, got ${result.final.hp}.`);
  }
  return {
    id: plan.id,
    baseId: plan.id,
    source: 'promoted-plan',
    cycle,
    shopPlan,
    holyPolicy,
    witness,
    result
  };
}

export function findBestGreedyIncumbent({ strategies = DEFAULT_INCUMBENT_STRATEGIES } = {}) {
  const results = strategies.map((strategy) => ({
    id: strategy.id,
    baseId: strategy.baseId ?? strategy.id,
    source: 'policy-portfolio',
    cycle: [...strategy.cycle],
    holyPolicy: strategy.holyPolicy ?? 'immediate',
    witness: makeGreedyIncumbentWitness(strategy),
    result: runGreedyShopStrategy({
      shopCycle: strategy.cycle,
      holyPolicy: strategy.holyPolicy ?? 'immediate'
    })
  }));
  const feasible = results
    .filter((entry) => entry.result.solvable)
    .sort((a, b) => b.result.final.hp - a.result.final.hp || a.id.localeCompare(b.id));

  return {
    best: feasible[0] ?? null,
    feasibleCount: feasible.length,
    attemptedCount: results.length,
    results
  };
}

export function findBestKnownIncumbent({
  portfolio = null,
  promotedPlans = PROMOTED_PURCHASE_PLANS
} = {}) {
  const policyPortfolio = portfolio ?? findBestGreedyIncumbent();
  const promoted = promotedPlans.map(runPromotedPlan);
  const candidates = [
    ...(policyPortfolio.best ? [policyPortfolio.best] : []),
    ...promoted
  ].sort((a, b) => b.result.final.hp - a.result.final.hp || a.id.localeCompare(b.id));

  return {
    best: candidates[0] ?? null,
    portfolio: policyPortfolio,
    promoted,
    candidates
  };
}
