# v0.6 Replacement Status

The following v0.6 replacement candidates have been pushed into the repository as safety-staged files:

- runtime/data_absorber_v0_6.js
- runtime/boot_v0_6.js
- runtime/eth_scan_v0_6.js
- runtime/feeds_v0_6.js
- runtime/oura_runtime_v0_6.js
- runtime/replay_v0_6.js
- runtime/wallet_scanner_v0_6.js
- runtime/regime_v0_6.js
- runtime/singularity_v0_6.js
- runtime/manifolds_v0_6.js
- runtime/pre_action_v0_6.js
- runtime/telegram_bridge_v0_6.js

## Remaining replacement step
The repo still needs a final destructive replacement pass to:

1. overwrite same-name runtime files with the v0.6 versions
2. remove legacy engine/api/server version ladders that do not exist in v0.6
3. re-anchor deploy/runtime docs around the v0.6 tree

## Current state
- v0.6 core files are present as staged candidates
- canonical repo has not yet been switched to pure v0.6
