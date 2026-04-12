// runtime/replay.js
// AXIUM v0.6 replay layer.
// Recomputes OURA field snapshots from stored data and live feed context.

import { ouraRuntime } from './oura_runtime.js'

export async function replay(limit = 5) {
  const rows = []
  for (let i = 0; i < limit; i++) {
    const r = await ouraRuntime()
    rows.push({
      ts: r.ts,
      score: r.score,
      psi: r.field.psi,
      xi: r.field.xi,
      phi: r.field.phi,
    })
  }

  const total = rows.length
  const avg = (k) => total ? rows.reduce((a, b) => a + Number(b[k] || 0), 0) / total : 0

  return {
    version: 'v0.6',
    total,
    avg_score: Number(avg('score').toFixed(6)),
    avg_psi: Number(avg('psi').toFixed(6)),
    avg_xi: Number(avg('xi').toFixed(6)),
    avg_phi: Number(avg('phi').toFixed(6)),
    rows,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  replay()
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
