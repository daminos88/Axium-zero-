import { runRuntimeBatch } from './oura_runtime.js';

export function buildReplaySet() {
  return [
    { id: 'case_001', score: 0.91, confidence: 0.82 },
    { id: 'case_002', score: 0.68, confidence: 0.64 },
    { id: 'case_003', score: 0.22, confidence: 0.93 },
    { id: 'case_004', score: 0.49, confidence: 0.45 },
  ];
}

export function runReplay() {
  const signals = buildReplaySet();
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
    summary.avg_dominance = summary.avg_dominance / summary.total;
  }

  return { rows, summary };
}

if (process.argv[1] && process.argv[1].endsWith('replay.js')) {
  const result = runReplay();
  console.log('[AXIUM:RUNTIME:REPLAY]', JSON.stringify(result, null, 2));
}
