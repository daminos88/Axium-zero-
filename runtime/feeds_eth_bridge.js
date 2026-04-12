import { loadFeedSnapshot, normalizeFeed } from './feeds.js';
import { scanEthereumWindow, deriveSignalsFromEthScan } from './eth_scan.js';

export function buildUnifiedSignalSet() {
  const feedSnapshot = loadFeedSnapshot();
  const feedSignals = normalizeFeed(feedSnapshot);

  const ethWindow = scanEthereumWindow();
  const ethSignals = deriveSignalsFromEthScan(ethWindow);

  return {
    meta: {
      feed_source: feedSnapshot.source ?? 'unknown',
      feed_pairs: Array.isArray(feedSnapshot.pairs) ? feedSnapshot.pairs.length : 0,
      eth_chain: ethWindow.chain ?? 'unknown',
      eth_block: ethWindow.block ?? null,
      eth_transfers: Array.isArray(ethWindow.transfers) ? ethWindow.transfers.length : 0,
    },
    signals: [...feedSignals, ...ethSignals],
  };
}

if (process.argv[1] && process.argv[1].endsWith('feeds_eth_bridge.js')) {
  const result = buildUnifiedSignalSet();
  console.log('[AXIUM:RUNTIME:BRIDGE]', JSON.stringify(result, null, 2));
}
