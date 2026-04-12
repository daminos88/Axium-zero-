// runtime/telegram_bridge.js
// AXIUM v0.6 Telegram bridge.
// Sends execution-gate alerts to a configured Telegram bot/channel.

import { spawnSync } from 'child_process'

function sh(cmd) {
  const out = spawnSync('bash', ['-lc', cmd], { encoding: 'utf8' })
  if (out.status !== 0) {
    throw new Error((out.stderr || out.stdout || 'command failed').trim())
  }
  return out.stdout.trim()
}

export async function dispatchTelegram(message = '') {
  const token = process.env.TELEGRAM_BOT_TOKEN || ''
  const chatId = process.env.TELEGRAM_CHAT_ID || ''
  if (!token || !chatId || !message) {
    return { ok: false, skipped: true }
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text: message,
    disable_web_page_preview: true,
  })

  const safe = payload.replace(/'/g, "'\\''")
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const res = sh(`curl -s -X POST '${url}' -H 'content-type: application/json' --data '${safe}'`)

  return { ok: true, response: res }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  dispatchTelegram(process.argv[2] || 'AXIUM v0.6 test alert')
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
