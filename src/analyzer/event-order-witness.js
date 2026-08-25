import { hashValue } from '../solver/state.js';

export const EVENT_ORDER_STEP_SKELETON_TYPE = 'event-order-step-skeleton-v1';
export const EVENT_ORDER_SEMANTIC_FINGERPRINT_MODEL = 'event-order-semantic-fingerprint-v1';

function cloneStep(step) {
  return {
    eventId: step.eventId,
    kind: step.kind,
    automatic: Boolean(step.automatic),
    floorBefore: step.floorBefore,
    location: Array.isArray(step.location) ? [...step.location] : null,
    path: [...(step.path ?? [])],
    action: step.action ? structuredClone(step.action) : null
  };
}

function semanticAction(step) {
  const action = step?.action ?? {};
  const identity = {};
  if (typeof action.token === 'string') identity.token = action.token;
  if (typeof action.optionId === 'string') identity.optionId = action.optionId;
  if (Number.isInteger(action.targetFloor)) identity.targetFloor = action.targetFloor;
  if (typeof action.parsed?.type === 'string') identity.parsedType = action.parsed.type;
  if (typeof action.parsed?.id === 'string') identity.parsedId = action.parsed.id;
  return identity;
}

/**
 * Stable, numeric-agnostic identity for the strategic event order represented by
 * a step witness.
 *
 * Deliberately excluded:
 * - source certificate hashes (proof provenance, not player policy),
 * - zero-cost movement paths (BFS/tie-break implementation detail),
 * - coordinates already represented by the stable semantic event id,
 * - numeric resource snapshots (not present in a step skeleton anyway).
 *
 * Included:
 * - ordered semantic event id and kind,
 * - automatic-vs-explicit status,
 * - floor before the macro event,
 * - action fields that change the strategic choice (shop option, teleport target,
 *   tile token / parsed semantic type).
 *
 * A raw `witnessHash` remains useful provenance for an exact generated skeleton;
 * this fingerprint is the review-candidate identity that should remain stable
 * when proof certificates or free movement paths are reconstructed differently.
 */
export function eventOrderWitnessSemanticFingerprint(witness) {
  if (!witness?.steps?.length) return null;
  const payload = {
    model: EVENT_ORDER_SEMANTIC_FINGERPRINT_MODEL,
    steps: witness.steps.map((step) => ({
      eventId: step.eventId ?? null,
      kind: step.kind ?? null,
      automatic: Boolean(step.automatic),
      floorBefore: Number.isInteger(step.floorBefore) ? step.floorBefore : null,
      action: semanticAction(step)
    }))
  };
  return hashValue(payload);
}

/**
 * Strip numeric resource/structural snapshots from proof certificates while
 * preserving the exact path/action order needed to attempt the route under a
 * numeric-only balance overlay.
 */
export function extractEventOrderStepSkeleton(certificates) {
  if (!Array.isArray(certificates) || certificates.length === 0) {
    throw new Error('Event-order skeleton requires at least one certificate.');
  }
  const steps = [];
  const certificateHashes = [];
  for (const certificate of certificates) {
    if (!certificate || !Array.isArray(certificate.steps)) {
      throw new Error('Event-order skeleton received an invalid certificate.');
    }
    certificateHashes.push(certificate.certificateHash ?? null);
    steps.push(...certificate.steps.map(cloneStep));
  }
  return { steps, certificateHashes };
}

export function buildEventOrderStepWitness({
  candidateId,
  referenceTerminalHp,
  expectedTerminalHp,
  certificates
} = {}) {
  if (typeof candidateId !== 'string' || candidateId.length === 0) {
    throw new Error('Event-order witness requires candidateId.');
  }
  if (!Number.isFinite(referenceTerminalHp) || !Number.isFinite(expectedTerminalHp)) {
    throw new Error('Event-order witness requires finite terminal HP values.');
  }
  const extracted = extractEventOrderStepSkeleton(certificates);
  const payload = {
    type: EVENT_ORDER_STEP_SKELETON_TYPE,
    schemaVersion: 1,
    candidateId,
    referenceTerminalHp,
    expectedTerminalHp,
    sourceCertificateHashes: extracted.certificateHashes,
    steps: extracted.steps
  };
  const witness = {
    ...payload,
    witnessHash: hashValue(payload)
  };
  witness.semanticFingerprint = eventOrderWitnessSemanticFingerprint(witness);
  return witness;
}
