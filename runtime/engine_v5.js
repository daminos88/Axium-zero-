import { loadFeedSnapshotV2, normalizeFeedV2 } from './feeds_v2.js';
import { scanEthereumWindowV2, deriveSignalsFromEthScanV2 } from './eth_scan_v2.js';
import { runRuntimeBatch } from './oura_runtime_v2.js';
import { getOrSetCacheEntry } from './cache.js';

const FEED_TTL = 8000;
const ETH_TTL = 3000;
const ENGINE_TTL = 2000;

export async function runEngineV5() {
  return getOrSetCacheEntry('engine_v5', async () => {
    const [feedSnapshot, ethWindow] = await Promise.all([
      getOrSetCacheEntry('feeds_v2', () => loadFeedSnapshotV2(), FEED_TTL),
      getOrSetCacheEntry('eth_scan_v2', () => scanEthereumWindowV2(), ETH_TTL),
    ]);

    const feedSignals = normalizeFeedV2(feedSnapshot);
    const ethSignals = deriveSignalsFromEthScanV2(ethWindow);

    const signals = [...feedSignals, ...ethSignals];
    const rows = runRuntimeBatch(signals);

    const summary = rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.decision === 'ACCEPT') acc.accept += 1;
        if (row.decision === 'REVIEW') acc.review += 1;
        if (row.decision === 'REJECT') acc.reject += 1;
        acc.avg_dominance += Number(row.dominance ?? 0);
        return acc;
      },
      { total: 0, accept: 0, review: 0, reject: 0, avg_dominance: 0 }
    );

    if (summary.total > 0) {
      summary.avg_dominance = Number((summary.avg_dominance / summary.total).toFixed(6));
    }

    return {
      meta: {
        engine: 'v5',
        mode: 'optimized_live',
        feed_source: feedSnapshot.source ?? 'unknown',
        eth_block: ethWindow.block ?? null,
      },
      rows,
      summary,
    };
  }, ENGINE_TTL);
}

if (process.argv[1] && process.argv[1].endsWith('engine_v5.js')) {
  runEngineV5()
    .then((result) => {
      console.log('[AXIUM:RUNTIME:ENGINE:V5]', JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:RUNTIME:ENGINE:V5]', error.message);
      process.exitCode = 1;
    });
}
