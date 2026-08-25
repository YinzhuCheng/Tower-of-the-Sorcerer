export const EVENT_ORDER_EVIDENCE = Object.freeze({
  distributedPressureV1: Object.freeze({
    schemaVersion: 1,
    model: 'event-order-threshold-exploit-evidence-v0.1',
    candidateId: 'distributed-pressure-v1',
    status: 'exploit-proven',
    exploitFound: true,
    exactNoExploit: false,
    referenceTerminalHp: 7_083,
    exploitTerminalHp: 7_187,
    deltaHp: 104,
    relativeGain: 104 / 7_083,
    sourceBranch: 'solver-phase1-pareto',
    sourceCommit: 'eda19b6297f3f4a3a00d6f23c1a0041a860db790',
    sourceWorkflow: 'Event Order Profile',
    sourceWorkflowRun: 32817140999,
    proofModel: 'event-order-core-transition-chain-v0.2-late-harvest',
    threshold: 7_083,
    chain: Object.freeze({
      prefixCertificateHash: '13b5c77bfc12c595',
      transitionCertificateHash: 'b35c234d90a72b8d',
      suffixCertificateHash: 'b4d28205d98368b5'
    }),
    bridge: Object.freeze({
      cores: 7,
      hp: 6_204,
      gold: 1_304,
      shopPurchases: 20,
      optimisticTerminalHpUpperBound: 7_822
    }),
    suffixSearch: Object.freeze({
      expandedStates: 1_307,
      generatedStates: 6_137,
      prunedBound: 149,
      stoppedReason: 'goalFound',
      authoritativeReplay: true
    }),
    productionWriteAllowed: false,
    interpretation: 'known_replay_verified_event_order_route_beats_the_numeric_holy_purchase_reference'
  })
});

export function eventOrderEvidenceForCandidate(candidateId) {
  return Object.values(EVENT_ORDER_EVIDENCE).find((entry) => entry.candidateId === candidateId) ?? null;
}
