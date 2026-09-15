import { InvestigationState } from '../state.js';

export function evaluateConfidence(state: InvestigationState): InvestigationState {
  const result = state.experimentResult as Record<string, unknown> | null;
  const metrics = (result as { metrics?: Record<string, number> } | null)?.metrics ?? {};
  const numericValues = Object.values(metrics).map((value) => Number(value || 0));
  const meanValue = numericValues.length ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length : 0;
  const signalStrength = Math.min(1, meanValue / 100);
  const score = Math.min(0.99, 0.25 + signalStrength * 0.85);

  return {
    ...state,
    confidence: Number(score.toFixed(2)),
    iteration: state.iteration + 1,
    status: score >= 0.7 ? 'confidence_high' : 'confidence_low',
    events: [...state.events, score >= 0.7 ? 'Confidence high enough to finalize' : 'Confidence insufficient; continue investigating'],
  };
}
