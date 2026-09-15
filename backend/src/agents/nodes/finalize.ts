/**
 * File README
 * What this file does: turns the entire workflow into a final explanation suitable for the frontend and API response.
 * Why it exists: the end user needs a crisp summary with evidence, confidence, and next steps.
 * Data in: the chosen hypothesis, experiment metadata, confidence, and result summary.
 * Data out: finalConclusion and the finalized status.
 * LangGraph connection: it is the terminal node reached when the confidence gate decides the investigation is complete.
 */
import { createEvent, InvestigationState } from '../state.js';

export function finalize(state: InvestigationState): InvestigationState {
  const rootCause = state.selectedHypothesis?.title ?? 'primary bottleneck';
  const evidence = state.selectedHypothesis?.evidence?.join('; ') ?? 'simulated system indicators';
  const resultSummary = state.experimentResult ? JSON.stringify(state.experimentResult) : 'No data available';

  const conclusion = `Most likely root cause: ${rootCause}. Evidence: ${evidence}. Experiments performed: ${state.experiment?.name ?? 'benchmark'}. Confidence: ${state.confidence}. Recommended next action: validate with real telemetry and inspect the identified bottleneck before scaling.`;

  return {
    ...state,
    finalConclusion: conclusion,
    status: 'finalized',
    events: [...state.events, createEvent('finalize', 'Final conclusion generated')],
  };
}
