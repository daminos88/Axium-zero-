import { runRuntimeBatch } from './oura_runtime_v2.js';
import { scanEthereumWindowV2, deriveSignalsFromEthScanV2 } from './eth_scan_v2.js';

export async function runReplayEthV2() {
  const window = await scanEthereumWindowV2();
  const signals = deriveSignalsFromEthScanV2(window);
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
    scan_meta: {
      chain: window.chain ?? 'unknown',
      block: window.block ?? null,
      scanned_at: window.scanned_at ?? null,
      transfers: Array.isArray(window.transfers) ? window.transfers.length : 0,
      source: 'eth_scan_v2',
    },
    rows,
    summary,
  };
}

if (process.argv[1] && process.argv[1].endsWith('replay_eth_v2.js')) {
  runReplayEthV2()
    .then((result) => {
      console.log('[AXIUM:RUNTIME:REPLAY:ETH:V2]', JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:RUNTIME:REPLAY:ETH:V2]', error.message);
      process.exitCode = 1;
    });
}
