/**
 * File README
 * What this file does: scores evidence and distinguishes between hypothesis plausibility and experimentally supported confidence.
 * Why it exists: without this gate, investigations without valid experimental results can receive unjustifiably high confidence.
 * Data in: the experiment metrics, hypothesis metadata, and current iteration count.
 * Data out: confidence, hypothesisConfidence, evidenceConfidence, verificationStatus, status, and event history.
 * LangGraph connection: it is the branching point between a final conclusion and another loop through generateHypotheses.
 */
import { createEvent, InvestigationState, VerificationStatus } from '../state.js';

export function evaluateConfidence(state: InvestigationState): InvestigationState {
  const hypothesisConfidence = state.selectedHypothesis?.confidence ?? 0;

  // Check whether experiments were actually executed and valid experimental results are available
  const hasExecutedResult =
    state.experimentResult !== null &&
    state.experimentResult !== undefined &&
    typeof state.experimentResult === 'object' &&
    !Array.isArray(state.experimentResult) &&
    state.status !== 'experiment_skipped' &&
    state.resultStatus !== 'no_matching_template';

  let numericValues: number[] = [];

  if (hasExecutedResult) {
    const resObj = state.experimentResult as Record<string, unknown>;
    // Check for explicit failure or error payload
    const isError = Boolean(resObj.error) || resObj.ok === false;

    if (!isError) {
      const metrics = resObj.metrics;
      if (metrics && typeof metrics === 'object' && !Array.isArray(metrics)) {
        numericValues = Object.values(metrics)
          .map((value) => (typeof value === 'number' ? value : Number(value)))
          .filter((value) => typeof value === 'number' && !isNaN(value) && isFinite(value));
      }

      // Fallback for tools (e.g. benchmark_tool) that return top-level numeric metrics
      if (numericValues.length === 0) {
        const candidateKeys = ['latencyMs', 'throughputRps', 'latency', 'throughput', 'durationMs', 'score'];
        for (const key of candidateKeys) {
          const val = resObj[key];
          if (typeof val === 'number' && !isNaN(val) && isFinite(val) && val > 0) {
            numericValues.push(val);
          }
        }
      }
    }
  }

  // If no valid experimental results are available, the hypothesis remains unverified
  if (numericValues.length === 0) {
    const verificationStatus: VerificationStatus = 'unverified';
    return {
      ...state,
      confidence: 0,
      hypothesisConfidence,
      evidenceConfidence: null,
      verificationStatus,
      iteration: state.iteration + 1,
      status: 'confidence_low',
      events: [
        ...state.events,
        createEvent('evaluateConfidence', 'No valid experimental evidence available; hypothesis remains unverified'),
      ],
    };
  }

  // Calculate evidence-based confidence from experimental results
  const meanValue = numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
  const signalStrength = Math.min(1, meanValue / 100);
  const score = Math.min(0.99, 0.25 + signalStrength * 0.85);
  const evidenceConfidence = Number(score.toFixed(2));

  const isValidated = evidenceConfidence >= 0.7;
  const verificationStatus: VerificationStatus = isValidated ? 'validated' : 'inconclusive';
  const nextStatus = isValidated ? 'confidence_high' : 'confidence_low';

  return {
    ...state,
    confidence: evidenceConfidence,
    hypothesisConfidence,
    evidenceConfidence,
    verificationStatus,
    iteration: state.iteration + 1,
    status: nextStatus,
    events: [
      ...state.events,
      createEvent(
        'evaluateConfidence',
        isValidated ? 'Confidence high enough to finalize' : 'Confidence insufficient; continue investigating',
      ),
    ],
  };
}
