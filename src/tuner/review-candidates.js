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

/**
 * Repository-resident snapshot of the first numeric candidate that passed all
 * current review gates. Keeping the explicit edits and purchase policy in source
 * makes later exploit searches reproducible without depending on a CI artifact
 * or VM scratch file.
 *
 * This is evidence/configuration, NOT a production balance write. Canonical
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
      terminalHp: 7_083,
      minNormalizedHpMargin: 0.11616650532429816,
      exactExistenceExpandedStates: 1_736,
      exactExistenceGeneratedStates: 13_665,
      recoveryRate: 0.9333333333333333,
      catastrophicRate: 0.06666666666666667
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
    expectedEvidence: { ...candidate.expectedEvidence }
  };
}
