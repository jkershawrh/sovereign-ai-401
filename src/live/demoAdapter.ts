import { createJsonAdapter, registerAdapter } from './adapters'

const collectedAt = '2026-09-28T22:30:00.000Z'
const steps = [
  ['tdx-capability', 'CAPABILITY', 'REHEARSAL', 'TDX-capable host and kata-cc configuration observed; workload trust not yet proven'],
  ['tdx-challenge', 'CHALLENGE', 'REHEARSAL', 'Fresh single-use challenge bound to the declared workload identity'],
  ['tdx-attest', 'ATTEST', 'REHEARSAL', 'Synthetic quote fixture collected; no live confidential guest or hardware quote claimed'],
  ['tdx-appraise', 'APPRAISE', 'REHEARSAL', 'Reference measurement, freshness, TCB state, and signature policy evaluated'],
  ['tdx-authorize', 'AUTHORIZE', 'REHEARSAL', 'Deterministic resource policy emits a synthetic authorization receipt'],
  ['tdx-infer', 'INFER', 'REHEARSAL', 'Inference remains disabled because rehearsal authorization is not production permission'],
  ['tdx-revoke', 'REVOKE', 'REHEARSAL', 'Measurement revoked; the next matching request is refused'],
  ['tdx-verify', 'VERIFY', 'REHEARSAL', 'Challenge, appraisal, policy, authorization, and revocation receipts verify as one chain'],
] as const

for (const [id, decision, sourceState, outcome] of steps) {
  registerAdapter(createJsonAdapter({
    id,
    url: `/api/v1/proof/${id}`,
    timeoutMs: 2_500,
    rehearsal: {data: {decision, sourceState, outcome}, collectedAt},
  }))
}
