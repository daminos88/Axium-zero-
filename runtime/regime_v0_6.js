// runtime/regime.js
// AXIUM v0.6 regime model.
// Classifies current market state using replay context + live ETH scan.

function clamp(n, lo = -1, hi = 1) {
  return Math.max(lo, Math.min(hi, n))
}

export function computeRegime(snapshot = {}, eth = {}) {
  const avgClose = Number(snapshot?.candles?.[0]?.close || 0)
  const swapCount = Array.isArray(snapshot?.swaps) ? snapshot.swaps.length : 0
  const sentiment = Array.isArray(snapshot?.news)
    ? snapshot.news.reduce((a, b) => a + Number(b.score || 0), 0) / Math.max(snapshot.news.length, 1)
    : 0

  const liveBps = Number(eth?.market?.live_bps || 0)
  const crossBps = Number(eth?.market?.cross_bps || 0)
  const fastGas = Number(eth?.gas?.fast_gwei || 0)

  const volatility = clamp((Math.abs(liveBps) + Math.abs(crossBps)) / 100)
  const liquidityStress = clamp((fastGas - 20) / 100)
  const flowPressure = clamp((swapCount / 100) + sentiment)

  let label = 'NEUTRAL'
  if (volatility > 0.6 && flowPressure > 0.2) label = 'EXPANSION'
  if (volatility > 0.6 && liquidityStress > 0.4) label = 'FRICTION'
  if (flowPressure < -0.2) label = 'DEFENSIVE'

  return {
    ts: Date.now(),
    label,
    state: {
      volatility: Number(volatility.toFixed(6)),
      liquidity_stress: Number(liquidityStress.toFixed(6)),
      flow_pressure: Number(flowPressure.toFixed(6)),
      anchor_price: Number(avgClose.toFixed(6)),
    },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(computeRegime({}, {}), null, 2))
}
