import { runGreedyShopStrategy } from '../solver/greedy-strategy.js';

const SHOP_OPTIONS = Object.freeze(['atk', 'def', 'hp']);

function cloneCycle(cycle) {
  return [...cycle];
}

function clonePlan(plan) {
  return [...(plan ?? [])];
}

function attemptSignature(attempt) {
  return JSON.stringify({
    cycle: attempt.cycle,
    shopPlan: attempt.shopPlan,
    holyPolicy: attempt.holyPolicy
  });
}

function runAttempt({ cycle, shopPlan, holyPolicy, id }) {
  const result = runGreedyShopStrategy({
    shopCycle: cycle,
    shopPlan,
    holyPolicy
  });
  return {
    id,
    cycle: cloneCycle(cycle),
    shopPlan: clonePlan(shopPlan),
    holyPolicy,
    result
  };
}

function progressVector(attempt) {
  const result = attempt.result;
  return [
    result.solvable ? 1 : 0,
    result.cores ?? 0,
    result.relics?.holy ? 1 : 0,
    result.battles ?? 0,
    result.floor ?? 0,
    result.purchases ?? 0,
    result.turns ?? 0,
    result.final?.hp ?? 0,
    (result.final?.atk ?? 0) + (result.final?.def ?? 0)
  ];
}

export function comparePurchaseRescueAttempts(a, b) {
  const av = progressVector(a);
  const bv = progressVector(b);
  for (let index = 0; index < av.length; index += 1) {
    if (av[index] !== bv[index]) return bv[index] - av[index];
  }
  return attemptSignature(a).localeCompare(attemptSignature(b));
}

function uniqueCycles(cycles) {
  const seen = new Set();
  return cycles.filter((cycle) => {
    const key = JSON.stringify(cycle);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarizeFailureReasons(attempts) {
  const counts = {};
  for (const attempt of attempts) {
    if (attempt.result.solvable) continue;
    const reason = attempt.result.failure ?? 'unknown failure';
    counts[reason] = (counts[reason] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

/**
 * Bounded beam search over explicit early shop-purchase prefixes.
 *
 * This function exists only to find a feasible seed for a Holy policy when the
 * canonical cycle portfolio fails. It is NOT an infeasibility proof and does not
 * replace purchase 1-opt after a seed is found.
 */
export function rescuePurchasePrefixForHolyPolicy({
  holyPolicy,
  cycles,
  maxDepth = 8,
  beamWidth = 24,
  maxEvaluations = 2_000
} = {}) {
  if (typeof holyPolicy !== 'string' || holyPolicy.length === 0) {
    throw new Error('Purchase-prefix rescue requires a Holy policy.');
  }
  if (!Array.isArray(cycles) || cycles.length === 0) {
    throw new Error('Purchase-prefix rescue requires at least one fallback cycle.');
  }
  if (!Number.isInteger(maxDepth) || maxDepth < 1) throw new Error('maxDepth must be a positive integer.');
  if (!Number.isInteger(beamWidth) || beamWidth < 1) throw new Error('beamWidth must be a positive integer.');
  if (!Number.isInteger(maxEvaluations) || maxEvaluations < 1) throw new Error('maxEvaluations must be a positive integer.');

  const baseCycles = uniqueCycles(cycles.map(cloneCycle));
  let evaluations = 0;
  const allAttempts = [];
  let frontier = [];

  for (const [index, cycle] of baseCycles.entries()) {
    if (evaluations >= maxEvaluations) break;
    const attempt = runAttempt({
      id: `rescue-cycle-${index}`,
      cycle,
      shopPlan: [],
      holyPolicy
    });
    evaluations += 1;
    allAttempts.push(attempt);
    frontier.push(attempt);
  }

  const initialFeasible = allAttempts
    .filter((attempt) => attempt.result.solvable)
    .sort(comparePurchaseRescueAttempts)[0] ?? null;
  if (initialFeasible) {
    return {
      schemaVersion: 1,
      model: 'purchase-prefix-rescue-beam-v0.1',
      holyPolicy,
      found: true,
      depth: 0,
      evaluations,
      beamWidth,
      maxDepth,
      stoppedReason: 'feasible_seed_found',
      bestSeed: initialFeasible,
      bestProgress: initialFeasible,
      failureReasons: summarizeFailureReasons(allAttempts)
    };
  }

  const seen = new Set(frontier.map(attemptSignature));
  let stoppedReason = 'depth_limit';
  let reachedDepth = 0;

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    reachedDepth = depth;
    const parents = [...frontier].sort(comparePurchaseRescueAttempts).slice(0, beamWidth);
    const children = [];

    for (const parent of parents) {
      if (evaluations >= maxEvaluations) {
        stoppedReason = 'evaluation_limit';
        break;
      }
      // Extending a prefix can only change behavior if the failed route actually
      // reached the next purchase slot. Otherwise the appended option is dead data.
      if ((parent.result.purchaseLog?.length ?? 0) <= parent.shopPlan.length) continue;

      for (const optionId of SHOP_OPTIONS) {
        if (evaluations >= maxEvaluations) {
          stoppedReason = 'evaluation_limit';
          break;
        }
        const shopPlan = [...parent.shopPlan, optionId];
        const descriptor = {
          id: `${parent.id}@d${depth}-${optionId}`,
          cycle: parent.cycle,
          shopPlan,
          holyPolicy
        };
        const signature = JSON.stringify({
          cycle: descriptor.cycle,
          shopPlan: descriptor.shopPlan,
          holyPolicy
        });
        if (seen.has(signature)) continue;
        seen.add(signature);
        const attempt = runAttempt(descriptor);
        evaluations += 1;
        allAttempts.push(attempt);
        children.push(attempt);
      }
    }

    const feasible = children
      .filter((attempt) => attempt.result.solvable)
      .sort(comparePurchaseRescueAttempts)[0] ?? null;
    if (feasible) {
      return {
        schemaVersion: 1,
        model: 'purchase-prefix-rescue-beam-v0.1',
        holyPolicy,
        found: true,
        depth,
        evaluations,
        beamWidth,
        maxDepth,
        stoppedReason: 'feasible_seed_found',
        bestSeed: feasible,
        bestProgress: [...allAttempts].sort(comparePurchaseRescueAttempts)[0] ?? null,
        failureReasons: summarizeFailureReasons(allAttempts)
      };
    }

    if (stoppedReason === 'evaluation_limit') break;
    if (children.length === 0) {
      stoppedReason = 'frontier_exhausted';
      break;
    }
    frontier = children.sort(comparePurchaseRescueAttempts).slice(0, beamWidth);
  }

  const bestProgress = [...allAttempts].sort(comparePurchaseRescueAttempts)[0] ?? null;
  return {
    schemaVersion: 1,
    model: 'purchase-prefix-rescue-beam-v0.1',
    holyPolicy,
    found: false,
    depth: reachedDepth,
    evaluations,
    beamWidth,
    maxDepth,
    stoppedReason,
    bestSeed: null,
    bestProgress,
    failureReasons: summarizeFailureReasons(allAttempts)
  };
}
