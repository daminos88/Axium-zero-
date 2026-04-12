import { runEngineV6 } from './engine_v6.js';
import { getCacheStats } from './cache.js';

export function getHealthV7() {
  return {
    ok: true,
    service: 'axium-zero',
    engine: 'v6',
    api: 'v7',
    canonical: true,
    mode: 'production-secured',
    ts: Date.now(),
  };
}

export async function getDecisionSnapshotV7() {
  try {
    const result = await runEngineV6();
    return {
      ok: true,
      engine: 'v6',
      api: 'v7',
      canonical: true,
      mode: 'production-secured',
      ts: Date.now(),
      result,
    };
  } catch (error) {
    return {
      ok: false,
      engine: 'v6',
      api: 'v7',
      canonical: true,
      error: 'engine_failure',
      message: error.message,
      ts: Date.now(),
    };
  }
}

export async function getDecisionSummaryV7() {
  try {
    const result = await runEngineV6();
    return {
      ok: true,
      engine: 'v6',
      api: 'v7',
      canonical: true,
      mode: 'production-secured',
      ts: Date.now(),
      summary: result.summary,
      meta: result.meta,
    };
  } catch (error) {
    return {
      ok: false,
      engine: 'v6',
      api: 'v7',
      canonical: true,
      error: 'engine_failure',
      message: error.message,
      ts: Date.now(),
    };
  }
}

export function getRuntimeStatsV7() {
  return {
    ok: true,
    engine: 'v6',
    api: 'v7',
    canonical: true,
    mode: 'production-secured',
    ts: Date.now(),
    cache: getCacheStats(),
  };
}
