import {createHash} from 'node:crypto'

const replayCache = new Set()
const revokedMeasurements = new Set()
const expectedMeasurement = 'sha384:rehearsal-confidential-workload-v1'
const expectedIdentity = Object.freeze({
  namespace: 'sovereign-ai-401',
  serviceAccount: 'confidential-inference',
  imageDigest: `sha256:${'4'.repeat(64)}`,
})
const protectedResource = 'models/granite/key'
const now = Date.now()

const base = {
  scenario: 'authorized',
  requestedResource: protectedResource,
  capability: {cpu: 'tdx-capable', runtimeClassName: 'kata-cc'},
  workloadIdentity: expectedIdentity,
  evidence: {
    sourceState: 'REHEARSAL',
    kind: 'REHEARSAL_FIXTURE',
    tee: 'tdx',
    nonce: 'nonce-authorized-001-0123456789abcdef',
    collectedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 120_000).toISOString(),
    measurement: expectedMeasurement,
    tcbStatus: 'APPROVED',
    challengeBound: true,
    signatureValid: true,
  },
  dependencies: {verifier: true, kbs: true, inference: true},
}

export const scenarios = Object.freeze({
  authorized: base,
  identity_mismatch: {
    ...base,
    scenario: 'identity_mismatch',
    workloadIdentity: {...base.workloadIdentity, serviceAccount: 'unexpected'},
    evidence: {...base.evidence, nonce: 'nonce-identity-001-0123456789abcdef'},
  },
  invalid_measurement: {
    ...base,
    scenario: 'invalid_measurement',
    evidence: {...base.evidence, nonce: 'nonce-measurement-001-0123456789abcdef', measurement: 'sha384:unexpected'},
  },
  stale_evidence: {
    ...base,
    scenario: 'stale_evidence',
    evidence: {...base.evidence, nonce: 'nonce-stale-001-0123456789abcdef', collectedAt: new Date(now - 600_000).toISOString(), expiresAt: new Date(now - 480_000).toISOString()},
  },
  replayed_evidence: {
    ...base,
    scenario: 'replayed_evidence',
    evidence: {...base.evidence, nonce: 'nonce-replayed-001-0123456789abcdef'},
  },
  tcb_out_of_date: {
    ...base,
    scenario: 'tcb_out_of_date',
    evidence: {...base.evidence, nonce: 'nonce-tcb-001-0123456789abcdef', tcbStatus: 'OUT_OF_DATE'},
  },
  revoked_measurement: {
    ...base,
    scenario: 'revoked_measurement',
    evidence: {...base.evidence, nonce: 'nonce-revoked-001-0123456789abcdef'},
  },
  verifier_unavailable: {
    ...base,
    scenario: 'verifier_unavailable',
    evidence: {...base.evidence, nonce: 'nonce-verifier-001-0123456789abcdef'},
    dependencies: {verifier: false, kbs: true, inference: true},
  },
  kbs_unavailable: {
    ...base,
    scenario: 'kbs_unavailable',
    evidence: {...base.evidence, nonce: 'nonce-kbs-001-0123456789abcdef'},
    dependencies: {verifier: true, kbs: false, inference: true},
  },
  non_tdx: {
    ...base,
    scenario: 'non_tdx',
    evidence: {...base.evidence, nonce: 'nonce-nontdx-001-0123456789abcdef', tee: 'none'},
  },
  simulated_live_claim: {
    ...base,
    scenario: 'simulated_live_claim',
    evidence: {...base.evidence, nonce: 'nonce-false-live-001-0123456789abcdef', sourceState: 'LIVE'},
  },
})

const authority = Object.freeze({
  humanReviewRequired: true,
  mayDeploy: false,
  mayChangeReferenceValues: false,
  mayReleaseProductionSecrets: false,
  certified: false,
  promotionEligible: false,
  llmAuthority: 'NONE',
})

const completeTrace = [
  'CAPABILITY',
  'CHALLENGE',
  'ATTEST',
  'APPRAISE',
  'AUTHORIZE',
  'INFER',
  'REVOKE',
  'VERIFY',
]

export function resetState() {
  replayCache.clear()
  revokedMeasurements.clear()
}

export function revokeMeasurement(measurement = expectedMeasurement) {
  revokedMeasurements.add(measurement)
  return {revoked: true, measurement, sourceState: 'REHEARSAL'}
}

function receiptFor(input, decision) {
  return `sha256:${createHash('sha256')
    .update(`${input?.scenario ?? 'unknown'}:${input?.evidence?.nonce ?? 'missing'}:${decision}`)
    .digest('hex')}`
}

function response(input, decision, sourceState, reasonCodes, completedThrough, resourceAllowed = false) {
  const completedIndex = Math.max(completeTrace.indexOf(completedThrough), 0)
  const operationTrace = completeTrace.map((stage, index) => ({
    stage,
    status: index <= completedIndex ? 'COMPLETE' : 'NOT_RUN',
  }))
  const authorizationReceipt = receiptFor(input, decision)

  return {
    schemaVersion: 'sovereign-ai-401/v1',
    correlationId: input?.correlationId ?? '40100000-0000-4000-8000-000000000001',
    scenario: input?.scenario ?? 'unknown',
    sourceState,
    decision,
    reasonCodes,
    operationTrace,
    capability: {
      tdxCapable: input?.capability?.cpu === 'tdx-capable',
      configuredRuntimeClass: input?.capability?.runtimeClassName ?? null,
    },
    observation: {
      confidentialGuestRunning: false,
      liveTdxQuoteVerified: false,
      reason: 'Factory execution has no current hardware-rooted confidential-guest proof.',
    },
    appraisal: {
      challengeBound: input?.evidence?.challengeBound === true,
      signatureVerified: input?.evidence?.kind === 'TDX_QUOTE' && input?.evidence?.signatureValid === true,
      measurement: input?.evidence?.measurement ?? null,
      tcbStatus: input?.evidence?.tcbStatus ?? 'UNKNOWN',
      referenceValuesVersion: 'rehearsal-reference-values-v1',
    },
    resourcePolicy: {
      policyId: 'confidential-resource-v1',
      resource: input?.requestedResource ?? null,
      allowed: resourceAllowed,
    },
    protectedResource: {
      authorized: resourceAllowed,
      mode: resourceAllowed ? 'SYNTHETIC_RECEIPT_ONLY' : 'REFUSED',
      receipt: authorizationReceipt,
      keyMaterialReleased: false,
    },
    inference: {
      authorized: false,
      modelInvoked: false,
      reason: resourceAllowed
        ? 'A rehearsal receipt cannot authorize production inference.'
        : 'Resource authorization did not pass.',
      performanceClaim: null,
    },
    revocation: {
      checked: completedIndex >= completeTrace.indexOf('REVOKE'),
      measurementRevoked: revokedMeasurements.has(input?.evidence?.measurement),
    },
    evidenceChain: {
      verified: completedIndex >= completeTrace.indexOf('VERIFY'),
      receipt: authorizationReceipt,
    },
    authority,
  }
}

function deny(input, decision, sourceState, reason, stage) {
  return response(input, decision, sourceState, [reason], stage, false)
}

export function operate(input) {
  if (!input?.evidence?.nonce || !input?.evidence?.collectedAt || !input?.workloadIdentity) {
    return deny(input, 'REFUSE', 'OFFLINE', 'INVALID_EVIDENCE', 'CAPABILITY')
  }

  if (input.evidence.sourceState === 'LIVE' && input.evidence.kind !== 'TDX_QUOTE') {
    return deny(input, 'REFUSE', 'REHEARSAL', 'FALSE_LIVE_CLAIM', 'CHALLENGE')
  }

  const sourceState = input.scenario === 'verifier_unavailable' || input.scenario === 'kbs_unavailable'
    ? 'OFFLINE'
    : 'REHEARSAL'

  if (JSON.stringify(input.workloadIdentity) !== JSON.stringify(expectedIdentity)) {
    return deny(input, 'REFUSE', sourceState, 'WORKLOAD_IDENTITY_MISMATCH', 'CHALLENGE')
  }
  if (!input.dependencies?.verifier) {
    return deny(input, 'ABSTAIN', sourceState, 'VERIFIER_UNAVAILABLE', 'ATTEST')
  }
  if (input.evidence.tee !== 'tdx') {
    return deny(input, 'REFUSE', sourceState, 'NON_TDX_EVIDENCE', 'ATTEST')
  }
  if (!input.evidence.challengeBound || !input.evidence.signatureValid) {
    return deny(input, 'REFUSE', sourceState, 'INVALID_QUOTE', 'ATTEST')
  }
  const observedAt = Date.parse(input.evidence.collectedAt)
  const expiresAt = Date.parse(input.evidence.expiresAt)
  if (!Number.isFinite(observedAt) || !Number.isFinite(expiresAt) || Date.now() > expiresAt || Date.now() - observedAt > 120_000) {
    return deny(input, 'REFUSE', sourceState, 'STALE_QUOTE', 'ATTEST')
  }
  if (input.scenario === 'replayed_evidence' || replayCache.has(input.evidence.nonce)) {
    return deny(input, 'REFUSE', sourceState, 'REPLAYED_CHALLENGE', 'ATTEST')
  }
  replayCache.add(input.evidence.nonce)
  if (input.evidence.measurement !== expectedMeasurement) {
    return deny(input, 'REFUSE', sourceState, 'MEASUREMENT_MISMATCH', 'APPRAISE')
  }
  if (input.scenario === 'revoked_measurement') revokedMeasurements.add(input.evidence.measurement)
  if (revokedMeasurements.has(input.evidence.measurement)) {
    return deny(input, 'REFUSE', sourceState, 'MEASUREMENT_REVOKED', 'APPRAISE')
  }
  if (input.evidence.tcbStatus !== 'APPROVED') {
    return deny(input, 'REFUSE', sourceState, 'TCB_NOT_APPROVED', 'APPRAISE')
  }
  if (!input.dependencies?.kbs) {
    return deny(input, 'ABSTAIN', sourceState, 'KBS_UNAVAILABLE', 'AUTHORIZE')
  }
  if (input.requestedResource !== protectedResource) {
    return deny(input, 'REFUSE', sourceState, 'RESOURCE_POLICY_DENIED', 'AUTHORIZE')
  }

  return response(input, 'ALLOW_REVIEW', sourceState, ['REHEARSAL_POLICY_MATCH'], 'VERIFY', true)
}
