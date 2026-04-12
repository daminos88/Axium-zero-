import { runEngineV2 } from '../runtime/engine_v2.js';

console.log('AXIUM ZERO BOOT :: V2');

function boot() {
  console.log('Initializing hardened runtime...');

  const result = runEngineV2();
  const state = {
    status: 'ACTIVE',
    engine: 'v2',
    ts: Date.now(),
    summary: result.summary,
    meta: result.meta,
  };

  console.log('STATE:', JSON.stringify(state, null, 2));
  return state;
}

boot();
