import { getBlockByNumber, getLatestBlockNumber } from './eth_rpc.js';

function toNumber(hexValue, fallback = 0) {
  if (typeof hexValue !== 'string' || !hexValue.startsWith('0x')) {
    return fallback;
  }

  const parsed = Number.parseInt(hexValue, 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function deriveRiskHint(tx = {}) {
  const gas = toNumber(tx.gas, 0);
  const value = toNumber(tx.value, 0);

  let risk = 0.15;

  if (gas > 500000) risk += 0.2;
  if (value > 0) risk += 0.25;
  if (!tx.to) risk += 0.15;
  if ((tx.input ?? '0x') !== '0x') risk += 0.2;

  return Math.max(0, Math.min(1, Number(risk.toFixed(6))));
}

export async function scanEthereumWindowV2() {
  const latest = await getLatestBlockNumber();
  const tag = `0x${latest.toString(16)}`;
  const block = await getBlockByNumber(tag, true);
  const txs = Array.isArray(block?.transactions) ? block.transactions : [];

  const transfers = txs.slice(0, 25).map((tx, index) => ({
    hash: tx.hash ?? `0xtx_${index + 1}`,
    token: tx.value && tx.value !== '0x0' ? 'ETH' : 'CALL',
    value: toNumber(tx.value, 0),
    gas: toNumber(tx.gas, 0),
    from: tx.from ?? null,
    to: tx.to ?? null,
    risk_hint: deriveRiskHint(tx),
  }));

  return {
    chain: 'ethereum',
    block: latest,
    scanned_at: Date.now(),
    transfers,
  };
}

export function deriveSignalsFromEthScanV2(window = {}) {
  const transfers = Array.isArray(window.transfers) ? window.transfers : [];

  return transfers.map((transfer, index) => ({
    id: transfer.hash ?? `eth_${index + 1}`,
    asset: transfer.token ?? 'UNKNOWN',
    score: Math.max(0, Math.min(1, 1 - Number(transfer.risk_hint ?? 0))),
    confidence: transfer.value > 0 ? 0.83 : 0.67,
    coherence: transfer.to ? 0.76 : 0.54,
    stability: transfer.gas > 21000 ? 0.71 : 0.64,
    raw: transfer,
  }));
}

if (process.argv[1] && process.argv[1].endsWith('eth_scan_v2.js')) {
  scanEthereumWindowV2()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:ETH:SCAN:V2]', error.message);
      process.exitCode = 1;
    });
}
