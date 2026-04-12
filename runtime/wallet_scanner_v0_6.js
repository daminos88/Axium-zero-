// runtime/wallet_scanner.js
// AXIUM v0.6 wallet scanner.
// Reads a configured watchlist and builds wallet-state features for the field.

import { spawnSync } from 'child_process'

function sh(cmd) {
  const out = spawnSync('bash', ['-lc', cmd], { encoding: 'utf8' })
  if (out.status !== 0) {
    throw new Error((out.stderr || out.stdout || 'command failed').trim())
  }
  return out.stdout.trim()
}

function j(cmd) {
  const txt = sh(cmd)
  return JSON.parse(txt)
}

function getWatchlist() {
  return (process.env.WALLET_WATCHLIST || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

async function fetchAddressInfo(address) {
  const url = `https://eth.blockscout.com/api/v2/addresses/${address}`
  return j(`curl -sL '${url}'`)
}

export async function scanWallets() {
  const wallets = getWatchlist()
  const rows = []

  for (const address of wallets) {
    try {
      const info = await fetchAddressInfo(address)
      rows.push({
        address,
        tx_count: Number(info?.tx_count || 0),
        token_transfers_count: Number(info?.token_transfers_count || 0),
        coin_balance: Number(info?.coin_balance || 0),
      })
    } catch (err) {
      rows.push({
        address,
        error: err.message,
        tx_count: 0,
        token_transfers_count: 0,
        coin_balance: 0,
      })
    }
  }

  const activity = rows.length
    ? rows.reduce((a, b) => a + Number(b.tx_count || 0), 0) / rows.length
    : 0

  return {
    ts: Date.now(),
    wallets: rows,
    activity_score: Number(activity.toFixed(6)),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scanWallets()
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
