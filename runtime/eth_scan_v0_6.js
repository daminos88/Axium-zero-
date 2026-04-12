// runtime/eth_scan.js
// AXIUM v0.6 Ethereum scanner.
// Pulls wallet and mempool-facing context, estimates live BPS,
// and emits a compact market microstructure state for the rest of the runtime.

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

function pctBps(now, prev) {
  if (!prev || !Number.isFinite(prev) || prev === 0) return 0
  return ((now - prev) / prev) * 10000
}

async function fetchCoin(ids = 'ethereum,bitcoin') {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  return j(`curl -sL '${url}'`)
}

async function fetchGas() {
  const key = process.env.ETHERSCAN_API_KEY || ''
  if (!key) return { safe: 0, propose: 0, fast: 0 }
  const url = `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${key}`
  const data = j(`curl -sL '${url}'`)
  return {
    safe: Number(data?.result?.SafeGasPrice || 0),
    propose: Number(data?.result?.ProposeGasPrice || 0),
    fast: Number(data?.result?.FastGasPrice || 0)
  }
}

export async function scanEth() {
  const prices = await fetchCoin('ethereum,bitcoin')
  const gas = await fetchGas()

  const eth = Number(prices?.ethereum?.usd || 0)
  const btc = Number(prices?.bitcoin?.usd || 0)
  const eth24 = Number(prices?.ethereum?.usd_24h_change || 0)
  const btc24 = Number(prices?.bitcoin?.usd_24h_change || 0)

  const liveBps = pctBps(eth, eth / (1 + eth24 / 100))
  const crossBps = pctBps(eth24, btc24)

  return {
    ts: Date.now(),
    market: {
      eth_usd: eth,
      btc_usd: btc,
      eth_24h_change_pct: eth24,
      btc_24h_change_pct: btc24,
      live_bps: Number(liveBps.toFixed(4)),
      cross_bps: Number(crossBps.toFixed(4))
    },
    gas: {
      safe_gwei: gas.safe,
      propose_gwei: gas.propose,
      fast_gwei: gas.fast
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scanEth()
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
