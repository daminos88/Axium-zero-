export const OURA_THRESHOLDS = Object.freeze({
  accept_score: 0.82,
  accept_confidence: 0.72,
  review_score: 0.58,
  review_confidence: 0.5,
  dominance_floor: 0.3,
});

function clampUnit(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function fixed6(value) {
  return Number(clampUnit(value).toFixed(6));
}

export function computeDominance(signal = {}) {
  const score = clampUnit(signal.score);
  const confidence = clampUnit(signal.confidence);
  const coherence = clampUnit(signal.coherence ?? score);
  const stability = clampUnit(signal.stability ?? confidence);

  const dominance =
    score * 0.4 +
    confidence * 0.3 +
    coherence * 0.2 +
    stability * 0.1;

  return fixed6(dominance);
}

export function evaluateSignal(signal = {}) {
  const score = clampUnit(signal.score);
  const confidence = clampUnit(signal.confidence);
  const coherence = clampUnit(signal.coherence ?? score);
  const stability = clampUnit(signal.stability ?? confidence);
  const dominance = computeDominance({ score, confidence, coherence, stability });

  let decision = 'REJECT';
  let reason = 'score/confidence below threshold';

  if (
    score >= OURA_THRESHOLDS.accept_score &&
    confidence >= OURA_THRESHOLDS.accept_confidence &&
    dominance >= OURA_THRESHOLDS.dominance_floor
  ) {
    decision = 'ACCEPT';
    reason = 'accept threshold met';
  } else if (
    score >= OURA_THRESHOLDS.review_score &&
    confidence >= OURA_THRESHOLDS.review_confidence
  ) {
    decision = 'REVIEW';
    reason = 'review threshold met';
  }

  return {
    decision,
    reason,
    score: fixed6(score),
    confidence: fixed6(confidence),
    coherence: fixed6(coherence),
    stability: fixed6(stability),
    dominance,
  };
}

export function runRuntimeBatch(signals = []) {
  const rows = Array.isArray(signals)
    ? signals.map((signal, index) => ({
        id: signal?.id ?? `sig_${index + 1}`,
        asset: signal?.asset ?? signal?.symbol ?? 'UNKNOWN',
        ...evaluateSignal(signal),
      }))
    : [];

  return rows;
}
