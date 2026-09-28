import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile, access} from 'node:fs/promises'

const mustExist = [
  'contracts/attestation-evidence.schema.json',
  'contracts/trust-chain.v1.json',
  'contracts/appraisal-policy.v1.json',
  'contracts/resource-policy.v1.json',
  'contracts/failure-matrix.v1.json',
  'showroom/default-site.yml',
  'charts/sovereign-ai-401/Chart.yaml',
  'charts/sovereign-ai-401/values.schema.json',
  '.github/workflows/release.yml',
  'handoff/launchpad-handoff.yaml',
]

test('contract implementation and delivery artifacts exist', async () => {
  for (const path of mustExist) await access(path)
})

test('chart defaults to rehearsal and cannot imply LIVE TDX', async () => {
  const values = await readFile('charts/sovereign-ai-401/values.yaml', 'utf8')
  assert.match(values, /sourceState:\s*REHEARSAL/)
  assert.match(values, /confidentialRuntime:\s*\n\s+enabled:\s+false/)
})

test('no environment secret fallback or fabricated performance copy is shipped', async () => {
  const files = ['README.md', 'src/demo.config.ts', 'showroom/content/modules/ROOT/pages/index.adoc']
  for (const path of files) {
    const text = await readFile(path, 'utf8')
    assert.doesNotMatch(text, /zero performance impact|same speed|fallback.*env.*secret/i)
  }
})

test('presentation exposes explicit health and readiness endpoints', async () => {
  const config = await readFile('nginx.conf', 'utf8')
  const containerfile = await readFile('Containerfile', 'utf8')
  assert.match(config, /location = \/healthz/)
  assert.match(config, /location = \/readyz/)
  assert.match(containerfile, /\/etc\/nginx\/conf\.d\/nginx\.default\.conf/)
})
