import { runRuntimeBatch } from './oura_runtime.js';
import { loadFeedSnapshot, normalizeFeed } from './feeds.js';

export function runReplayFromFeeds() {
  const snapshot = loadFeedSnapshot();
  const signals = normalizeFeed(snapshot);
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

  return {
    snapshot_meta: {
      source: snapshot.source ?? 'unknown',
      ts: snapshot.ts ?? null,
      pairs: Array.isArray(snapshot.pairs) ? snapshot.pairs.length : 0,
    },
    rows,
    summary,
  };
}

if (process.argv[1] && process.argv[1].endsWith('replay_from_feeds.js')) {
  const result = runReplayFromFeeds();
  console.log('[AXIUM:RUNTIME:REPLAY:FEEDS]', JSON.stringify(result, null, 2));
}
