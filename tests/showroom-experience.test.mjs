import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile, readdir} from 'node:fs/promises'

const pagesRoot = 'showroom/content/modules/ROOT/pages'
const stages = [
  '01-capability.adoc', '02-challenge.adoc', '03-attest.adoc', '04-appraise.adoc',
  '05-authorize.adoc', '06-infer.adoc', '07-revoke.adoc', '08-verify.adoc',
]

test('the 401 journey continues Northstar Claims from 301 and hands off to fleet qualification', async () => {
  const index = await readFile(`${pagesRoot}/index.adoc`, 'utf8')
  assert.match(index, /Northstar Claims/i)
  assert.match(index, /Sovereign AI 301/i)
  assert.match(index, /claims-assistant/i)
  assert.match(index, /Sovereign AI 501/i)
  assert.match(index, /customer outcome/i)
})

test('every 401 stage follows Show Learn Do Prove and executes a participant action', async () => {
  let executeBlocks = 0
  for (const page of stages) {
    const text = await readFile(`${pagesRoot}/${page}`, 'utf8')
    for (const phase of ['Show', 'Learn', 'Do', 'Prove']) assert.match(text, new RegExp(`== ${phase}`), `${page} lacks ${phase}`)
    assert.match(text, /role="execute"/, `${page} lacks an executable action`)
    executeBlocks += (text.match(/role="execute"/g) ?? []).length
  }
  assert.ok(executeBlocks >= 16, `expected at least 16 execute blocks, found ${executeBlocks}`)
})

test('operator, inference, evidence, and cleanup boundaries are explicit', async () => {
  const texts = await Promise.all((await readdir(pagesRoot)).filter((name) => name.endsWith('.adoc')).map((name) => readFile(`${pagesRoot}/${name}`, 'utf8')))
  const all = texts.join('\n')
  assert.match(all, /OpenShift Console/)
  assert.match(all, /Workloads/)
  assert.match(all, /modelInvoked/)
  assert.match(all, /zero model executions/i)
  assert.match(all, /participant-owned/)
  assert.match(all, /Launchpad-owned/)
  assert.match(all, /REFUSE|ABSTAIN/)
})

test('network policy admits only presentation and Showroom clients and preserves the presentation route', async () => {
  const policy = await readFile('charts/sovereign-ai-401/templates/networkpolicy.yaml', 'utf8')
  assert.match(policy, /app\.kubernetes\.io\/name: \{\{ \.Release\.Name \}\}-presentation/)
  assert.match(policy, /app\.kubernetes\.io\/name: showroom/)
  assert.match(policy, /name: openshift-dns/)
  assert.match(policy, /network\.openshift\.io\/policy-group: ingress/)
  assert.match(policy, /app\.kubernetes\.io\/name: \{\{ \.Release\.Name \}\}-qualifier/)
  assert.doesNotMatch(policy, /namespaceSelector:\s*\{\}/)
})
