import http from 'node:http'
import {operate, revokeMeasurement, scenarios, resetState} from './trust-chain.mjs'

const port = Number(process.env.PORT || 8080)
const send = (res, code, body) => { res.writeHead(code, {'content-type': 'application/json', 'cache-control': 'no-store'}); res.end(JSON.stringify(body)) }
http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/healthz') return send(res, 200, {status: 'ok', sourceState: 'REHEARSAL'})
  if (req.method === 'GET' && req.url === '/api/v1/scenarios') return send(res, 200, {scenarios: Object.keys(scenarios), liveTdxObserved: false})
  if (req.method === 'POST' && req.url === '/api/v1/reset') { resetState(); return send(res, 200, {reset: true}) }
  if (req.method === 'POST' && req.url === '/api/v1/revoke') { return send(res, 200, revokeMeasurement()) }
  if (req.method === 'POST' && req.url === '/api/v1/operate') {
    let body = ''; req.on('data', chunk => { if (body.length < 100_000) body += chunk })
    req.on('end', () => { try { const parsed = JSON.parse(body || '{}'); send(res, 200, operate(parsed.scenario ? scenarios[parsed.scenario] ?? parsed : parsed)) } catch { send(res, 400, {decision: 'REFUSE', sourceState: 'OFFLINE', reasonCodes: ['INVALID_EVIDENCE']}) } })
    return
  }
  send(res, 404, {error: 'not found'})
}).listen(port, '0.0.0.0')
