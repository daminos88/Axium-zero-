export function evaluateSignal(signal = {}) {
  const score = Number(signal.score ?? 0);
  const confidence = Number(signal.confidence ?? 0);

  if (score >= 0.85 && confidence >= 0.75) {
    return { decision: 'ACCEPT', dominance: score * confidence };
  }

  if (score >= 0.5 && confidence >= 0.5) {
    return { decision: 'REVIEW', dominance: score * confidence };
  }

  return { decision: 'REJECT', dominance: score * confidence };
}

export function runRuntimeBatch(signals = []) {
  return signals.map((signal, index) => ({
    id: signal.id ?? `sig_${index + 1}`,
    ...evaluateSignal(signal),
  }));
}
