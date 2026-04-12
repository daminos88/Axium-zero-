# AXIUM ZERO — Deprecation Map

This document classifies runtime layers in the repository while ZIP recovery is still in progress.

## Canonical
- server_v6.js
- runtime/api_adapter_v6.js
- runtime/engine_v6.js
- runtime/oura_runtime_v2.js
- runtime/feeds_v2.js
- runtime/eth_scan_v2.js
- runtime/eth_rpc.js
- runtime/cache.js

## Transitional / legacy
- server_v2.js
- runtime/api_adapter_v2.js
- runtime/engine_v2.js
- runtime/engine_v3.js
- runtime/engine_v4.js
- runtime/engine_v5.js
- runtime/replay_eth.js
- runtime/replay_eth_v2.js
- runtime/replay_from_feeds.js
- src/index.js
- src/index_v2.js

## Imported-original policy
Any runtime, script, or spec file recovered verbatim from the uploaded ZIP archives should be treated as imported-original unless explicitly promoted into the canonical path.

## ZIP recovery note
See `ZIP_RECOVERY_MANIFEST.md` for files that still need exact import from the uploaded ZIP archives.
