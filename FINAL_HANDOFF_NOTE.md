# Final Handoff Note

The repository now contains the recovered AXIUM v0.6 core as staged replacement candidates:

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

The remaining repo transition is mechanical:
1. overwrite same-name runtime files with these staged v0.6 versions
2. remove the non-v0.6 engine/api/server ladder
3. re-anchor docs to the pure v0.6 runtime tree

See also:
- V0_6_REPLACEMENT_STATUS.md
- V0_6_TAKEOVER_PLAN.md
- FINALIZE_EXECUTION_CHECKLIST.md
