# AXIUM ZERO v0.6

AXIUM ZERO v0.6 is the recovered runtime tree for the AXIUM system. This repository currently contains the v0.6 core staged as `*_v0_6.js` replacement candidates alongside earlier session-built layers that still need a final mechanical takeover pass.

## Current reality

The repository is in a transition state:

- the recovered v0.6 runtime has been pushed into the repo as staged candidates
- the active same-name runtime files have not all been replaced yet
- older engine/api/server ladders from earlier build passes still exist and must be removed or demoted during the final takeover

## v0.6 runtime modules

The recovered v0.6 core includes these runtime modules:

- `runtime/boot.js`
- `runtime/code_web.js`
- `runtime/data_absorber.js`
- `runtime/eth_scan.js`
- `runtime/feeds.js`
- `runtime/http.js`
- `runtime/manifolds.js`
- `runtime/offline_learning.js`
- `runtime/oura_runtime.js`
- `runtime/pre_action.js`
- `runtime/regime.js`
- `runtime/replay.js`
- `runtime/singularity.js`
- `runtime/telegram_bridge.js`
- `runtime/test.js`
- `runtime/test_hardening.js`
- `runtime/wallet_scanner.js`
- `runtime/web4_ingestion.js`

The staged v0.6 replacement candidates currently present in the repo are:

- `runtime/data_absorber_v0_6.js`
- `runtime/boot_v0_6.js`
- `runtime/eth_scan_v0_6.js`
- `runtime/feeds_v0_6.js`
- `runtime/oura_runtime_v0_6.js`
- `runtime/replay_v0_6.js`
- `runtime/wallet_scanner_v0_6.js`
- `runtime/regime_v0_6.js`
- `runtime/singularity_v0_6.js`
- `runtime/manifolds_v0_6.js`
- `runtime/pre_action_v0_6.js`
- `runtime/telegram_bridge_v0_6.js`

## Runtime flow

The intended v0.6 runtime flow is:

```text
boot
→ data_absorber
→ eth_scan
→ feeds
→ wallet_scanner
→ oura_runtime
→ replay
→ regime
→ singularity
→ manifolds
→ pre_action
→ telegram_bridge
```

## Scripts

The v0.6 ZIP also includes these script entrypoints:

- `scripts/deploy_sepolia.js`
- `scripts/test_flashbots_sepolia.js`
- `scripts/test_flashloan_sepolia.js`

## Deployment files

The replacement ZIP includes:

- `.gitignore`
- `Procfile`
- `package.json`
- `package-lock.json`
- `railway.json`

## Environment

Depending on which runtime paths are active, the system may require values such as:

```env
ETHERSCAN_API_KEY=
WALLET_WATCHLIST=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
PORT=3000
```

## Final takeover status

This repository is not yet a pure v0.6 tree. The remaining step is a destructive replacement pass that:

1. overwrites same-name runtime files with the staged `*_v0_6.js` files
2. removes non-v0.6 engine/api/server ladders
3. re-anchors documentation around the pure v0.6 runtime tree

See:

- `V0_6_REPLACEMENT_STATUS.md`
- `V0_6_TAKEOVER_PLAN.md`
- `FINALIZE_EXECUTION_CHECKLIST.md`
- `FINAL_HANDOFF_NOTE.md`

## Status

- v0.6 core recovery: staged in repo
- final runtime takeover: pending
- deploy after takeover: recommended
