import type { DemoConfig } from './types'

const technicalTopology = {
  boundary: { label: 'TD workload ↔ relying party', detail: 'evidence never equals permission' },
  entry: { id: 'browser', kind: 'operator', label: 'Verifier challenge', detail: 'fresh single-use nonce' },
  primaryPath: [
    { id: 'route', kind: 'route', label: 'TDX-capable host', detail: 'capability is not observation', endpoint: 'Intel Xeon', edgeLabel: 'can host' },
    { id: 'service', kind: 'service', label: 'Confidential workload', detail: 'measured identity in a trust domain', endpoint: 'TD quote', edgeLabel: 'attests' },
    { id: 'runtime', kind: 'deployment', label: 'Trustee verifier', detail: 'freshness + reference-value appraisal', endpoint: 'RCAR', edgeLabel: 'appraises' },
    { id: 'proof-service', kind: 'service', label: 'KBS resource policy', detail: 'one identity → one resource', endpoint: 'JWE', edgeLabel: 'authorizes' },
  ],
  supportPath: [
    { id: 'evidence', kind: 'data', label: 'Attestation evidence', detail: 'nonce + measurements + provenance', edgeLabel: 'verify' },
    { id: 'policy', kind: 'policy', label: 'Inference authorization', detail: 'independent after key release', edgeLabel: 'separate gate' },
    { id: 'human', kind: 'authority', label: 'Human authority', detail: 'deploy · certify · promote', edgeLabel: 'retained' },
  ],
  optionalPath: { id: 'optional', kind: 'external', label: 'Optional integration', detail: 'never implied to be authoritative', edgeLabel: 'bounded egress' },
}

export const demoConfig: DemoConfig = {
  id: 'sovereign-ai-401', title: "Sovereign AI 401 — Operate Confidential AI with Intel TDX", subtitle: "Challenge → attest → appraise → authorize → revoke", event: 'Northstar Claims confidential AI operations review', audience: 'Security, platform, and AI operations teams', cta: 'Operate the claims-assistant trust lifecycle without turning capability into a claim.',
  brand: { primary: { name: 'Red Hat', logo: '/logos/redhat.svg', alt: 'Red Hat' }, partner: { name: 'Intel', logo: '/logos/intel.png', alt: 'Intel' }, attribution: 'Red Hat × Intel' },
  acts: [
    { id: 'story', label: '00', title: 'The Decision', scenes: [
      { id: 'intro', type: 'intro', beat: 'ordinary-world', title: 'Capability is not trust', subtitle: 'Northstar Claims must protect its governed claims-assistant while data is in use', speakerPrompt: 'State that this session is REHEARSAL: no current confidential guest, TDX quote, secret, model call, or performance measurement.' },
      { id: 'reframe', type: 'reframe', beat: 'stakes', eyebrow: 'The Sovereign AI 401 shift', title: 'A TDX-capable host does not identify this workload', before: 'Sovereign AI 301 · governed candidate', after: 'Fresh evidence + appraisal + policy', detail: 'A valid appraisal still grants no resource; a released resource still grants no inference permission.', speakerPrompt: 'Separate capability, observation, evidence, appraisal, resource policy, inference policy, and human authority.' },
    ] },
    { id: 'architecture', label: '01', title: 'Guided Architecture', scenes: [
      { id: 'guided-architecture', type: 'guided-architecture', beat: 'system-reveal', eyebrow: 'Trust lifecycle', title: 'Eight states, one fail-closed chain', body: 'Every transition changes the kind of claim; none may be skipped.', layers: [
        { id: 'input', component: 'Protection state', tone: 'primary', question: 'What does TDX add?', answer: 'Protection for data in use against host software.', detail: 'It does not replace storage or transport encryption and does not solve every residual risk.', activeNodeIds: ['browser', 'route'] },
        { id: 'platform', component: 'Red Hat platform', tone: 'primary', question: 'Where does the workload run and remain governable?', answer: 'The platform owns deployment, policy, isolation, and operations.', detail: 'Include only platform services that alter proof, risk, or the audience decision.', activeNodeIds: ['service', 'runtime'] },
        { id: 'compute', component: 'Intel compute', tone: 'partner', question: 'What makes the workload practical here?', answer: 'The selected compute path supports the workload claim.', detail: 'Use measured evidence for performance, placement, or efficiency claims.', activeNodeIds: ['proof-service'] },
        { id: 'proof', component: 'Verifier + KBS', tone: 'success', question: 'When can a resource be authorized?', answer: 'Only after fresh evidence appraises and resource policy allows.', detail: 'Appraisal and resource permission remain separate.', activeNodeIds: ['evidence', 'policy'] },
        { id: 'decision', component: 'Human authority', tone: 'primary', question: 'Who may deploy certify or promote?', answer: 'Named reviewers—not the quote, policy engine, or model.', detail: 'Missing LIVE evidence keeps every authority flag false.', activeNodeIds: ['human'] },
      ], technicalTopology, speakerPrompt: 'Pause on every question. Invite an answer, then reveal the actual runtime objects and boundary before advancing.' },
    ] },
    { id: 'proof', label: '02', title: 'Live Walkthrough', scenes: [
      { id: 'live', type: 'live-journey', beat: 'live-proof', eyebrow: 'REHEARSAL · synthetic evidence', title: 'Operate the complete trust lifecycle', body: 'Follow one workload from capability through revocation and chain verification. Every step remains visibly REHEARSAL until a real confidential guest and TDX quote exist.', cta: 'Run the trust lifecycle', workspace: { label: 'Open the Showroom lab', href: '/lab/' }, nodes: [
        { id: 'capability', label: 'Capability', detail: 'host and runtime', tone: 'partner' },
        { id: 'challenge', label: 'Challenge', detail: 'fresh workload-bound nonce', tone: 'primary' },
        { id: 'attest', label: 'Attest', detail: 'quote evidence', tone: 'partner' },
        { id: 'appraise', label: 'Appraise', detail: 'measurements and TCB', tone: 'primary' },
        { id: 'authorize', label: 'Authorize', detail: 'deterministic resource policy', tone: 'success' },
        { id: 'infer', label: 'Infer', detail: 'independent request gate', tone: 'primary' },
        { id: 'revoke', label: 'Revoke', detail: 'deny the next request', tone: 'partner' },
        { id: 'verify', label: 'Verify', detail: 'evidence chain', tone: 'success' },
      ], technicalTopology, steps: [
        { id: 'capability', title: 'Observe capability', detail: 'Confirm Intel TDX capability and kata-cc configuration without calling the workload trusted.', adapterId: 'tdx-capability', activeNode: 0, activeNodeIds: ['route'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Evidence' }] },
        { id: 'challenge', title: 'Issue a fresh challenge', detail: 'Bind a single-use nonce to namespace, service account, and immutable workload image.', adapterId: 'tdx-challenge', activeNode: 1, activeNodeIds: ['browser', 'service'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Evidence' }] },
        { id: 'attest', title: 'Collect attestation evidence', detail: 'Collect quote evidence from the confidential workload boundary; this factory uses a labeled synthetic fixture.', adapterId: 'tdx-attest', activeNode: 2, activeNodeIds: ['service', 'evidence'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Evidence' }] },
        { id: 'appraise', title: 'Appraise independently', detail: 'Verify challenge binding, signature, freshness, reference measurements, and TCB status.', adapterId: 'tdx-appraise', activeNode: 3, activeNodeIds: ['runtime', 'evidence'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Decision' }] },
        { id: 'authorize', title: 'Apply resource policy', detail: 'Authorize only the named workload and resource; a rehearsal receipt contains no key material.', adapterId: 'tdx-authorize', activeNode: 4, activeNodeIds: ['proof-service', 'policy'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Decision' }] },
        { id: 'infer', title: 'Keep inference independent', detail: 'Resource appraisal does not grant caller or model permission. Production inference stays disabled.', adapterId: 'tdx-infer', activeNode: 5, activeNodeIds: ['policy', 'human'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Authority' }] },
        { id: 'revoke', title: 'Revoke trust', detail: 'Revoke the reference measurement and prove the next matching request is refused.', adapterId: 'tdx-revoke', activeNode: 6, activeNodeIds: ['runtime', 'proof-service', 'human'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Effect' }] },
        { id: 'verify', title: 'Verify the chain', detail: 'Link challenge, appraisal, policy, authorization, refusal, and revocation receipts.', adapterId: 'tdx-verify', activeNode: 7, activeNodeIds: ['evidence', 'human'], resultFields: [{ key: 'decision', label: 'State' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Proof' }] },
      ], speakerPrompt: 'Narrate each state and its authority boundary. Say REHEARSAL before interpreting every result; do not imply a live confidential guest.' },
      { id: 'tradeoff', type: 'comparison', beat: 'trials', title: 'Fail closed across every unsafe state', columns: [{ label: 'Allowed', value: 'Synthetic receipt', detail: 'Expected measurement + fresh nonce + available verifier and KBS.', tone: 'success' }, { label: 'Refused', value: 'No key · no model', detail: 'Invalid measurement, stale, replay, unavailable verifier/KBS, or non-TDX.', tone: 'partner' }], speakerPrompt: 'Name all seven conditions. Never call the allowed fixture LIVE TDX.' },
    ] },
    { id: 'mechanisms', label: '03', title: 'Why It Works', scenes: [
      { id: 'mechanisms', type: 'mechanisms', beat: 'trials', eyebrow: 'Why it worked', title: 'Expose the few mechanisms that make the result repeatable', body: 'Each card explains why the proof behaved as it did before the audience enters the lab.', mechanisms: [
        { id: 'placement', label: 'Measured placement', claim: 'Route work by evidence, not assumption.', detail: 'The same request contract can select a different execution path when the condition changes.', tone: 'partner' },
        { id: 'policy', label: 'Visible policy', claim: 'Keep the decision boundary inspectable.', detail: 'Operators can see the rule, evidence, and limitation that shaped the result.', tone: 'primary' },
        { id: 'fallback', label: 'Honest resilience', claim: 'Degrade without disguising the source.', detail: 'Rehearsal and offline evidence remain useful while visibly distinct from a live response.', tone: 'success' },
      ], speakerPrompt: 'Explain only the mechanisms needed to make the observed result understandable and repeatable.' },
    ] },
    { id: 'payoff', label: '04', title: 'Evidence & Handoff', scenes: [
      { id: 'payoff', type: 'evidence-payoff', beat: 'transformation', eyebrow: 'Bounded conclusion', title: 'The trust lifecycle is operable; LIVE TDX remains blocked', adapterIds: ['tdx-authorize', 'tdx-revoke', 'tdx-verify'], fallbackLine: 'Run the rehearsal to populate this receipt', evidenceFields: [{ key: 'decision', label: 'Latest state' }, { key: 'sourceState', label: 'Evidence source' }, { key: 'outcome', label: 'Observed boundary' }], line1: 'Capability did not become workload identity.', line2: 'Appraisal did not become permission or human authority.', cta: 'Continue into the separate Showroom lab →', speakerPrompt: 'Close with blockers: a running confidential guest, current TDX quote, live verifier/KBS, protected resource proof, and independent certification.' },
    ] },
  ],
  journeyHandoffs: [
    { depth: 'guided', title: 'Sovereign AI 401 Showroom', duration: '30–40 minutes', question: 'Can the learner locate every evidence and policy boundary?', technology: 'Synthetic fixtures · Failure matrix · Human handoff', instruction: 'Run all seven conditions, then record the LIVE blockers.', href: '/lab/' },
  ],
}
