import http from 'http';
import { getHealth, getDecisionSnapshot } from './runtime/api_adapter.js';

const PORT = Number(process.env.PORT ?? 3000);

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const method = req.method ?? 'GET';
  const url = req.url ?? '/';

  if (method === 'GET' && url === '/health') {
    return sendJson(res, 200, getHealth());
  }

  if (method === 'GET' && url === '/snapshot') {
    return sendJson(res, 200, getDecisionSnapshot());
  }

  if (method === 'GET' && url === '/') {
    return sendJson(res, 200, {
      ok: true,
      service: 'axium-zero',
      engine: 'v2',
      endpoints: ['/health', '/snapshot'],
      ts: Date.now(),
    });
  }

  return sendJson(res, 404, {
    ok: false,
    error: 'not_found',
    path: url,
    ts: Date.now(),
  });
});

server.listen(PORT, () => {
  console.log(`[AXIUM:SERVER] listening on :${PORT}`);
});
