/**
 * Route-family analysis for the frozen 10F campaign.
 *
 * Purchase cycles, Holy timing, and late-floor priority are only inexpensive
 * discovery seeds.  A family is accepted because its *played* route makes
 * different decisions at named campaign fork points, not because its seed
 * string is different.
 */

const SHOP_OPTIONS = Object.freeze(['atk', 'def', 'hp']);

function cartesianCycles(length, prefix = [], output = []) {
  if (prefix.length === length) {
    output.push(Object.freeze([...prefix]));
    return output;
  }
  for (const option of SHOP_OPTIONS) cartesianCycles(length, [...prefix, option], output);
  return output;
}

function tokenSet(route) {
  return new Set((route.routeSteps ?? [])
    .filter((step) => step.kind === 'tile')
    .map((step) => `f${step.floorBefore + 1}:${step.action?.token ?? ''}`));
}

function holyTiming(cores) {
  if (!Number.isFinite(cores)) return 'uncollected';
  if (cores <= 5) return 'early';
  if (cores === 6) return 'mid';
  return 'late';
}

function shopStyle(purchaseCounts = {}) {
  const atk = Number(purchaseCounts.atk ?? 0);
  const def = Number(purchaseCounts.def ?? 0);
  const hp = Number(purchaseCounts.hp ?? 0);
  if (atk > 0 && def > 0 && hp > 0) return 'balanced';
  if (def === 0 && atk > hp) return 'assault';
  if (def === 0 && hp > atk) return 'vitality';
  if (def > 0 && hp === 0) return 'guard';
  return 'hybrid';
}

/**
 * Extract only player-visible, durable choices.  The fingerprint deliberately
 * ignores the discovery policy and incidental walking paths.
 */
export function describeDemoTenFloorRouteFamily(route, replay) {
  const tokens = tokenSet(route);
  const decisions = {
    // The F8 double-guardian vault is the campaign's clearest optional
    // high-value detour.  `item:dual` is inside that vault.
    f8Vault: tokens.has('f8:item:dual'),
    // Holy may be claimed as soon as F6 is reached or deliberately held for
    // the late palace.  This changes the risk profile of the final floors.
    holyTiming: holyTiming(route.holyAcquisition?.cores),
    // This is the actual complete shop mix, classified after play.  It is not
    // the input cycle used to discover the route.
    shopStyle: shopStyle(route.purchaseCounts),
    f9Shop: tokens.has('f9:shop') || (route.purchaseLog ?? []).some((entry) => entry.floor === 9)
  };
  const fingerprint = [
    `vault:${decisions.f8Vault ? 'take' : 'skip'}`,
    `holy:${decisions.holyTiming}`,
    `shop:${decisions.shopStyle}`,
    `f9shop:${decisions.f9Shop ? 'use' : 'skip'}`
  ].join('|');
  return {
    fingerprint,
    decisions,
    purchaseCounts: { ...route.purchaseCounts },
    minNormalizedHpMargin: replay?.minNormalizedHpMargin ?? route.minNormalizedHpMargin ?? null,
    final: replay?.final ?? route.final ?? null,
    stepCount: route.routeSteps?.length ?? 0
  };
}

export function demoTenFloorRouteFamilyDistance(left, right) {
  if (!left?.decisions || !right?.decisions) throw new Error('Route-family distance requires two route descriptions.');
  const fields = ['f8Vault', 'holyTiming', 'shopStyle'];
  return fields.reduce((distance, field) => distance + Number(left.decisions[field] !== right.decisions[field]), 0);
}

export function createDemoTenFloorRouteDiscoveryPolicies({ maxCycleLength = 3 } = {}) {
  if (!Number.isInteger(maxCycleLength) || maxCycleLength < 2 || maxCycleLength > 5) {
    throw new Error('maxCycleLength must be an integer from 2 through 5.');
  }
  const policies = [];
  for (let length = 2; length <= maxCycleLength; length += 1) {
    for (const shopCycle of cartesianCycles(length)) {
      for (const holyPolicy of ['immediate', 'after-core-6', 'after-core-7', 'before-final']) {
        for (const progressionPriority of ['legacy-clear', 'guardian-first']) {
          policies.push(Object.freeze({ shopCycle, holyPolicy, progressionPriority }));
        }
      }
    }
  }
  return Object.freeze(policies);
}

function candidateQuality(candidate, targetMargin) {
  const margin = candidate.family.minNormalizedHpMargin;
  if (!Number.isFinite(margin)) return -Infinity;
  // Prefer a meaningful safety buffer near the middle of the hard window.
  // It is a tie-breaker only; separation is selected first.
  return -Math.abs(margin - targetMargin);
}

function compareCandidates(left, right, targetMargin) {
  const qualityDelta = candidateQuality(right, targetMargin) - candidateQuality(left, targetMargin);
  if (qualityDelta !== 0) return qualityDelta;
  return left.id.localeCompare(right.id);
}

/**
 * Collapse replayed successful attempts into distinct player-choice families,
 * then choose a compact portfolio whose members differ in at least two
 * campaign decisions.  The selected policies remain provenance only.
 */
export function selectIndependentDemoTenFloorRoutes(attempts, {
  targetFamilies = 3,
  minDistance = 2,
  targetMargin = 0.12
} = {}) {
  if (!Array.isArray(attempts)) throw new Error('Route-family selection requires an attempts array.');
  const championsByFingerprint = new Map();
  for (const attempt of attempts) {
    if (!attempt?.route?.solvable || !attempt?.replay?.ok || !attempt.family) continue;
    const current = championsByFingerprint.get(attempt.family.fingerprint);
    if (!current || compareCandidates(attempt, current, targetMargin) < 0) {
      championsByFingerprint.set(attempt.family.fingerprint, attempt);
    }
  }

  const candidates = [...championsByFingerprint.values()]
    .sort((left, right) => compareCandidates(left, right, targetMargin));
  const selected = [];
  while (selected.length < targetFamilies && candidates.length) {
    let bestIndex = -1;
    let bestDistance = -1;
    for (let index = 0; index < candidates.length; index += 1) {
      const candidate = candidates[index];
      const separation = selected.length === 0
        ? Infinity
        : Math.min(...selected.map((prior) => demoTenFloorRouteFamilyDistance(candidate.family, prior.family)));
      if (separation < minDistance) continue;
      if (separation > bestDistance) {
        bestDistance = separation;
        bestIndex = index;
      } else if (separation === bestDistance && bestIndex >= 0
        && compareCandidates(candidate, candidates[bestIndex], targetMargin) < 0) {
        bestIndex = index;
      }
    }
    if (bestIndex < 0) break;
    selected.push(candidates.splice(bestIndex, 1)[0]);
  }

  return {
    targetFamilies,
    minDistance,
    discoveredFamilies: championsByFingerprint.size,
    selected,
    complete: selected.length >= targetFamilies
  };
}
