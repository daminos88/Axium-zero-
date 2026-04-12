export function scanEthereumWindow() {
  return {
    chain: 'ethereum',
    block: 19876543,
    scanned_at: Date.now(),
    transfers: [
      { hash: '0xeth001', token: 'USDT', value: 125000, risk_hint: 0.22 },
      { hash: '0xeth002', token: 'WETH', value: 18.4, risk_hint: 0.41 },
      { hash: '0xeth003', token: 'ARB', value: 84210, risk_hint: 0.67 },
    ],
  };
}

export function deriveSignalsFromEthScan(window = {}) {
  const transfers = Array.isArray(window.transfers) ? window.transfers : [];

  return transfers.map((transfer, index) => ({
    id: transfer.hash ?? `eth_${index + 1}`,
    asset: transfer.token ?? 'UNKNOWN',
    score: Math.max(0, Math.min(1, 1 - Number(transfer.risk_hint ?? 0))),
    confidence: Number(transfer.value ?? 0) > 1000 ? 0.79 : 0.61,
    raw: transfer,
  }));
}
