// runtime/manifolds.js
// AXIUM v0.6 manifold builder.
// Converts SingularityField output into directional action surfaces.

function clamp(n, lo = -1, hi = 1) {
  return Math.max(lo, Math.min(hi, n))
}

export function buildManifold(fieldState = {}) {
  const regime = fieldState.regime || 'NEUTRAL'
  const psi = Number(fieldState?.field?.psi || 0)
  const xi = Number(fieldState?.field?.xi || 0)
  const phi = Number(fieldState?.field?.phi || 0)
  const density = Number(fieldState?.field?.density || 0)
  const score = Number(fieldState?.score || 0)

  const longBias = clamp((psi * 0.5) + (xi * 0.35) - (phi * 0.15))
  const shortBias = clamp((-psi * 0.45) + (phi * 0.35) - (xi * 0.20))
  const actionPressure = clamp((score * 0.6) + (density * 0.4))

  let action = 'HOLD'
  if (regime === 'EXPANSION' && longBias > 0.25 && actionPressure > 0.2) action = 'EXPAND_LONG'
  if (regime === 'FRICTION' && shortBias > 0.2) action = 'REDUCE_RISK'
  if (regime === 'DEFENSIVE') action = 'DEFENSIVE_HOLD'

  return {
    ts: Date.now(),
    regime,
    manifold: {
      long_bias: Number(longBias.toFixed(6)),
      short_bias: Number(shortBias.toFixed(6)),
      action_pressure: Number(actionPressure.toFixed(6)),
    },
    action,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(buildManifold({}), null, 2))
}
