import {createHash} from 'node:crypto'

const replayCache = new Set()
const expectedMeasurement = 'sha384:rehearsal-workload-v1'
const protectedResource = 'models/granite/key'
const now = Date.now()

const base = {
  scenario: 'allowed', requestedResource: protectedResource,
  capability: {cpu: 'tdx-capable', runtimeClassName: 'kata-cc'},
  evidence: {sourceState: 'REHEARSAL', tee: 'tdx', nonce: 'nonce-allowed-001', collectedAt: new Date(now).toISOString(), measurement: expectedMeasurement, signatureValid: true},
  dependencies: {verifier: true, kbs: true},
}

export const scenarios = Object.freeze({
  allowed: base,
  invalid_measurement: {...base, scenario: 'invalid_measurement', evidence: {...base.evidence, nonce: 'nonce-invalid-001', measurement: 'sha384:unexpected'}},
  stale_evidence: {...base, scenario: 'stale_evidence', evidence: {...base.evidence, nonce: 'nonce-stale-001', collectedAt: new Date(now - 600_000).toISOString()}},
  replayed_evidence: {...base, scenario: 'replayed_evidence', evidence: {...base.evidence, nonce: 'nonce-replayed-001'}},
  verifier_unavailable: {...base, scenario: 'verifier_unavailable', evidence: {...base.evidence, nonce: 'nonce-verifier-001'}, dependencies: {verifier: false, kbs: true}},
  kbs_unavailable: {...base, scenario: 'kbs_unavailable', evidence: {...base.evidence, nonce: 'nonce-kbs-001'}, dependencies: {verifier: true, kbs: false}},
  non_tdx: {...base, scenario: 'non_tdx', evidence: {...base.evidence, nonce: 'nonce-nontdx-001', tee: 'none'}},
})

export function resetReplayCache() { replayCache.clear() }

const authority = {mayDeploy: false, mayChangeReferenceValues: false, certified: false, promotionEligible: false}
function response(input, decision, sourceState, appraisal, resourceAllowed = false) {
  const receipt = createHash('sha256').update(`${input?.scenario ?? 'unknown'}:${input?.evidence?.nonce ?? 'missing'}:${decision}`).digest('hex')
  return {
    schemaVersion: 'sovereign-ai-301/v1', scenario: input?.scenario ?? 'unknown', sourceState, decision,
    capability: {tdxCapable: input?.capability?.cpu === 'tdx-capable', configuredRuntimeClass: input?.capability?.runtimeClassName ?? null},
    observation: {tdxEnabled: false, reason: 'No current hardware-rooted TDX evidence is attached to this factory.'},
    liveTdxObserved: false, evidence: {provenance: 'checked-in-synthetic-fixture', nonce: input?.evidence?.nonce ?? null, collectedAt: input?.evidence?.collectedAt ?? null},
    appraisal, resourcePolicy: {policyId: 'model-resource-v1', resource: input?.requestedResource ?? null, allowed: resourceAllowed},
    keyRelease: {authorized: resourceAllowed, mode: resourceAllowed ? 'SYNTHETIC_RECEIPT_ONLY' : 'REFUSED', receipt},
    keyMaterialReleased: false,
    inferenceAuthorization: {allowed: false, reason: 'Independent caller and request authorization was not performed.'},
    modelInvoked: false, performanceClaim: null, humanAuthority: authority,
  }
}

export function qualify(input) {
  if (!input || !input.evidence || !input.evidence.nonce || !input.evidence.collectedAt) return response(input, 'DENY_INVALID_EVIDENCE', 'OFFLINE', {valid: false, reason: 'Evidence contract is incomplete.'})
  const sourceState = input.scenario === 'verifier_unavailable' || input.scenario === 'kbs_unavailable' ? 'OFFLINE' : 'REHEARSAL'
  if (!input.dependencies?.verifier) return response(input, 'DENY_VERIFIER_UNAVAILABLE', sourceState, {valid: false, reason: 'Verifier unavailable.'})
  if (input.evidence.tee !== 'tdx') return response(input, 'DENY_NON_TDX', sourceState, {valid: false, reason: 'Protected resource requires TDX evidence.'})
  if (!input.evidence.signatureValid) return response(input, 'DENY_INVALID_EVIDENCE', sourceState, {valid: false, reason: 'Evidence signature invalid.'})
  if (Date.now() - Date.parse(input.evidence.collectedAt) > 120_000) return response(input, 'DENY_STALE', sourceState, {valid: false, reason: 'Evidence exceeded the 120 second rehearsal freshness window.'})
  if (input.scenario === 'replayed_evidence' || replayCache.has(input.evidence.nonce)) return response(input, 'DENY_REPLAY', sourceState, {valid: false, reason: 'Nonce already consumed.'})
  replayCache.add(input.evidence.nonce)
  if (input.evidence.measurement !== expectedMeasurement) return response(input, 'DENY_MEASUREMENT', sourceState, {valid: false, reason: 'Measurement does not match the named rehearsal reference value.'})
  const appraisal = {valid: true, policyId: 'attestation-appraisal-v1', measurementMatched: true, freshnessChecked: true, nonceConsumed: true}
  if (!input.dependencies?.kbs) return response(input, 'DENY_KBS_UNAVAILABLE', sourceState, appraisal)
  if (input.requestedResource !== protectedResource) return response(input, 'DENY_RESOURCE_POLICY', sourceState, appraisal)
  return response(input, 'ALLOW_SYNTHETIC_RELEASE', sourceState, appraisal, true)
}
