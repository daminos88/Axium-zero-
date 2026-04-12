import { loadFeedSnapshotV2, normalizeFeedV2 } from './feeds_v2.js';
import { scanEthereumWindowV2, deriveSignalsFromEthScanV2 } from './eth_scan_v2.js';
import { runRuntimeBatch } from './oura_runtime_v2.js';
import { getOrSetCacheEntry } from './cache.js';

const FEED_TTL = 8000;
const ETH_TTL = 3000;
const ENGINE_TTL = 2000;

function buildSummary(rows = []) {
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

  return summary;
}

export async function runEngineV6() {
  return getOrSetCacheEntry('engine_v6', async () => {
    const [feedSnapshot, ethWindow] = await Promise.all([
      getOrSetCacheEntry('feeds_v2', () => loadFeedSnapshotV2(), FEED_TTL),
      getOrSetCacheEntry('eth_scan_v2', () => scanEthereumWindowV2(), ETH_TTL),
    ]);

    const feedSignals = normalizeFeedV2(feedSnapshot);
    const ethSignals = deriveSignalsFromEthScanV2(ethWindow);
    const signals = [...feedSignals, ...ethSignals];
    const rows = runRuntimeBatch(signals);
    const summary = buildSummary(rows);

    return {
      version: 'v6',
      canonical: true,
      meta: {
        engine: 'v6',
        mode: 'canonical_live',
        runtime: 'oura_runtime_v2',
        feed_source: feedSnapshot.source ?? 'unknown',
        feed_pairs: Array.isArray(feedSnapshot.pairs) ? feedSnapshot.pairs.length : 0,
        eth_chain: ethWindow.chain ?? 'unknown',
        eth_block: ethWindow.block ?? null,
        eth_transfers: Array.isArray(ethWindow.transfers) ? ethWindow.transfers.length : 0,
        eth_source: 'eth_scan_v2',
        cache: {
          feed_ttl_ms: FEED_TTL,
          eth_ttl_ms: ETH_TTL,
          engine_ttl_ms: ENGINE_TTL,
        },
      },
      rows,
      summary,
    };
  }, ENGINE_TTL);
}

if (process.argv[1] && process.argv[1].endsWith('engine_v6.js')) {
  runEngineV6()
    .then((result) => {
      console.log('[AXIUM:RUNTIME:ENGINE:V6]', JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:RUNTIME:ENGINE:V6]', error.message);
      process.exitCode = 1;
    });
}
