import http from 'http';
import {
  getHealthV6,
  getDecisionSnapshotV6,
  getDecisionSummaryV6,
  getRuntimeStatsV6,
} from './runtime/api_adapter_v6.js';

const PORT = Number(process.env.PORT ?? 3000);

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const method = req.method ?? 'GET';
  const url = req.url ?? '/';

  try {
    if (method === 'GET' && url === '/health') {
      return sendJson(res, 200, getHealthV6());
    }

    if (method === 'GET' && url === '/snapshot') {
      const data = await getDecisionSnapshotV6();
      return sendJson(res, 200, data);
    }

    if (method === 'GET' && url === '/summary') {
      const data = await getDecisionSummaryV6();
      return sendJson(res, 200, data);
    }

    if (method === 'GET' && url === '/stats') {
      return sendJson(res, 200, getRuntimeStatsV6());
    }

    if (method === 'GET' && url === '/') {
      return sendJson(res, 200, {
        ok: true,
        service: 'axium-zero',
        engine: 'v6',
        canonical: true,
        endpoints: ['/health', '/snapshot', '/summary', '/stats'],
        ts: Date.now(),
      });
    }

    return sendJson(res, 404, {
      ok: false,
      error: 'not_found',
      path: url,
      ts: Date.now(),
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: 'internal_error',
      message: error.message,
      ts: Date.now(),
    });
  }
});

server.listen(PORT, () => {
  console.log(`[AXIUM:SERVER:V6] listening on :${PORT}`);
});
