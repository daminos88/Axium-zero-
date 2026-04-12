# Finalize Execution Checklist

This checklist captures the exact remaining actions required to switch the repository from staged v0.6 candidates to active v0.6 runtime paths.

## 1. Replace active runtime files with staged v0.6 files
- [ ] runtime/data_absorber_v0_6.js -> runtime/data_absorber.js
- [ ] runtime/boot_v0_6.js -> runtime/boot.js
- [ ] runtime/eth_scan_v0_6.js -> runtime/eth_scan.js
- [ ] runtime/feeds_v0_6.js -> runtime/feeds.js
- [ ] runtime/oura_runtime_v0_6.js -> runtime/oura_runtime.js
- [ ] runtime/replay_v0_6.js -> runtime/replay.js
- [ ] runtime/wallet_scanner_v0_6.js -> runtime/wallet_scanner.js
- [ ] runtime/regime_v0_6.js -> runtime/regime.js
- [ ] runtime/singularity_v0_6.js -> runtime/singularity.js
- [ ] runtime/manifolds_v0_6.js -> runtime/manifolds.js
- [ ] runtime/pre_action_v0_6.js -> runtime/pre_action.js
- [ ] runtime/telegram_bridge_v0_6.js -> runtime/telegram_bridge.js

## 2. Remove non-v0.6 ladder files
- [ ] engine.js through engine_v6.js
- [ ] api_adapter.js through api_adapter_v7.js
- [ ] server_v2.js / server_v6.js / server_v7.js
- [ ] eth_scan_v2.js / eth_rpc.js
- [ ] feeds_v2.js / feeds_eth_bridge.js
- [ ] replay_eth.js / replay_eth_v2.js / replay_from_feeds.js
- [ ] oura_runtime_v2.js / cache.js

## 3. Re-anchor docs
- [ ] update ARCHITECTURE.md to v0.6 runtime tree
- [ ] update DEPRECATION_MAP.md to mark non-v0.6 layers removed or legacy
- [ ] update ZIP_RECOVERY_MANIFEST.md after exact switch

## 4. Verify
- [ ] boot.js imports resolve against same-name runtime files
- [ ] no references remain to removed engine/api/server ladders
- [ ] repo runtime is pure v0.6
