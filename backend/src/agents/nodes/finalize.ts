import { InvestigationState } from '../state.js';

export function finalize(state: InvestigationState): InvestigationState {
  const rootCause = state.selectedHypothesis?.title ?? 'primary bottleneck';
  const evidence = state.selectedHypothesis?.evidence?.join('; ') ?? 'simulated system indicators';
  const resultSummary = state.experimentResult ? JSON.stringify(state.experimentResult) : 'No data available';

  const conclusion = `Most likely root cause: ${rootCause}. Evidence: ${evidence}. Experiments performed: ${state.experiment?.name ?? 'benchmark'}. Confidence: ${state.confidence}. Recommended next action: validate with real telemetry and inspect the identified bottleneck before scaling.`;

  return {
    ...state,
    finalConclusion: conclusion,
    status: 'finalized',
    events: [...state.events, 'Final conclusion generated'],
  };
}
