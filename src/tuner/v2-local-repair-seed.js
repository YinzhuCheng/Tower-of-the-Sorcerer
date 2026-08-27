export const V2_LOCAL_REPAIR_SEED = Object.freeze({
  id: 'v2-local-repair-seed-2026-08-26',
  sourceCandidateId: 'distributed-pressure-v2',
  sourceAlgorithm: 'v2-failure-core-localized-repair-search-v0.1',
  sourceCommit: '11f5ebc479b8d49d1168f4ff35d05d32d7d7f90f',
  productionWriteAllowed: false,
  repairEdits: Object.freeze([
    Object.freeze({ target: 'enemy', id: 'dragonBoss', field: 'atk', value: 111 }),
    Object.freeze({ target: 'enemy', id: 'flameCaster', field: 'def', value: 44 })
  ]),
  observedEvidence: Object.freeze({
    terminalHp: 7_627,
    minNormalizedHpMargin: 0.667199148029819,
    catastrophicMutations: 3,
    totalMutations: 58,
    exactUnrecoverableMutations: 3,
    recoveryUnknown: 0,
    localOptimal: true,
    semanticFingerprint: 'f7471edbeb30498d',
    localGatePassed: false,
    failureReason: 'pressure_above_target_band'
  })
});

export function cloneV2LocalRepairSeed() {
  return {
    ...V2_LOCAL_REPAIR_SEED,
    repairEdits: V2_LOCAL_REPAIR_SEED.repairEdits.map((edit) => ({ ...edit })),
    observedEvidence: { ...V2_LOCAL_REPAIR_SEED.observedEvidence }
  };
}
