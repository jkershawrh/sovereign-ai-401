import test from 'node:test'
import assert from 'node:assert/strict'
import {operate, resetState, revokeMeasurement, scenarios} from '../workload/trust-chain.mjs'

const expected = {
  authorized: ['ALLOW_REVIEW', 'REHEARSAL', 'REHEARSAL_POLICY_MATCH'],
  identity_mismatch: ['REFUSE', 'REHEARSAL', 'WORKLOAD_IDENTITY_MISMATCH'],
  invalid_measurement: ['REFUSE', 'REHEARSAL', 'MEASUREMENT_MISMATCH'],
  stale_evidence: ['REFUSE', 'REHEARSAL', 'STALE_QUOTE'],
  replayed_evidence: ['REFUSE', 'REHEARSAL', 'REPLAYED_CHALLENGE'],
  tcb_out_of_date: ['REFUSE', 'REHEARSAL', 'TCB_NOT_APPROVED'],
  revoked_measurement: ['REFUSE', 'REHEARSAL', 'MEASUREMENT_REVOKED'],
  verifier_unavailable: ['ABSTAIN', 'OFFLINE', 'VERIFIER_UNAVAILABLE'],
  kbs_unavailable: ['ABSTAIN', 'OFFLINE', 'KBS_UNAVAILABLE'],
  non_tdx: ['REFUSE', 'REHEARSAL', 'NON_TDX_EVIDENCE'],
  simulated_live_claim: ['REFUSE', 'REHEARSAL', 'FALSE_LIVE_CLAIM'],
}

test.beforeEach(() => resetState())

for (const [scenario, [decision, sourceState, reason]] of Object.entries(expected)) {
  test(`${scenario} returns its typed fail-closed outcome`, () => {
    const result = operate(scenarios[scenario])
    assert.equal(result.decision, decision)
    assert.equal(result.sourceState, sourceState)
    assert.deepEqual(result.reasonCodes, [reason])
    assert.equal(result.observation.confidentialGuestRunning, false)
    assert.equal(result.observation.liveTdxQuoteVerified, false)
    assert.equal(result.protectedResource.keyMaterialReleased, false)
    assert.equal(result.inference.modelInvoked, false)
    assert.equal(result.inference.performanceClaim, null)
  })
}

test('successful rehearsal records all eight operating stages', () => {
  const result = operate(scenarios.authorized)
  assert.deepEqual(
    result.operationTrace,
    ['CAPABILITY', 'CHALLENGE', 'ATTEST', 'APPRAISE', 'AUTHORIZE', 'INFER', 'REVOKE', 'VERIFY']
      .map(stage => ({stage, status: 'COMPLETE'})),
  )
  assert.equal(result.evidenceChain.verified, true)
})

test('host capability never becomes observed confidential execution', () => {
  const result = operate(scenarios.authorized)
  assert.equal(result.capability.tdxCapable, true)
  assert.equal(result.observation.confidentialGuestRunning, false)
  assert.equal(result.observation.liveTdxQuoteVerified, false)
})

test('nonce is fresh and single use', () => {
  const first = operate(scenarios.authorized)
  assert.equal(first.decision, 'ALLOW_REVIEW')
  const replay = operate(scenarios.authorized)
  assert.equal(replay.decision, 'REFUSE')
  assert.deepEqual(replay.reasonCodes, ['REPLAYED_CHALLENGE'])
})

test('authorization receipt is not a key or inference permission', () => {
  const result = operate(scenarios.authorized)
  assert.equal(result.resourcePolicy.allowed, true)
  assert.equal(result.protectedResource.authorized, true)
  assert.match(result.protectedResource.receipt, /^sha256:[a-f0-9]{64}$/)
  assert.equal(result.protectedResource.keyMaterialReleased, false)
  assert.equal(result.inference.authorized, false)
  assert.equal(result.inference.modelInvoked, false)
})

test('revocation takes effect on the next request', () => {
  revokeMeasurement()
  const result = operate(scenarios.authorized)
  assert.equal(result.decision, 'REFUSE')
  assert.deepEqual(result.reasonCodes, ['MEASUREMENT_REVOKED'])
})

test('human and model authority remain bounded', () => {
  const result = operate(scenarios.authorized)
  assert.deepEqual(result.authority, {
    humanReviewRequired: true,
    mayDeploy: false,
    mayChangeReferenceValues: false,
    mayReleaseProductionSecrets: false,
    certified: false,
    promotionEligible: false,
    llmAuthority: 'NONE',
  })
})

test('malformed evidence fails closed', () => {
  const result = operate({scenario: 'unknown', evidence: {}})
  assert.equal(result.decision, 'REFUSE')
  assert.equal(result.sourceState, 'OFFLINE')
  assert.deepEqual(result.reasonCodes, ['INVALID_EVIDENCE'])
})
