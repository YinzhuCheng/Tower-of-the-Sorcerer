const RESOURCE_FIELDS = Object.freeze(['hp', 'maxHp', 'atk', 'def', 'gold']);
const CARD_FIELDS = Object.freeze(['sun', 'moon', 'star']);

function freezePolicy(spec) {
  return Object.freeze({
    ...spec,
    shopCycle: Object.freeze([...spec.shopCycle]),
    shopPlan: spec.shopPlan ? Object.freeze([...spec.shopPlan]) : null
  });
}

const BASE_CYCLES = [
  ['def', 'atk', 'hp'],
  ['atk', 'def', 'hp'],
  ['def', 'hp', 'atk'],
  ['atk', 'hp', 'def'],
  ['hp', 'def', 'atk'],
  ['hp', 'atk', 'def']
];

/**
 * Generation-time player portfolio for the 10F setter loop.
 *
 * The first six quality-gate policies are the public recurring build cycles.
 * The next twelve perturb the first few purchases while retaining the same
 * recurring fallback cycle. They are heuristic exploration policies, not proof.
 */
export const DEMO10_CODESIGN_POLICY_SPECS = Object.freeze(BASE_CYCLES.flatMap((cycle) => {
  const slug = cycle.join('-');
  return [
    freezePolicy({ id: `cycle:${slug}`, shopCycle: cycle, shopPlan: null, holyPolicy: 'immediate', qualityGate: true }),
    freezePolicy({
      id: `double-first:${slug}`,
      shopCycle: cycle,
      shopPlan: [cycle[0], cycle[0], cycle[1], cycle[2]],
      holyPolicy: 'immediate',
      qualityGate: false
    }),
    freezePolicy({
      id: `double-second:${slug}`,
      shopCycle: cycle,
      shopPlan: [cycle[0], cycle[1], cycle[1], cycle[2]],
      holyPolicy: 'immediate',
      qualityGate: false
    })
  ];
}));

function stableResourceSignature(sample) {
  const s = sample.resources;
  const c = sample.cards;
  return [
    sample.stateClass,
    ...RESOURCE_FIELDS.map((field) => `${field}:${s[field]}`),
    ...CARD_FIELDS.map((field) => `${field}:${c[field]}`)
  ].join('|');
}

function dominates(a, b) {
  if (a.stateClass !== b.stateClass) return false;
  let strictlyBetter = false;
  for (const field of RESOURCE_FIELDS) {
    const av = Number(a.resources[field] ?? 0);
    const bv = Number(b.resources[field] ?? 0);
    if (av < bv) return false;
    if (av > bv) strictlyBetter = true;
  }
  for (const field of CARD_FIELDS) {
    const av = Number(a.cards[field] ?? 0);
    const bv = Number(b.cards[field] ?? 0);
    if (av < bv) return false;
    if (av > bv) strictlyBetter = true;
  }
  return strictlyBetter;
}

function dedupeCheckpointSamples(samples = []) {
  const byState = new Map();
  for (const sample of samples) {
    const signature = sample.resourceSignature ?? stableResourceSignature(sample);
    const existing = byState.get(signature);
    if (!existing) {
      byState.set(signature, {
        ...sample,
        resourceSignature: signature,
        equivalentPolicyIds: [sample.policyId]
      });
      continue;
    }
    existing.equivalentPolicyIds.push(sample.policyId);
    existing.equivalentPolicyIds.sort();
  }
  return [...byState.values()];
}

export function paretoCheckpointSamples(samples = []) {
  const unique = dedupeCheckpointSamples(samples);
  return unique.filter((candidate, index) => !unique.some((other, otherIndex) =>
    otherIndex !== index && dominates(other, candidate)
  ));
}

function lastBossCheckpoint(report, floor) {
  const battles = report.battleLog?.filter((entry) => entry.floor === floor) ?? [];
  const bosses = battles.filter((entry) => entry.boss || entry.finalBoss);
  return bosses.at(-1) ?? battles.at(-1) ?? null;
}

function sampleFromReport(report, floor, policyId) {
  const checkpoint = lastBossCheckpoint(report, floor);
  if (!checkpoint) return null;
  const resources = { ...checkpoint.statsBefore };
  const cards = { sun: 0, moon: 0, star: 0, ...(checkpoint.cardsBefore ?? {}) };
  const purchasesBefore = Number(
    checkpoint.purchasesBefore
      ?? report.purchaseLog?.filter((entry) => entry.floor <= floor).length
      ?? 0
  );
  const coresBefore = Number(checkpoint.coresBefore ?? Math.min(7, Math.max(0, floor - 1)));
  const relicsBefore = checkpoint.relicsBefore ?? {};
  const stateClass = [
    `p:${purchasesBefore}`,
    `c:${coresBefore}`,
    `holy:${Boolean(relicsBefore.holy)}`,
    `ward:${Boolean(relicsBefore.ward)}`,
    `lucky:${Boolean(relicsBefore.lucky)}`
  ].join('|');
  const purchasePrefix = (report.purchaseLog ?? [])
    .filter((entry) => Number(entry.purchase) <= purchasesBefore)
    .map((entry) => entry.optionId)
    .join(',');
  const sample = {
    floor,
    policyId,
    solvable: Boolean(report.solvable),
    enemyId: checkpoint.enemyId,
    resources,
    cards,
    purchasesBefore,
    coresBefore,
    stateClass,
    historySignature: `${policyId}|${report.holyPolicy ?? 'immediate'}|${purchasePrefix}`
  };
  sample.resourceSignature = stableResourceSignature(sample);
  return sample;
}

function distanceToWidthBand(width, low = 2, high = 8) {
  if (!Number.isFinite(width) || width <= 0) return 1;
  if (width < low) return (low - width) / Math.max(1, low);
  if (width > high) return Math.min(1, (width - high) / Math.max(1, high));
  return 0;
}

export function summarizeDemoTenFloorCheckpoints(reports, {
  policySpecs = DEMO10_CODESIGN_POLICY_SPECS,
  floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  choiceTargetFloors = [2, 3, 4, 5, 6, 7, 8, 9],
  paretoWidthBand = [2, 8]
} = {}) {
  if (!Array.isArray(reports) || reports.length === 0) {
    throw new Error('10F checkpoint analysis requires reports.');
  }
  const profiles = {};
  for (const floor of floors) {
    const samples = reports.map((report, index) => sampleFromReport(
      report,
      floor,
      policySpecs[index]?.id ?? `policy:${index}`
    )).filter(Boolean);
    const frontier = paretoCheckpointSamples(samples);
    const uniqueStates = new Set(samples.map((sample) => sample.resourceSignature));
    const uniqueHistories = new Set(samples.map((sample) => sample.historySignature));
    profiles[floor] = {
      floor,
      sampledPolicies: samples.length,
      victoriousPolicies: samples.filter((sample) => sample.solvable).length,
      uniqueResourceStates: uniqueStates.size,
      uniqueHistories: uniqueHistories.size,
      paretoWidth: frontier.length,
      historyInflation: uniqueHistories.size / Math.max(1, uniqueStates.size),
      frontierPolicyIds: frontier.flatMap((sample) => sample.equivalentPolicyIds ?? [sample.policyId]).sort(),
      frontierStateCount: frontier.length,
      samples
    };
  }

  const targetProfiles = choiceTargetFloors.map((floor) => profiles[floor]).filter(Boolean);
  const maxParetoWidth = Math.max(0, ...targetProfiles.map((profile) => profile.paretoWidth));
  const meanParetoWidth = targetProfiles.length
    ? targetProfiles.reduce((sum, profile) => sum + profile.paretoWidth, 0) / targetProfiles.length
    : 0;
  const maxHistoryInflation = Math.max(1, ...targetProfiles.map((profile) => profile.historyInflation));
  const choiceLoss = targetProfiles.length
    ? targetProfiles.reduce((sum, profile) => sum + distanceToWidthBand(
      profile.paretoWidth,
      paretoWidthBand[0],
      paretoWidthBand[1]
    ), 0) / targetProfiles.length
    : 1;
  const oversizedCheckpoints = targetProfiles
    .filter((profile) => profile.paretoWidth > paretoWidthBand[1])
    .map((profile) => profile.floor);
  const collapsedCheckpoints = targetProfiles
    .filter((profile) => profile.paretoWidth < paretoWidthBand[0])
    .map((profile) => profile.floor);
  const totalHistories = targetProfiles.reduce((sum, profile) => sum + profile.uniqueHistories, 0);
  const totalActionSurfaces = targetProfiles.reduce((sum, profile) => sum + profile.uniqueResourceStates, 0);

  return {
    schemaVersion: 2,
    model: 'demo-10f-checkpoint-portfolio-v0.2-dedup',
    heuristicOnly: true,
    policyCount: reports.length,
    paretoWidthBand: [...paretoWidthBand],
    choiceTargetFloors: [...choiceTargetFloors],
    maxParetoWidth,
    meanParetoWidth,
    maxHistoryInflation,
    choiceLoss,
    oversizedCheckpoints,
    collapsedCheckpoints,
    floors: profiles,
    prunabilityEvidence: {
      routePortfolio: { paretoWidth: maxParetoWidth },
      boundary: {
        activeGoalLabels: maxParetoWidth,
        goalStructuralStates: totalHistories,
        actionSurfaceStructuralStates: Math.max(1, totalActionSurfaces)
      }
    }
  };
}
