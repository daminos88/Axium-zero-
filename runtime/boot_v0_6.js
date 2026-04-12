// runtime/boot.js
// AXIUM v0.6 boot sequence.

import { absorbAll, replaySnapshot } from './data_absorber.js'
import { scanEth } from './eth_scan.js'
import { scanWallets } from './wallet_scanner.js'
import { computeRegime } from './regime.js'
import { runSingularityField } from './singularity.js'
import { buildManifold } from './manifolds.js'
import { preActionCheck } from './pre_action.js'
import { dispatchTelegram } from './telegram_bridge.js'

export async function boot() {
  const absorbed = await absorbAll()
  const snapshot = replaySnapshot(25)
  const eth = await scanEth()
  const wallets = await scanWallets()
  const regime = computeRegime(snapshot, eth)
  const field = runSingularityField({ snapshot, eth, wallets, regime })
  const manifold = buildManifold(field)
  const pre = preActionCheck(manifold)

  return {
    version: 'v0.6',
    absorbed,
    snapshot,
    eth,
    wallets,
    regime,
    field,
    manifold,
    pre,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  boot()
    .then(async result => {
      if (result?.pre?.alert) {
        await dispatchTelegram(result.pre.alert)
      }
      console.log(JSON.stringify(result, null, 2))
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
