// runtime/singularity.js
// AXIUM v0.6 SingularityField.
// Fuses OURA field, regime, wallet behavior, and market context into a single
// compact field surface used by manifolds and pre-action gating.

function clamp(n, lo = -1, hi = 1) {
  return Math.max(lo, Math.min(hi, n))
}

export function runSingularityField(input = {}) {
  const snapshot = input.snapshot || {}
  const eth = input.eth || {}
  const wallets = input.wallets || {}
  const regime = input.regime || {}

  const walletActivity = Number(wallets.activity_score || 0)
  const liveBps = Number(eth?.market?.live_bps || 0)
  const crossBps = Number(eth?.market?.cross_bps || 0)
  const regimeVol = Number(regime?.state?.volatility || 0)
  const regimeFlow = Number(regime?.state?.flow_pressure || 0)
  const regimeStress = Number(regime?.state?.liquidity_stress || 0)

  const candleCount = Array.isArray(snapshot?.candles) ? snapshot.candles.length : 0
  const swapCount = Array.isArray(snapshot?.swaps) ? snapshot.swaps.length : 0
  const density = clamp((candleCount + swapCount) / 200)

  const psi = clamp((liveBps / 50) + (crossBps / 100))
  const xi = clamp((walletActivity / 100) + regimeFlow)
  const phi = clamp(regimeStress + (density * 0.5))

  const fieldScore = clamp((psi * 0.4) + (xi * 0.4) - (phi * 0.2))

  return {
    ts: Date.now(),
    regime: regime.label || 'NEUTRAL',
    field: {
      psi: Number(psi.toFixed(6)),
      xi: Number(xi.toFixed(6)),
      phi: Number(phi.toFixed(6)),
      density: Number(density.toFixed(6)),
    },
    score: Number(fieldScore.toFixed(6)),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(runSingularityField({}), null, 2))
}
