// runtime/oura_runtime.js
// AXIUM v0.6 OURA core runtime.
// Converts unified feed state into the compact field vector used by
// regime, singularity, manifolds, and replay layers.

import { buildFeeds } from './feeds.js'

function clamp(n, lo = -1, hi = 1) {
  return Math.max(lo, Math.min(hi, n))
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

export async function ouraRuntime() {
  const feeds = await buildFeeds()

  const sentiment = Number(feeds?.replay?.sentiment || 0)
  const swapPressure = Number(feeds?.replay?.swap_pressure || 0)
  const liveBps = Number(feeds?.market?.live_bps || 0)
  const crossBps = Number(feeds?.market?.cross_bps || 0)
  const fastGas = Number(feeds?.gas?.fast_gwei || 0)
  const proposeGas = Number(feeds?.gas?.propose_gwei || 0)

  const psi = clamp(sigmoid((liveBps + crossBps) / 50) * 2 - 1)
  const xi = clamp(sigmoid((swapPressure + sentiment * 10) / 25) * 2 - 1)
  const phi = clamp(sigmoid((fastGas - proposeGas) / 10) * 2 - 1)

  const oura = {
    ts: Date.now(),
    feeds,
    field: {
      psi: Number(psi.toFixed(6)),
      xi: Number(xi.toFixed(6)),
      phi: Number(phi.toFixed(6)),
    },
    score: Number(((psi * 0.45) + (xi * 0.35) - (phi * 0.20)).toFixed(6)),
  }

  return oura
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ouraRuntime()
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
