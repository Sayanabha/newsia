export type Signal = 'buy' | 'watch' | 'avoid'

export interface ScoredSignal {
  signal:     Signal
  confidence: number  // 0 to 1
  reason:     string
}

export function generateSignal(
  sentiment:      string,
  sentimentScore: number,
  importance:     string,
  impactScore:    number,
  matchScore:     number,
  articleTitle:   string
): ScoredSignal {

  // Normalize inputs
  const sentNorm   = Math.max(-1, Math.min(1, sentimentScore))
  const impactNorm = Math.max(0,  Math.min(100, impactScore)) / 100
  const matchNorm  = Math.min(matchScore / 5, 1)

  const importanceWeight =
    importance === 'high'   ? 1.0 :
    importance === 'medium' ? 0.6 : 0.3

  // Composite confidence score
  const confidence = Math.round(
    ((Math.abs(sentNorm) * 0.4) +
     (impactNorm         * 0.35) +
     (matchNorm          * 0.15) +
     (importanceWeight   * 0.10)) * 100
  ) / 100

  // Determine signal direction
  let signal: Signal
  let reason: string

  if (sentiment === 'positive' && sentNorm > 0.2 && impactNorm > 0.3) {
    signal = 'buy'
    reason = `Positive news with ${importance} importance. ${articleTitle.slice(0, 80)}`
  } else if (sentiment === 'negative' && sentNorm < -0.2 && impactNorm > 0.3) {
    signal = 'avoid'
    reason = `Negative news with ${importance} importance. ${articleTitle.slice(0, 80)}`
  } else {
    signal = 'watch'
    reason = `Neutral or mixed signals. Monitor closely. ${articleTitle.slice(0, 80)}`
  }

  return { signal, confidence: Math.min(confidence, 0.95), reason }
}