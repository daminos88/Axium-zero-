const DEFAULT_IDS = ['bitcoin', 'ethereum', 'arbitrum'];

export function getMarketApiBase() {
  return process.env.MARKET_API_BASE_URL ?? 'https://api.coingecko.com/api/v3';
}

export function getMarketIds() {
  const raw = process.env.MARKET_IDS ?? DEFAULT_IDS.join(',');
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`MARKET_HTTP_${response.status}`);
  }

  return response.json();
}

export async function loadFeedSnapshotV2() {
  const ids = getMarketIds();
  const base = getMarketApiBase();
  const endpoint = `${base}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(','))}&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=false&price_change_percentage=24h`;
  const rows = await fetchJson(endpoint);

  const pairs = Array.isArray(rows)
    ? rows.map((row) => ({
        symbol: `${String(row.symbol ?? 'unknown').toUpperCase()}/USD`,
        price: Number(row.current_price ?? 0),
        volume: Number(row.total_volume ?? 0),
        change_24h: Number(row.price_change_percentage_24h ?? 0),
        market_cap_rank: Number(row.market_cap_rank ?? 0),
        source_id: row.id ?? null,
      }))
    : [];

  return {
    source: 'coingecko',
    ts: Date.now(),
    pairs,
  };
}

export function normalizeFeedV2(snapshot = {}) {
  const pairs = Array.isArray(snapshot.pairs) ? snapshot.pairs : [];

  return pairs.map((pair, index) => {
    const volume = Number(pair.volume ?? 0);
    const price = Number(pair.price ?? 0);
    const change = Math.abs(Number(pair.change_24h ?? 0));

    const score = Math.max(0, Math.min(1, volume > 100000000 ? 0.9 : volume > 10000000 ? 0.76 : 0.61));
    const confidence = Math.max(0, Math.min(1, price > 100 ? 0.84 : price > 1 ? 0.73 : 0.65));
    const coherence = Math.max(0, Math.min(1, change < 5 ? 0.82 : change < 12 ? 0.68 : 0.54));
    const stability = Math.max(0, Math.min(1, Number(pair.market_cap_rank ?? 999) <= 25 ? 0.86 : 0.67));

    return {
      id: `${pair.symbol ?? 'PAIR'}_${index + 1}`,
      symbol: pair.symbol ?? 'UNKNOWN',
      asset: pair.symbol ?? 'UNKNOWN',
      score: Number(score.toFixed(6)),
      confidence: Number(confidence.toFixed(6)),
      coherence: Number(coherence.toFixed(6)),
      stability: Number(stability.toFixed(6)),
      raw: pair,
    };
  });
}

if (process.argv[1] && process.argv[1].endsWith('feeds_v2.js')) {
  loadFeedSnapshotV2()
    .then((snapshot) => {
      console.log(JSON.stringify(snapshot, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:FEEDS:V2]', error.message);
      process.exitCode = 1;
    });
}
