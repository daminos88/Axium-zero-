import { buildUnifiedSignalSet } from './feeds_eth_bridge.js';
import { runRuntimeBatch } from './oura_runtime_v2.js';

export function runEngineV2() {
  const bundle = buildUnifiedSignalSet();
  const signals = Array.isArray(bundle.signals) ? bundle.signals : [];
  const rows = runRuntimeBatch(signals);

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.decision === 'ACCEPT') acc.accept += 1;
      if (row.decision === 'REVIEW') acc.review += 1;
      if (row.decision === 'REJECT') acc.reject += 1;
      acc.avg_dominance += Number(row.dominance ?? 0);
      return acc;
    },
    { total: 0, accept: 0, review: 0, reject: 0, avg_dominance: 0 }
  );

  if (summary.total > 0) {
    summary.avg_dominance = Number((summary.avg_dominance / summary.total).toFixed(6));
  }

  return {
    meta: {
      ...(bundle.meta ?? {}),
      engine: 'v2',
      runtime: 'oura_runtime_v2',
    },
    rows,
    summary,
  };
}

if (process.argv[1] && process.argv[1].endsWith('engine_v2.js')) {
  const result = runEngineV2();
  console.log('[AXIUM:RUNTIME:ENGINE:V2]', JSON.stringify(result, null, 2));
}
