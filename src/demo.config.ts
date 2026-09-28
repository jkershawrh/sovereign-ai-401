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
  id: 'sovereign-ai-301', title: "Sovereign AI 301 — Confidential Inference and Intel TDX Foundations", subtitle: "Capability → measured identity → policy-gated model access", event: 'Platform security briefing', audience: 'Platform security engineers', cta: 'Trace what is proven—and what is not.',
  brand: { primary: { name: 'Red Hat', logo: '/logos/redhat.svg', alt: 'Red Hat' }, partner: { name: 'Intel', logo: '/logos/intel.png', alt: 'Intel' }, attribution: 'Red Hat × Intel' },
  acts: [
    { id: 'story', label: '00', title: 'The Decision', scenes: [
      { id: 'intro', type: 'intro', beat: 'ordinary-world', title: 'Encrypted is not yet attested', subtitle: 'At rest · in transit · in use are three different claims', speakerPrompt: 'State that this session is REHEARSAL: no current TDX quote, secret, model call, or performance measurement.' },
      { id: 'reframe', type: 'reframe', beat: 'stakes', eyebrow: 'The dangerous shortcut', title: 'A TDX-capable host does not identify this workload', before: 'Capability or runtimeClass', after: 'Fresh evidence + appraisal + policy', detail: 'A valid appraisal still grants no resource; a released resource still grants no inference permission.', speakerPrompt: 'Separate capability, observation, evidence, appraisal, resource policy, inference policy, and human authority.' },
    ] },
    { id: 'architecture', label: '01', title: 'Guided Architecture', scenes: [
      { id: 'guided-architecture', type: 'guided-architecture', beat: 'system-reveal', eyebrow: 'Trust chain', title: 'Six boundaries, one fail-closed chain', body: 'Every arrow changes the kind of claim; none may be skipped.', layers: [
        { id: 'input', component: 'Protection state', tone: 'primary', question: 'What does TDX add?', answer: 'Protection for data in use against host software.', detail: 'It does not replace storage or transport encryption and does not solve every residual risk.', activeNodeIds: ['browser', 'route'] },
        { id: 'platform', component: 'Red Hat platform', tone: 'primary', question: 'Where does the workload run and remain governable?', answer: 'The platform owns deployment, policy, isolation, and operations.', detail: 'Include only platform services that alter proof, risk, or the audience decision.', activeNodeIds: ['service', 'runtime'] },
        { id: 'compute', component: 'Intel compute', tone: 'partner', question: 'What makes the workload practical here?', answer: 'The selected compute path supports the workload claim.', detail: 'Use measured evidence for performance, placement, or efficiency claims.', activeNodeIds: ['proof-service'] },
        { id: 'proof', component: 'Verifier + KBS', tone: 'success', question: 'When can a resource be authorized?', answer: 'Only after fresh evidence appraises and resource policy allows.', detail: 'Appraisal and resource permission remain separate.', activeNodeIds: ['evidence', 'policy'] },
        { id: 'decision', component: 'Human authority', tone: 'primary', question: 'Who may deploy certify or promote?', answer: 'Named reviewers—not the quote, policy engine, or model.', detail: 'Missing LIVE evidence keeps every authority flag false.', activeNodeIds: ['human'] },
      ], technicalTopology, speakerPrompt: 'Pause on every question. Invite an answer, then reveal the actual runtime objects and boundary before advancing.' },
    ] },
    { id: 'proof', label: '02', title: 'Live Walkthrough', scenes: [
      { id: 'live', type: 'live-journey', beat: 'live-proof', eyebrow: 'REHEARSAL · synthetic evidence', title: 'Allow once, then refuse the replay', body: 'The allowed path emits only a synthetic receipt. Reusing its nonce refuses release.', cta: 'Run the rehearsal', workspace: { label: 'Open the Showroom lab', href: '/lab/' }, nodes: [
        { id: 'input', label: 'Experience input', detail: 'bounded request', tone: 'primary' },
        { id: 'platform', label: 'Red Hat platform', detail: 'policy and operations', tone: 'primary' },
        { id: 'compute', label: 'Intel compute', detail: 'measured execution', tone: 'partner' },
        { id: 'adapter', label: 'Proof adapter', detail: 'typed evidence', tone: 'success' },
        { id: 'decision', label: 'Human decision', detail: 'authority stays visible', tone: 'primary' },
      ], technicalTopology, steps: [
        { id: 'baseline', title: 'Expected measurement', detail: 'Fresh single-use evidence appraises and resource policy authorizes a synthetic receipt.', adapterId: 'demo-proof', activeNode: 3, activeNodeIds: ['browser', 'route', 'service', 'runtime', 'proof-service', 'evidence'], resultFields: [{ key: 'decision', label: 'Decision' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Boundary' }] },
        { id: 'changed', title: 'Replay the nonce', detail: 'The same evidence is no longer fresh for this decision and release is refused.', adapterId: 'demo-proof-changed', activeNode: 4, activeNodeIds: ['browser', 'runtime', 'evidence', 'human'], resultFields: [{ key: 'decision', label: 'Decision' }, { key: 'sourceState', label: 'Source' }, { key: 'outcome', label: 'Boundary' }] },
      ], speakerPrompt: 'Narrate the deployment objects, protocols, trust boundary, and active path while it runs. Say LIVE, REHEARSAL, or OFFLINE before interpreting each result.' },
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
      { id: 'payoff', type: 'evidence-payoff', beat: 'transformation', eyebrow: 'Bounded conclusion', title: 'Rehearsal semantics pass; LIVE TDX remains blocked', adapterIds: ['demo-proof', 'demo-proof-changed'], fallbackLine: 'Run the rehearsal to populate this receipt', evidenceFields: [{ key: 'decision', label: 'Latest decision' }, { key: 'sourceState', label: 'Evidence source' }, { key: 'outcome', label: 'Observed boundary' }], line1: 'Capability did not become workload identity.', line2: 'Appraisal did not become permission or human authority.', cta: 'Continue into the separate Showroom lab →', speakerPrompt: 'Close with blockers: current quote, TDX placement, live Trustee/KBS, and independent certification.' },
    ] },
  ],
  journeyHandoffs: [
    { depth: 'guided', title: 'Sovereign AI 301 Showroom', duration: '30–40 minutes', question: 'Can the learner locate every evidence and policy boundary?', technology: 'Synthetic fixtures · Failure matrix · Human handoff', instruction: 'Run all seven conditions, then record the LIVE blockers.', href: '/lab/' },
  ],
}
