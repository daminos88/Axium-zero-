import { loadFeedSnapshotV2, normalizeFeedV2 } from './feeds_v2.js';
import { scanEthereumWindowV2, deriveSignalsFromEthScanV2 } from './eth_scan_v2.js';
import { runRuntimeBatch } from './oura_runtime_v2.js';

export async function runEngineV4() {
  const feedSnapshot = await loadFeedSnapshotV2();
  const feedSignals = normalizeFeedV2(feedSnapshot);

  const ethWindow = await scanEthereumWindowV2();
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
      engine: 'v4',
      runtime: 'oura_runtime_v2',
      feed_source: feedSnapshot.source ?? 'unknown',
      feed_pairs: Array.isArray(feedSnapshot.pairs) ? feedSnapshot.pairs.length : 0,
      eth_chain: ethWindow.chain ?? 'unknown',
      eth_block: ethWindow.block ?? null,
      eth_transfers: Array.isArray(ethWindow.transfers) ? ethWindow.transfers.length : 0,
      eth_source: 'eth_scan_v2',
      mode: 'full_live',
    },
    rows,
    summary,
  };
}

if (process.argv[1] && process.argv[1].endsWith('engine_v4.js')) {
  runEngineV4()
    .then((result) => {
      console.log('[AXIUM:RUNTIME:ENGINE:V4]', JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:RUNTIME:ENGINE:V4]', error.message);
      process.exitCode = 1;
    });
}
