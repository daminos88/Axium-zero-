import { runEngineV2 } from './engine_v2.js';

export function getHealth() {
  return {
    ok: true,
    service: 'axium-zero',
    engine: 'v2',
    ts: Date.now(),
  };
}

export function getDecisionSnapshot() {
  const result = runEngineV2();
  return {
    ok: true,
    engine: 'v2',
    ts: Date.now(),
    result,
  };
}

if (process.argv[1] && process.argv[1].endsWith('api_adapter.js')) {
  console.log(JSON.stringify({
    health: getHealth(),
    snapshot: getDecisionSnapshot(),
  }, null, 2));
}
