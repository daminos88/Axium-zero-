import http from 'http';
import {
  getHealthV7,
  getDecisionSnapshotV7,
  getDecisionSummaryV7,
  getRuntimeStatsV7,
} from './runtime/api_adapter_v7.js';

const PORT = Number(process.env.PORT ?? 3000);
const API_KEY = process.env.API_KEY;

const RATE_LIMIT = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQ = 30;

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

  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const entry = RATE_LIMIT.get(ip) || { count: 0, ts: now };
  if (now - entry.ts > WINDOW_MS) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  RATE_LIMIT.set(ip, entry);

  if (entry.count > MAX_REQ) {
    return sendJson(res, 429, { ok: false, error: 'rate_limited', ts: now });
  }

  const clientKey = req.headers['x-api-key'];
  if (!clientKey || clientKey !== API_KEY) {
    return sendJson(res, 403, {
      ok: false,
      error: 'forbidden',
      message: 'invalid api key',
      ts: now,
    });
  }

  try {
    if (method === 'GET' && url === '/health') {
      return sendJson(res, 200, getHealthV7());
    }

    if (method === 'GET' && url === '/snapshot') {
      const data = await getDecisionSnapshotV7();
      return sendJson(res, 200, data);
    }

    if (method === 'GET' && url === '/summary') {
      const data = await getDecisionSummaryV7();
      return sendJson(res, 200, data);
    }

    if (method === 'GET' && url === '/stats') {
      return sendJson(res, 200, getRuntimeStatsV7());
    }

    if (method === 'GET' && url === '/') {
      return sendJson(res, 200, {
        ok: true,
        service: 'axium-zero',
        engine: 'v6',
        api: 'v7',
        endpoints: ['/health', '/snapshot', '/summary', '/stats'],
        ts: now,
      });
    }

    return sendJson(res, 404, { ok: false, error: 'not_found', ts: now });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: 'internal_error',
      message: error.message,
      ts: now,
    });
  }
});

server.listen(PORT, () => {
  console.log(`[AXIUM:SERVER:V7] listening on :${PORT}`);
});
