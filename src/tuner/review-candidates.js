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

// Purchase 1-opt response on the 241-step event-order witness at ray step 0.8375.
const REVIEW_CANDIDATE_V2_SHOP_PLAN = Object.freeze([
  'atk', 'atk', 'atk',
  'def', 'def',
  'atk', 'atk',
  'def',
  'atk', 'atk', 'atk', 'atk',
  'atk', 'atk', 'atk', 'atk',
  'def',
  'hp', 'hp',
  'atk',
  'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp', 'hp'
]);

/**
 * Repository-resident dry-run balance candidates.
 *
 * V1 references a deterministic greedy-event-order route. V2 is intentionally
 * different: its reference is a numeric-agnostic event-order step witness that
 * must be rebuilt and authoritatively replayed under the V2 overlay before its
 * HP may be trusted as a threshold. Keeping that distinction explicit prevents
 * a stronger player-model result from being silently reinterpreted as a greedy
 * route expectation.
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
      witnessSteps: 241,
      purchaseCount: 29,
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
    }
  };
}
