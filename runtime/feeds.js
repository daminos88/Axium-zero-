export function loadFeedSnapshot() {
  return {
    source: 'axium-feed-sim',
    ts: Date.now(),
    pairs: [
      { symbol: 'ETH/USDT', price: 3521.42, volume: 1842000 },
      { symbol: 'BTC/USDT', price: 68422.11, volume: 5310000 },
      { symbol: 'ARB/USDT', price: 1.12, volume: 742000 },
    ],
  };
}

export function normalizeFeed(snapshot = {}) {
  const pairs = Array.isArray(snapshot.pairs) ? snapshot.pairs : [];

  return pairs.map((pair, index) => ({
    id: `${pair.symbol ?? 'PAIR'}_${index + 1}`,
    symbol: pair.symbol ?? 'UNKNOWN',
    score: Number(pair.volume ?? 0) > 1000000 ? 0.82 : 0.58,
    confidence: Number(pair.price ?? 0) > 10 ? 0.77 : 0.61,
    raw: pair,
  }));
}
