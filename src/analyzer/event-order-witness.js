import { hashValue } from '../solver/state.js';

export const EVENT_ORDER_STEP_SKELETON_TYPE = 'event-order-step-skeleton-v1';

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
  return {
    ...payload,
    witnessHash: hashValue(payload)
  };
}
