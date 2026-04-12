// runtime/feeds.js
// AXIUM v0.6 feed combiner.
// Normalizes replay + live Ethereum scan into one compact state bundle.

import { replaySnapshot } from './data_absorber.js'
import { scanEth } from './eth_scan.js'

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export async function buildFeeds() {
  const replay = replaySnapshot(50)
  const eth = await scanEth()

  const candleCloses = (replay.candles || []).map(c => Number(c.close || 0)).filter(Boolean)
  const gasSeries = (replay.gas || []).map(g => Number(g.wei || 0)).filter(Boolean)
  const newsScores = (replay.news || []).map(n => Number(n.score || 0))
  const swaps = replay.swaps || []

  const avgClose = avg(candleCloses)
  const avgGas = avg(gasSeries)
  const sentiment = avg(newsScores)
  const swapPressure = swaps.length
    ? avg(swaps.map(s => Number(s.amount1 || 0) - Number(s.amount0 || 0)))
    : 0

  return {
    ts: Date.now(),
    replay: {
      candles: candleCloses.length,
      swaps: swaps.length,
      avg_close: Number(avgClose.toFixed(6)),
      avg_gas_wei: Number(avgGas.toFixed(2)),
      sentiment: Number(sentiment.toFixed(6)),
      swap_pressure: Number(swapPressure.toFixed(6))
    },
    market: eth.market,
    gas: eth.gas,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildFeeds()
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
