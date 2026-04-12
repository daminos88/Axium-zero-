# ZIP Recovery Manifest

This manifest tracks the remaining files that must be recovered from the uploaded ZIP archives and pushed into this repository verbatim.

## Phase 1
- [x] .gitignore
- [x] package-lock.json

## Phase 2 — Missing runtime files to import exactly from ZIP
- [ ] runtime/code_web.js
- [ ] runtime/data_absorber.js  <!-- current repo version must be replaced with exact ZIP content -->
- [ ] runtime/http.js
- [ ] runtime/manifolds.js
- [ ] runtime/offline_learning.js
- [ ] runtime/pre_action.js
- [ ] runtime/regime.js
- [ ] runtime/singularity.js
- [ ] runtime/telegram_bridge.js
- [ ] runtime/test.js
- [ ] runtime/test_hardening.js
- [ ] runtime/wallet_scanner.js
- [ ] runtime/web4_ingestion.js

## Phase 3 — Missing scripts to import exactly from ZIP
- [ ] scripts/deploy_sepolia.js
- [ ] scripts/test_flashbots_sepolia.js
- [ ] scripts/test_flashloan_sepolia.js

## Phase 4 — Missing OURA spec layer from complete ZIP
- [ ] spec/oura/api.oura
- [ ] spec/oura/attestation.oura
- [ ] spec/oura/axium.oura
- [ ] spec/oura/calibration.oura
- [ ] spec/oura/execution.oura
- [ ] spec/oura/flashloan/*
- [ ] remaining spec/oura/* files from complete ZIP

## Canonical runtime (current repo)
- runtime/engine_v6.js
- runtime/api_adapter_v6.js
- server_v6.js

## Important rule
Do not treat placeholder files as completed ZIP recovery. Any file listed above must be imported from the ZIP verbatim before this manifest can be considered complete.
