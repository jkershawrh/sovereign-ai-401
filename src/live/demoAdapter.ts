import { createJsonAdapter, registerAdapter } from './adapters'

registerAdapter(createJsonAdapter({
  id: 'demo-proof',
  url: '/api/demo-proof',
  timeoutMs: 2_500,
  rehearsal: {
    data: {
      decision: 'ALLOW_SYNTHETIC_RELEASE',
      sourceState: 'REHEARSAL',
      outcome: 'Expected measurement; synthetic receipt only',
    },
    collectedAt: '2026-09-28T22:30:00.000Z',
  },
}))

registerAdapter(createJsonAdapter({
  id: 'demo-proof-changed',
  url: '/api/demo-proof?condition=changed',
  timeoutMs: 2_500,
  rehearsal: {
    data: {
      decision: 'DENY_REPLAY',
      sourceState: 'REHEARSAL',
      outcome: 'Consumed nonce refuses key release',
    },
    collectedAt: '2026-09-28T22:31:00.000Z',
  },
}))
