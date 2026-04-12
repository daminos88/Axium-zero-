export function getEthRpcUrl() {
  const url = process.env.ETH_RPC_URL ?? process.env.ALCHEMY_RPC_URL ?? '';
  if (!url) {
    throw new Error('Missing ETH_RPC_URL or ALCHEMY_RPC_URL');
  }
  return url;
}

async function rpcCall(method, params = []) {
  const url = getEthRpcUrl();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`RPC ${payload.error.code}: ${payload.error.message}`);
  }

  return payload.result;
}

export async function getLatestBlockNumber() {
  const hex = await rpcCall('eth_blockNumber');
  return Number.parseInt(hex, 16);
}

export async function getBlockByNumber(tag = 'latest', hydrated = false) {
  return rpcCall('eth_getBlockByNumber', [tag, hydrated]);
}

if (process.argv[1] && process.argv[1].endsWith('eth_rpc.js')) {
  getLatestBlockNumber()
    .then((block) => {
      console.log(JSON.stringify({ ok: true, latest_block: block }, null, 2));
    })
    .catch((error) => {
      console.error('[AXIUM:ETH:RPC]', error.message);
      process.exitCode = 1;
    });
}
