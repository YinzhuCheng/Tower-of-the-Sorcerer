export const EVENT_ORDER_EVIDENCE = Object.freeze({
  distributedPressureV1: Object.freeze({
    schemaVersion: 2,
    model: 'event-order-player-response-evidence-v0.2',
    candidateId: 'distributed-pressure-v1',
    status: 'exploit-proven',
    exploitFound: true,
    exactNoExploit: false,
    referenceTerminalHp: 7_083,
    proofExploit: Object.freeze({
      terminalHp: 7_187,
      deltaHp: 104,
      relativeGain: 104 / 7_083,
      sourceBranch: 'solver-phase1-pareto',
      sourceCommit: 'eda19b6297f3f4a3a00d6f23c1a0041a860db790',
      sourceWorkflow: 'Event Order Profile',
      sourceWorkflowRun: 32817140999,
      proofModel: 'event-order-core-transition-chain-v0.2-late-harvest',
      chain: Object.freeze({
        prefixCertificateHash: '13b5c77bfc12c595',
        transitionCertificateHash: 'b35c234d90a72b8d',
        suffixCertificateHash: '489dff7476f37d10'
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
      })
    }),
    jointLocalResponse: Object.freeze({
      model: 'event-order-purchase-local-1opt-v0.1',
      sourceCommit: '06377bd945a1de10fdebdce93b269c926d7f345c',
      sourceWorkflow: 'Event Order Profile',
      sourceWorkflowRun: 32818179604,
      seedTerminalHp: 7_187,
      bestTerminalHp: 7_687,
      improvementOverProofExploit: 500,
      improvementOverReference: 604,
      relativeGainOverReference: 604 / 7_083,
      minNormalizedHpMargin: 0.42627206645898236,
      localOptimal: true,
      improvementPasses: 3,
      evaluatedMutations: 232,
      shopSteps: 29,
      witnessHash: '34a27dcc2d368edf',
      acceptedMutations: Object.freeze([
        Object.freeze({ purchaseIndex: 1, from: 'def', to: 'atk', deltaHp: 197 }),
        Object.freeze({ purchaseIndex: 3, from: 'atk', to: 'def', deltaHp: 277 }),
        Object.freeze({ purchaseIndex: 11, from: 'hp', to: 'def', deltaHp: 26 })
      ]),
      interpretation: 'authoritative_purchase_1opt_on_fixed_event_order_witness; not_joint_global_optimum'
    }),
    strongestKnownTerminalHp: 7_687,
    strongestKnownMinNormalizedHpMargin: 0.42627206645898236,
    productionWriteAllowed: false,
    interpretation: 'known_event_order_and_purchase_response_is_materially_stronger_than_the_numeric_holy_purchase_reference'
  })
});

export function eventOrderEvidenceForCandidate(candidateId) {
  return Object.values(EVENT_ORDER_EVIDENCE).find((entry) => entry.candidateId === candidateId) ?? null;
}
