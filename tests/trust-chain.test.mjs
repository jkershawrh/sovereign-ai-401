import test from 'node:test'
import assert from 'node:assert/strict'
import { qualify, resetReplayCache, scenarios } from '../workload/trust-chain.mjs'

const expected = {
  allowed: ['ALLOW_SYNTHETIC_RELEASE', 'REHEARSAL'],
  invalid_measurement: ['DENY_MEASUREMENT', 'REHEARSAL'],
  stale_evidence: ['DENY_STALE', 'REHEARSAL'],
  replayed_evidence: ['DENY_REPLAY', 'REHEARSAL'],
  verifier_unavailable: ['DENY_VERIFIER_UNAVAILABLE', 'OFFLINE'],
  kbs_unavailable: ['DENY_KBS_UNAVAILABLE', 'OFFLINE'],
  non_tdx: ['DENY_NON_TDX', 'REHEARSAL'],
}

test.beforeEach(() => resetReplayCache())

for (const [scenario, [decision, sourceState]] of Object.entries(expected)) {
  test(`${scenario} returns its typed fail-closed outcome`, () => {
    const result = qualify(scenarios[scenario])
    assert.equal(result.decision, decision)
    assert.equal(result.sourceState, sourceState)
    assert.equal(result.liveTdxObserved, false)
    assert.equal(result.keyMaterialReleased, false)
    assert.equal(result.modelInvoked, false)
    assert.equal(result.performanceClaim, null)
    assert.equal(JSON.stringify(result).includes('fixture-value'), false)
  })
}

test('capability and runtimeClass never become observed TDX execution', () => {
  const result = qualify({...scenarios.allowed, capability: {cpu: 'tdx-capable', runtimeClassName: 'kata-cc'}})
  assert.equal(result.capability.tdxCapable, true)
  assert.equal(result.observation.tdxEnabled, false)
  assert.equal(result.liveTdxObserved, false)
})

test('nonce is bound, fresh, and single use', () => {
  const first = qualify(scenarios.allowed)
  assert.equal(first.decision, 'ALLOW_SYNTHETIC_RELEASE')
  const replay = qualify(scenarios.allowed)
  assert.equal(replay.decision, 'DENY_REPLAY')
  assert.equal(replay.resourcePolicy.allowed, false)
})

test('valid appraisal cannot authorize a different resource', () => {
  const result = qualify({...scenarios.allowed, requestedResource: 'models/other/key'})
  assert.equal(result.appraisal.valid, true)
  assert.equal(result.resourcePolicy.allowed, false)
  assert.equal(result.decision, 'DENY_RESOURCE_POLICY')
})

test('key-release authorization is not inference authorization', () => {
  const result = qualify(scenarios.allowed)
  assert.equal(result.resourcePolicy.allowed, true)
  assert.equal(result.keyRelease.authorized, true)
  assert.equal(result.keyMaterialReleased, false)
  assert.equal(result.inferenceAuthorization.allowed, false)
  assert.equal(result.modelInvoked, false)
})

test('human authority remains false for deployment certification and promotion', () => {
  const result = qualify(scenarios.allowed)
  assert.deepEqual(result.humanAuthority, {mayDeploy: false, mayChangeReferenceValues: false, certified: false, promotionEligible: false})
})

test('malformed or unknown evidence fails closed', () => {
  const result = qualify({scenario: 'unknown', evidence: {}})
  assert.equal(result.decision, 'DENY_INVALID_EVIDENCE')
  assert.equal(result.resourcePolicy.allowed, false)
})
