// runtime/data_absorber.js
// Online Data Absorber.
// While online: ingests all available historical + live data.
// Persists everything to SQLite.
// When offline: replays from SQLite to keep learning active.

import Database from 'better-sqlite3'
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const dbPath = path.resolve('./data/axium.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })
const db = new Database(dbPath)

db.exec(`
CREATE TABLE IF NOT EXISTS candles (
  ts INTEGER,
  venue TEXT,
  symbol TEXT,
  open REAL,
  high REAL,
  low REAL,
  close REAL,
  volume REAL,
  PRIMARY KEY (ts, venue, symbol)
);
CREATE TABLE IF NOT EXISTS swaps (
  tx TEXT PRIMARY KEY,
  ts INTEGER,
  pool TEXT,
  price REAL,
  amount0 REAL,
  amount1 REAL,
  fee REAL,
  block INTEGER
);
CREATE TABLE IF NOT EXISTS gas (
  ts INTEGER PRIMARY KEY,
  wei REAL,
  source TEXT
);
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  ts INTEGER,
  title TEXT,
  score REAL,
  source TEXT,
  url TEXT
);
CREATE TABLE IF NOT EXISTS telemetry (
  ts INTEGER,
  field TEXT,
  value REAL,
  source TEXT
);
`)

const insertCandle = db.prepare(`
  INSERT OR REPLACE INTO candles VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)
const insertSwap = db.prepare(`
  INSERT OR REPLACE INTO swaps VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)
const insertGas = db.prepare(`
  INSERT OR REPLACE INTO gas VALUES (?, ?, ?)
`)
const insertNews = db.prepare(`
  INSERT OR REPLACE INTO news VALUES (?, ?, ?, ?, ?, ?)
`)
const insertTelemetry = db.prepare(`
  INSERT INTO telemetry VALUES (?, ?, ?, ?)
`)

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

// --------- DATA SOURCES ----------

async function fetchCoinGeckoHistory(id = 'ethereum', days = 365) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  const data = j(`curl -sL '${url}'`)
  const prices = data.prices || []
  const vols   = data.total_volumes || []
  for (let i = 1; i < prices.length; i++) {
    const [ts, close] = prices[i]
    const open = prices[i - 1][1]
    const high = Math.max(open, close)
    const low  = Math.min(open, close)
    const volume = (vols[i] || [0, 0])[1]
    insertCandle.run(ts, 'coingecko', id.toUpperCase() + '/USD', open, high, low, close, volume)
  }
  return prices.length
}

async function fetchGeckoTerminalPools(page = 1) {
  const url = `https://api.geckoterminal.com/api/v2/networks/eth/pools?page=${page}`
  const data = j(`curl -sL '${url}'`)
  const arr = data?.data || []
  for (const p of arr) {
    const attr = p.attributes || {}
    const ts = Date.now()
    const price = Number(attr.base_token_price_usd || 0)
    const vol   = Number(attr.volume_usd?.h24 || 0)
    insertTelemetry.run(ts, 'pool_price', price, 'geckoterminal')
    insertTelemetry.run(ts, 'pool_volume_h24', vol, 'geckoterminal')
  }
  return arr.length
}

async function fetchGasOracle() {
  const key = process.env.ETHERSCAN_API_KEY || ''
  if (!key) return 0
  const url = `https://api.etherscan.io/v2/api?chainid=1&module=gastracker&action=gasoracle&apikey=${key}`
  const data = j(`curl -sL '${url}'`)
  const ts = Date.now()
  const wei = Number(data?.result?.SafeGasPrice || 0) * 1e9
  insertGas.run(ts, wei, 'etherscan')
  return wei
}

async function fetchBlockHeight() {
  const url = `https://eth.blockscout.com/api/v2/stats`
  const data = j(`curl -sL '${url}'`)
  const h = Number(data?.total_blocks || 0)
  insertTelemetry.run(Date.now(), 'block_height', h, 'blockscout')
  return h
}

async function fetchUniswapSubgraphSwaps(limit = 100) {
  const q = JSON.stringify({
    query: `
      {
        swaps(first: ${limit}, orderBy: timestamp, orderDirection: desc) {
          id
          timestamp
          pool { id feeTier }
          sqrtPriceX96
          amount0
          amount1
          transaction { id blockNumber }
        }
      }
    `
  })
  const data = j(`curl -s 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3' -H 'content-type: application/json' --data '${q.replace(/'/g, "'\\''")}'`)
  const swaps = data?.data?.swaps || []
  for (const s of swaps) {
    const ts = Number(s.timestamp) * 1000
    const sqrt = BigInt(s.sqrtPriceX96 || '0')
    const px = sqrt > 0n ? Number((sqrt * sqrt) >> 192n) : 0
    insertSwap.run(
      s.transaction?.id || s.id,
      ts,
      s.pool?.id || '',
      px,
      Number(s.amount0 || 0),
      Number(s.amount1 || 0),
      Number(s.pool?.feeTier || 0),
      Number(s.transaction?.blockNumber || 0)
    )
  }
  return swaps.length
}

async function fetchNewsRSS() {
  // lightweight RSS scraping via rss2json mirror (free)
  const url = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/'
  const data = j(`curl -sL '${url}'`)
  const items = data?.items || []
  for (const item of items.slice(0, 50)) {
    const title = item.title || ''
    const score = /hack|exploit|drain|lawsuit|ban|crash/i.test(title)
      ? -0.8
      : /etf|approval|adoption|partnership|upgrade|integration/i.test(title)
      ? 0.7
      : 0.0
    insertNews.run(item.guid || item.link, new Date(item.pubDate).getTime(), title, score, 'coindesk', item.link)
  }
  return items.length
}

// --------- ABSORB / REPLAY ----------

export async function absorbAll() {
  const res = {}
  try { res.cg = await fetchCoinGeckoHistory('ethereum', 365) } catch (e) { res.cgErr = e.message }
  try { res.gt = await fetchGeckoTerminalPools(1) } catch (e) { res.gtErr = e.message }
  try { res.gas = await fetchGasOracle() } catch (e) { res.gasErr = e.message }
  try { res.height = await fetchBlockHeight() } catch (e) { res.heightErr = e.message }
  try { res.swaps = await fetchUniswapSubgraphSwaps(100) } catch (e) { res.swapsErr = e.message }
  try { res.news = await fetchNewsRSS() } catch (e) { res.newsErr = e.message }

  insertTelemetry.run(Date.now(), 'absorb_complete', 1, 'data_absorber')
  return res
}

export function replaySnapshot(limit = 50) {
  const candles = db.prepare(`SELECT * FROM candles ORDER BY ts DESC LIMIT ?`).all(limit)
  const swaps   = db.prepare(`SELECT * FROM swaps ORDER BY ts DESC LIMIT ?`).all(limit)
  const gas     = db.prepare(`SELECT * FROM gas ORDER BY ts DESC LIMIT ?`).all(limit)
  const news    = db.prepare(`SELECT * FROM news ORDER BY ts DESC LIMIT ?`).all(limit)
  return { candles, swaps, gas, news }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || 'absorb'
  ;(async () => {
    if (mode === 'absorb') {
      const r = await absorbAll()
      console.log(JSON.stringify(r, null, 2))
    } else {
      console.log(JSON.stringify(replaySnapshot(), null, 2))
    }
  })().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
