import { runRuntimeBatch } from './oura_runtime.js';
import { scanEthereumWindow, deriveSignalsFromEthScan } from './eth_scan.js';

export function runReplayEth() {
  const window = scanEthereumWindow();
  const signals = deriveSignalsFromEthScan(window);
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
    summary.avg_dominance = summary.avg_dominance / summary.total;
  }

  return {
    scan_meta: {
      chain: window.chain ?? 'unknown',
      block: window.block ?? null,
      scanned_at: window.scanned_at ?? null,
      transfers: Array.isArray(window.transfers) ? window.transfers.length : 0,
    },
    rows,
    summary,
  };
}

if (process.argv[1] && process.argv[1].endsWith('replay_eth.js')) {
  const result = runReplayEth();
  console.log('[AXIUM:RUNTIME:REPLAY:ETH]', JSON.stringify(result, null, 2));
}
