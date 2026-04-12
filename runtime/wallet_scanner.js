export function scanWallet(address = '') {
  return {
    address,
    scanned_at: Date.now(),
    balance: 0,
    activity_score: 0.5,
  };
}

if (process.argv[1] && process.argv[1].endsWith('wallet_scanner.js')) {
  console.log(JSON.stringify(scanWallet('0x0'), null, 2));
}
