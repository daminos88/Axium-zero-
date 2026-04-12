# v0.6 Takeover Plan

This plan defines the final destructive replacement pass required to make the repository match AXIUM v0.6 as the canonical runtime.

## Replace active runtime files
- runtime/data_absorber_v0_6.js -> runtime/data_absorber.js
- runtime/boot_v0_6.js -> runtime/boot.js
- runtime/eth_scan_v0_6.js -> runtime/eth_scan.js
- runtime/feeds_v0_6.js -> runtime/feeds.js
- runtime/oura_runtime_v0_6.js -> runtime/oura_runtime.js
- runtime/replay_v0_6.js -> runtime/replay.js
- runtime/wallet_scanner_v0_6.js -> runtime/wallet_scanner.js
- runtime/regime_v0_6.js -> runtime/regime.js
- runtime/singularity_v0_6.js -> runtime/singularity.js
- runtime/manifolds_v0_6.js -> runtime/manifolds.js
- runtime/pre_action_v0_6.js -> runtime/pre_action.js
- runtime/telegram_bridge_v0_6.js -> runtime/telegram_bridge.js

## Remove or demote non-v0.6 ladder
- engine.js through engine_v6.js
- api_adapter.js through api_adapter_v7.js
- server_v2.js / server_v6.js / server_v7.js
- eth_scan_v2.js / eth_rpc.js
- feeds_v2.js / feeds_eth_bridge.js
- replay_eth.js / replay_eth_v2.js / replay_from_feeds.js
- oura_runtime_v2.js / cache.js

## Re-anchor docs after switch
- ARCHITECTURE.md
- DEPRECATION_MAP.md
- ZIP_RECOVERY_MANIFEST.md
- V0_6_REPLACEMENT_STATUS.md

## Current state
The v0.6 core files are already present in the repository as *_v0_6.js candidates.
The remaining step is the destructive rename/replace/delete pass.
