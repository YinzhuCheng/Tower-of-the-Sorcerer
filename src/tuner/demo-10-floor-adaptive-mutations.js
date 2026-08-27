import { proposeProofFriendlyMutations } from './proof-friendly-mutations.js';

function mutationFloors(mutation) {
  if (mutation.kind === 'slot-swap') return [mutation.floor];
  if (mutation.kind === 'cross-floor-swap') return [mutation.a.floor, mutation.b.floor];
  if (mutation.id.startsWith('f8-')) return [8];
  if (mutation.id.startsWith('f9-')) return [9];
  return [];
}

function familyOf(mutation) {
  if (mutation.kind === 'enemy-delta') return 'enemy-pressure';
  if (mutation.kind === 'cross-floor-swap') return 'cross-floor-timing';
  if (mutation.group.includes('door')) return 'door-card-cost';
  if (mutation.group.includes('rune')) return 'rune-placement';
  if (mutation.group.includes('card')) return 'card-placement';
  if (mutation.group.includes('reward') || mutation.group.includes('stat')) return 'reward-placement';
  if (mutation.group.includes('enemy')) return 'enemy-placement';
  return 'other';
}

function intersects(values, set) {
  return values.some((value) => set.has(value));
}

/**
 * Turn checkpoint diagnostics into a concrete 10F mutation subset.
 *
 * The selector is deliberately conservative: if the diagnostic problem is on a
 * floor for which the current mutation catalogue has no semantic slots, it
 * reports that floor as unhandled instead of mutating an unrelated late floor.
 * A healthy checkpoint portfolio may legitimately request zero mutations.
 */
export function proposeDemoTenFloorAdaptiveMutations(checkpoints, catalog = []) {
  const targetFloors = checkpoints?.choiceTargetFloors ?? [];
  const profiles = checkpoints?.floors ?? {};
  const oversized = new Set(checkpoints?.oversizedCheckpoints ?? []);
  const collapsed = new Set(checkpoints?.collapsedCheckpoints ?? []);
  const historyInflated = new Set(targetFloors.filter((floor) =>
    Number(profiles[floor]?.historyInflation ?? 1) > 4
  ));
  const genericSuggestions = proposeProofFriendlyMutations(checkpoints?.prunabilityEvidence ?? {});
  const suggestionIds = new Set(genericSuggestions.map((suggestion) => suggestion.id));
  const issueFloors = new Set([...oversized, ...collapsed, ...historyInflated]);
  const catalogFloors = new Set(catalog.flatMap(mutationFloors));
  const unhandledFloors = [...issueFloors].filter((floor) => !catalogFloors.has(floor)).sort((a, b) => a - b);

  const reasons = [];
  if (oversized.size) reasons.push(`oversized:${[...oversized].sort((a, b) => a - b).join(',')}`);
  if (collapsed.size) reasons.push(`collapsed:${[...collapsed].sort((a, b) => a - b).join(',')}`);
  if (historyInflated.size) reasons.push(`history-inflated:${[...historyInflated].sort((a, b) => a - b).join(',')}`);
  for (const suggestion of genericSuggestions) reasons.push(`generic:${suggestion.id}`);

  const selected = catalog.filter((mutation) => {
    const floors = mutationFloors(mutation);
    const family = familyOf(mutation);
    const touchesOversized = intersects(floors, oversized);
    const touchesCollapsed = intersects(floors, collapsed);
    const touchesInflated = intersects(floors, historyInflated);

    if (touchesOversized) {
      return ['enemy-pressure', 'enemy-placement', 'reward-placement', 'card-placement', 'door-card-cost', 'cross-floor-timing'].includes(family);
    }
    if (touchesCollapsed) {
      return ['enemy-placement', 'reward-placement', 'card-placement', 'door-card-cost', 'rune-placement', 'cross-floor-timing'].includes(family);
    }
    if (touchesInflated) {
      return ['reward-placement', 'card-placement', 'door-card-cost', 'rune-placement', 'cross-floor-timing'].includes(family);
    }

    if (suggestionIds.has('separate-near-tie-branches')) {
      return ['enemy-pressure', 'reward-placement', 'card-placement', 'door-card-cost'].includes(family)
        && floors.some((floor) => floor >= 8);
    }
    if (suggestionIds.has('checkpoint-reconvergence')) {
      return ['reward-placement', 'card-placement', 'door-card-cost', 'cross-floor-timing'].includes(family);
    }
    if (suggestionIds.has('restore-meaningful-choice')) {
      return ['card-placement', 'door-card-cost', 'rune-placement', 'enemy-placement'].includes(family);
    }
    return false;
  });

  return {
    schemaVersion: 1,
    model: 'demo-10f-adaptive-mutation-plan-v0.1',
    heuristicOnly: true,
    productionWriteAllowed: false,
    reasons,
    genericSuggestions,
    issueFloors: [...issueFloors].sort((a, b) => a - b),
    unhandledFloors,
    selectedMutationIds: selected.map((mutation) => mutation.id).sort(),
    selectedMutations: selected
  };
}
