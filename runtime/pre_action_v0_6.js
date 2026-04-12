// runtime/pre_action.js
// AXIUM v0.6 execution gate.
// Decides whether the current manifold is safe to act on and emits optional alert text.

export function preActionCheck(surface = {}) {
  const regime = surface.regime || 'NEUTRAL'
  const longBias = Number(surface?.manifold?.long_bias || 0)
  const shortBias = Number(surface?.manifold?.short_bias || 0)
  const pressure = Number(surface?.manifold?.action_pressure || 0)
  const action = surface?.action || 'HOLD'

  let allowed = false
  let reason = 'insufficient pressure'
  let alert = null

  if (action === 'EXPAND_LONG' && longBias > 0.3 && pressure > 0.25) {
    allowed = true
    reason = 'long surface confirmed'
  } else if (action === 'REDUCE_RISK' && shortBias > 0.2) {
    allowed = true
    reason = 'risk reduction surface confirmed'
  } else if (action === 'DEFENSIVE_HOLD' && regime === 'DEFENSIVE') {
    allowed = true
    reason = 'defensive regime hold confirmed'
  }

  if (allowed) {
    alert = `[AXIUM ${regime}] ${action} | pressure=${pressure.toFixed(4)} long=${longBias.toFixed(4)} short=${shortBias.toFixed(4)}`
  }

  return {
    ts: Date.now(),
    allowed,
    action,
    reason,
    alert,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(preActionCheck({}), null, 2))
}
