# AXIUM ZERO — Canonical Architecture

This repository currently contains both:

1. a canonical live runtime path
2. imported and pending ZIP recovery paths

## Canonical runtime path

The official execution path is:

```text
server_v6.js
→ runtime/api_adapter_v6.js
→ runtime/engine_v6.js
→ runtime/feeds_v2.js + runtime/eth_scan_v2.js
→ runtime/oura_runtime_v2.js
```

This path is considered canonical for deployment and live execution.

## ZIP recovery policy

Original ZIP files that are missing from the repository must be imported verbatim.
Recovered ZIP files do not automatically replace the canonical runtime unless explicitly promoted.

## Recovery tracking

See `ZIP_RECOVERY_MANIFEST.md` for the remaining files that must still be imported from the uploaded ZIP archives.

## Legacy / transitional layers

Older versioned layers (`engine_v2` through `engine_v5`, `server_v2`, `api_adapter_v2`, mock replay paths) are transitional and should not be treated as the official runtime surface.
