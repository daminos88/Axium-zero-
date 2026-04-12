import { runEngineV5 } from './engine_v5.js';
import { getCacheStats } from './cache.js';

export function getHealthV2() {
  return {
    ok: true,
    service: 'axium-zero',
    engine: 'v5',
    mode: 'production',
    ts: Date.now(),
  };
}

export async function getDecisionSnapshotV2() {
  const result = await runEngineV5();
  return {
    ok: true,
    engine: 'v5',
    mode: 'production',
    ts: Date.now(),
    result,
  };
}

export async function getDecisionSummaryV2() {
  const result = await runEngineV5();
  return {
    ok: true,
    engine: 'v5',
    mode: 'production',
    ts: Date.now(),
    summary: result.summary,
    meta: result.meta,
  };
}

export function getRuntimeStatsV2() {
  return {
    ok: true,
    engine: 'v5',
    mode: 'production',
    ts: Date.now(),
    cache: getCacheStats(),
  };
}
