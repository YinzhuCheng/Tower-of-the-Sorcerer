import { optimizePurchasePlanLocally } from './purchase-local-search.js';
import { rescuePurchasePrefixForHolyPolicy } from './purchase-prefix-rescue.js';
import { HOLY_POLICIES, runGreedyShopStrategy } from '../solver/greedy-strategy.js';
import {
  DEFAULT_INCUMBENT_STRATEGIES,
  PROMOTED_PURCHASE_PLANS
} from '../solver/tower-incumbent.js';

function clonePlan(plan, holyPolicy, idSuffix = '') {
  if (!plan) return null;
  const cycle = [...(plan.cycle ?? plan.shopCycle ?? [])];
  if (cycle.length === 0) return null;
  const shopPlan = plan.shopPlan ? [...plan.shopPlan] : null;
  return {
    id: `${plan.id ?? 'seed'}${idSuffix}`,
    cycle,
    shopPlan,
    holyPolicy
  };
}

function seedSignature(seed) {
  return JSON.stringify({
    cycle: seed.cycle,
    shopPlan: seed.shopPlan,
    holyPolicy: seed.holyPolicy
  });
}

function seedPortfolioForPolicy({ holyPolicy, preferredPlan = null } = {}) {
  const seeds = [];
  const preferred = clonePlan(preferredPlan, holyPolicy, '@preferred');
  if (preferred) seeds.push(preferred);

  for (const promoted of PROMOTED_PURCHASE_PLANS) {
    const seed = clonePlan(promoted, holyPolicy, '@promoted-policy-swap');
    if (seed) seeds.push(seed);
  }

  for (const strategy of DEFAULT_INCUMBENT_STRATEGIES) {
    if ((strategy.holyPolicy ?? 'immediate') !== holyPolicy) continue;
    seeds.push({
      id: `${strategy.id}@portfolio-seed`,
      cycle: [...strategy.cycle],
      shopPlan: null,
      holyPolicy
    });
  }

  const seen = new Set();
  return seeds.filter((seed) => {
    const signature = seedSignature(seed);
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function rescueCyclesForPolicy(holyPolicy) {
  const seen = new Set();
  const cycles = [];
  for (const strategy of DEFAULT_INCUMBENT_STRATEGIES) {
    if ((strategy.holyPolicy ?? 'immediate') !== holyPolicy) continue;
    const key = JSON.stringify(strategy.cycle);
    if (seen.has(key)) continue;
    seen.add(key);
    cycles.push([...strategy.cycle]);
  }
  return cycles;
}

function runSeed(seed) {
  const result = runGreedyShopStrategy({
    shopCycle: seed.cycle,
    shopPlan: seed.shopPlan,
    holyPolicy: seed.holyPolicy
  });
  return {
    ...seed,
    result
  };
}

function seedAttemptSummary(entry) {
  return {
    id: entry.id,
    explicitShopPlan: Boolean(entry.shopPlan),
    solvable: entry.result.solvable,
    terminalHp: entry.result.solvable ? entry.result.final.hp : null,
    floor: entry.result.floor ?? null,
    cores: entry.result.cores ?? null,
    purchases: entry.result.purchases ?? null,
    failure: entry.result.solvable ? null : entry.result.failure ?? null
  };
}

function rescueSummary(rescue) {
  if (!rescue) return null;
  return {
    model: rescue.model,
    found: rescue.found,
    depth: rescue.depth,
    evaluations: rescue.evaluations,
    beamWidth: rescue.beamWidth,
    maxDepth: rescue.maxDepth,
    stoppedReason: rescue.stoppedReason,
    bestProgress: rescue.bestProgress ? seedAttemptSummary(rescue.bestProgress) : null,
    failureReasons: rescue.failureReasons.map((entry) => ({ ...entry }))
  };
}

export function rankHolyPolicyResponses(responses) {
  return [...responses].sort((a, b) => {
    const feasibleA = a.status === 'optimized' && Number.isFinite(a.bestTerminalHp);
    const feasibleB = b.status === 'optimized' && Number.isFinite(b.bestTerminalHp);
    if (feasibleA !== feasibleB) return feasibleA ? -1 : 1;
    if (feasibleA && b.bestTerminalHp !== a.bestTerminalHp) {
      return b.bestTerminalHp - a.bestTerminalHp;
    }
    return String(a.holyPolicy).localeCompare(String(b.holyPolicy));
  });
}

export function summarizeHolyPolicyResponses(responses) {
  const ranked = rankHolyPolicyResponses(responses);
  const best = ranked.find((entry) => entry.status === 'optimized') ?? null;
  const bestHp = best?.bestTerminalHp ?? null;
  const alternatives = ranked.map((entry) => ({
    holyPolicy: entry.holyPolicy,
    status: entry.status,
    seedCount: entry.seedCount,
    feasibleSeedCount: entry.feasibleSeedCount,
    rescueAttempted: Boolean(entry.rescue),
    rescueFound: entry.rescue?.found ?? null,
    rescueEvaluations: entry.rescue?.evaluations ?? 0,
    localOptimal: entry.localOptimal ?? null,
    bestTerminalHp: entry.bestTerminalHp ?? null,
    normalizedRegret: Number.isFinite(bestHp) && Number.isFinite(entry.bestTerminalHp)
      ? Math.max(0, (bestHp - entry.bestTerminalHp) / Math.max(1, bestHp))
      : null,
    selected: Boolean(best && entry.holyPolicy === best.holyPolicy)
  }));
  const optimized = ranked.filter((entry) => entry.status === 'optimized');
  const allOptimizedLocalOptimal = optimized.length > 0
    && optimized.every((entry) => entry.localOptimal === true);
  const uncovered = ranked.filter((entry) => entry.status !== 'optimized');
  const coverageComplete = ranked.length > 0 && optimized.length === ranked.length;

  return {
    best,
    alternatives,
    attemptedPolicies: ranked.length,
    optimizedPolicies: optimized.length,
    uncoveredPolicies: uncovered.map((entry) => entry.holyPolicy),
    seedCoverageRatio: ranked.length > 0 ? optimized.length / ranked.length : 0,
    coverageComplete,
    allOptimizedLocalOptimal,
    stableWithinSeedPortfolio: Boolean(best) && allOptimizedLocalOptimal,
    stableWithCompleteCoverage: Boolean(best) && coverageComplete && allOptimizedLocalOptimal
  };
}

/**
 * Player best response over the currently modeled discrete Holy timing axis.
 *
 * Each Holy policy gets an independent feasible-seed portfolio followed by its
 * own authoritative purchase 1-opt. If the portfolio has no feasible seed, a
 * bounded beam search over early purchase prefixes tries to rescue one. Failure
 * of that bounded rescue remains `uncovered`; it is not an infeasibility proof.
 */
export function optimizePurchasePlanAcrossHolyPolicies({
  preferredPlans = {},
  holyPolicies = HOLY_POLICIES,
  maxPasses = 12,
  highRegretRelative = 0.20,
  rescueEnabled = true,
  rescueMaxDepth = 8,
  rescueBeamWidth = 24,
  rescueMaxEvaluations = 2_000
} = {}) {
  if (!Array.isArray(holyPolicies) || holyPolicies.length === 0) {
    throw new Error('Holy-policy best response requires at least one policy.');
  }
  for (const policy of holyPolicies) {
    if (!HOLY_POLICIES.includes(policy)) throw new Error(`Unknown Holy policy: ${policy}`);
  }

  const responses = holyPolicies.map((holyPolicy) => {
    const seeds = seedPortfolioForPolicy({
      holyPolicy,
      preferredPlan: preferredPlans?.[holyPolicy] ?? null
    });
    const attempts = seeds.map(runSeed);
    const feasible = attempts
      .filter((entry) => entry.result.solvable)
      .sort((a, b) => b.result.final.hp - a.result.final.hp || a.id.localeCompare(b.id));
    let seed = feasible[0] ?? null;
    let rescue = null;

    if (!seed && rescueEnabled) {
      rescue = rescuePurchasePrefixForHolyPolicy({
        holyPolicy,
        cycles: rescueCyclesForPolicy(holyPolicy),
        maxDepth: rescueMaxDepth,
        beamWidth: rescueBeamWidth,
        maxEvaluations: rescueMaxEvaluations
      });
      if (rescue.found && rescue.bestSeed?.result?.solvable) {
        seed = {
          id: `${rescue.bestSeed.id}@rescue`,
          cycle: [...rescue.bestSeed.cycle],
          shopPlan: [...rescue.bestSeed.shopPlan],
          holyPolicy,
          result: rescue.bestSeed.result
        };
      }
    }

    if (!seed) {
      return {
        holyPolicy,
        status: 'uncovered',
        seedCount: attempts.length,
        feasibleSeedCount: 0,
        seedAttempts: attempts.map(seedAttemptSummary),
        rescue: rescueSummary(rescue),
        localOptimal: null,
        bestTerminalHp: null,
        bestPlan: null,
        bestResult: null,
        localSearch: null
      };
    }

    const localSearch = optimizePurchasePlanLocally({
      seedEntry: {
        id: `${seed.id}@${holyPolicy}`,
        cycle: [...seed.cycle],
        holyPolicy,
        result: seed.result
      },
      maxPasses,
      highRegretRelative
    });

    return {
      holyPolicy,
      status: 'optimized',
      seedCount: attempts.length,
      feasibleSeedCount: feasible.length + (rescue?.found ? 1 : 0),
      seedAttempts: attempts.map(seedAttemptSummary),
      rescue: rescueSummary(rescue),
      selectedSeed: seedAttemptSummary(seed),
      localOptimal: localSearch.localOptimal,
      bestTerminalHp: localSearch.bestTerminalHp,
      bestPlan: {
        id: `${seed.id}@${holyPolicy}@best-response`,
        cycle: [...seed.cycle],
        shopPlan: [...localSearch.bestPlan],
        holyPolicy
      },
      bestResult: localSearch.bestResult,
      localSearch: {
        model: localSearch.model,
        localOptimal: localSearch.localOptimal,
        improvementPasses: localSearch.improvementPasses,
        evaluatedMutations: localSearch.evaluatedMutations,
        seedTerminalHp: localSearch.seedTerminalHp,
        bestTerminalHp: localSearch.bestTerminalHp,
        totalImprovement: localSearch.totalImprovement
      }
    };
  });

  const summary = summarizeHolyPolicyResponses(responses);
  return {
    schemaVersion: 2,
    model: 'holy-policy-purchase-best-response-v0.2-rescue',
    policies: [...holyPolicies],
    responses: rankHolyPolicyResponses(responses),
    ...summary
  };
}
