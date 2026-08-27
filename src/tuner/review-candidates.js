const REVIEW_CANDIDATE_V1_EDITS = Object.freeze([
  Object.freeze({ target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 56 }),
  Object.freeze({ target: 'shop', id: 'hp', field: 'effect.hp', value: 320 }),
  Object.freeze({ target: 'shop', id: 'hp', field: 'effect.maxHp', value: 320 }),
  Object.freeze({ target: 'enemy', id: 'flameCaster', field: 'def', value: 63 })
]);

const REVIEW_CANDIDATE_V1_SHOP_PLAN = Object.freeze([
  'def', 'def', 'def',
  'atk', 'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp',
  'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp'
]);

const REVIEW_CANDIDATE_V2_EDITS = Object.freeze([
  Object.freeze({ target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 62 }),
  Object.freeze({ target: 'shop', id: 'hp', field: 'effect.hp', value: 150 }),
  Object.freeze({ target: 'shop', id: 'hp', field: 'effect.maxHp', value: 150 }),
  Object.freeze({ target: 'enemy', id: 'flameCaster', field: 'def', value: 70 })
]);

// This sequence is extracted from the replay-verified 0.8375 event-order witness.
// It is part of the V2 sub-problem definition and must remain byte-for-byte
// consistent with the rebuilt witness before any fixed-purchase proof can run.
const REVIEW_CANDIDATE_V2_SHOP_PLAN = Object.freeze([
  'atk', 'atk', 'atk',
  'def', 'def',
  'atk', 'atk',
  'def',
  'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk', 'atk',
  'def',
  'hp', 'hp',
  'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp'
]);

// V3 is the first coupled failure-core forgiveness + late-pressure candidate.
// These values came from repository-run monotone repair/compensation searches;
// they remain a dry-run snapshot and are not canonical game writes.
const REVIEW_CANDIDATE_V3_EDITS = Object.freeze([
  Object.freeze({ target: 'enemy', id: 'whaleSinger', field: 'magicPower', value: 62 }),
  Object.freeze({ target: 'shop', id: 'hp', field: 'effect.hp', value: 150 }),
  Object.freeze({ target: 'shop', id: 'hp', field: 'effect.maxHp', value: 150 }),
  Object.freeze({ target: 'enemy', id: 'flameCaster', field: 'def', value: 44 }),
  Object.freeze({ target: 'enemy', id: 'dragonBoss', field: 'atk', value: 111 }),
  Object.freeze({ target: 'enemy', id: 'cometArcher', field: 'atk', value: 200 })
]);

const REVIEW_CANDIDATE_V3_SHOP_PLAN = Object.freeze([
  'def', 'def', 'def',
  'atk', 'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk',
  'def',
  'atk', 'atk', 'atk', 'atk', 'atk',
  'hp', 'hp',
  'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp'
]);

/**
 * Repository-resident dry-run balance candidates.
 *
 * V1 references a deterministic greedy-event-order route. V2 and V3 reference
 * numeric-agnostic event-order step witnesses that must be rebuilt and
 * authoritatively replayed under their current overlays before their HP may be
 * trusted as proof thresholds.
 *
 * Event-order reference identity is semantic-first for V2/V3. The semantic
 * fingerprint hashes ordered macro events and strategic action choices while
 * excluding source certificate hashes and zero-cost movement paths. Raw witness
 * hashes remain provenance diagnostics.
 *
 * These are evidence/configuration, NOT production balance writes. Canonical
 * `src/game/data.js` remains unchanged and production writes stay disabled.
 */
export const REVIEW_CANDIDATES = Object.freeze({
  distributedPressureV1: Object.freeze({
    id: 'distributed-pressure-v1',
    sourceModel: 'adaptive-numeric-ray-v0.3-complete-holy-coverage',
    productionWriteAllowed: false,
    edits: REVIEW_CANDIDATE_V1_EDITS,
    purchasePolicy: Object.freeze({
      shopCycle: Object.freeze(['def', 'atk', 'hp']),
      shopPlan: REVIEW_CANDIDATE_V1_SHOP_PLAN,
      referenceHolyPolicy: 'immediate'
    }),
    expectedEvidence: Object.freeze({
      referenceMode: 'greedy-strategy',
      terminalHp: 7_083,
      minNormalizedHpMargin: 0.11616650532429816,
      exactExistenceExpandedStates: 1_736,
      exactExistenceGeneratedStates: 13_665,
      recoveryRate: 0.9333333333333333,
      catastrophicRate: 0.06666666666666667
    })
  }),
  distributedPressureV2: Object.freeze({
    id: 'distributed-pressure-v2',
    sourceModel: 'event-order-witness-pressure-ray-v0.1',
    sourceCandidateId: 'distributed-pressure-v1',
    sourceContinuationStartStep: 0.6453125,
    sourceRayStep: 0.8375,
    productionWriteAllowed: false,
    edits: REVIEW_CANDIDATE_V2_EDITS,
    purchasePolicy: Object.freeze({
      shopCycle: Object.freeze(['def', 'atk', 'hp']),
      shopPlan: REVIEW_CANDIDATE_V2_SHOP_PLAN,
      referenceHolyPolicy: 'immediate'
    }),
    expectedEvidence: Object.freeze({
      referenceMode: 'event-order-step-witness',
      terminalHp: 4_578,
      minNormalizedHpMargin: 0.14945652173913043,
      referenceWitnessHash: '8623f0ba330d21b3',
      referenceSemanticFingerprint: '361000c0b48dba27',
      witnessSteps: 241,
      purchaseCount: 29,
      pressureTarget: Object.freeze([0.08, 0.25])
    })
  }),
  distributedPressureV3: Object.freeze({
    id: 'distributed-pressure-v3',
    sourceModel: 'v2-coupled-forgiveness-pressure-compensation-v0.1',
    sourceCandidateId: 'distributed-pressure-v2',
    sourceRepairSeedId: 'v2-local-repair-seed-2026-08-26',
    sourceCompensation: Object.freeze({
      target: 'enemy', id: 'cometArcher', field: 'atk', from: 128, to: 200
    }),
    productionWriteAllowed: false,
    edits: REVIEW_CANDIDATE_V3_EDITS,
    purchasePolicy: Object.freeze({
      shopCycle: Object.freeze(['def', 'atk', 'hp']),
      shopPlan: REVIEW_CANDIDATE_V3_SHOP_PLAN,
      referenceHolyPolicy: 'immediate'
    }),
    expectedEvidence: Object.freeze({
      referenceMode: 'event-order-step-witness',
      terminalHp: 4_459,
      minNormalizedHpMargin: 0.24545454545454545,
      referenceWitnessHash: '5f2eaa7dcee33508',
      referenceSemanticFingerprint: 'f7471edbeb30498d',
      witnessSteps: 241,
      purchaseCount: 29,
      localCatastrophicMutations: 4,
      localExactUnrecoverableMutations: 4,
      localRecoveryUnknown: 0,
      pressureTarget: Object.freeze([0.08, 0.25])
    })
  })
});

export function cloneReviewCandidate(candidate = REVIEW_CANDIDATES.distributedPressureV1) {
  if (!candidate) throw new Error('Review candidate is required.');
  return {
    ...candidate,
    edits: candidate.edits.map((edit) => ({ ...edit })),
    purchasePolicy: {
      ...candidate.purchasePolicy,
      shopCycle: [...candidate.purchasePolicy.shopCycle],
      shopPlan: [...candidate.purchasePolicy.shopPlan]
    },
    expectedEvidence: {
      ...candidate.expectedEvidence,
      pressureTarget: Array.isArray(candidate.expectedEvidence?.pressureTarget)
        ? [...candidate.expectedEvidence.pressureTarget]
        : candidate.expectedEvidence?.pressureTarget
    },
    sourceCompensation: candidate.sourceCompensation
      ? { ...candidate.sourceCompensation }
      : candidate.sourceCompensation
  };
}
