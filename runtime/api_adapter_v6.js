import { runEngineV6 } from './engine_v6.js';
import { getCacheStats } from './cache.js';

export function getHealthV6() {
  return {
    ok: true,
    service: 'axium-zero',
    engine: 'v6',
    canonical: true,
    mode: 'production',
    ts: Date.now(),
  };
}

export async function getDecisionSnapshotV6() {
  const result = await runEngineV6();
  return {
    ok: true,
    engine: 'v6',
    canonical: true,
    mode: 'production',
    ts: Date.now(),
    result,
  };
}

export async function getDecisionSummaryV6() {
  const result = await runEngineV6();
  return {
    ok: true,
    engine: 'v6',
    canonical: true,
    mode: 'production',
    ts: Date.now(),
    summary: result.summary,
    meta: result.meta,
  };
}

export function getRuntimeStatsV6() {
  return {
    ok: true,
    engine: 'v6',
    canonical: true,
    mode: 'production',
    ts: Date.now(),
    cache: getCacheStats(),
  };
}
