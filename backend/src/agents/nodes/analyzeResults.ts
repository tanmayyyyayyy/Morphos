import { InvestigationState } from '../state.js';

export function analyzeResults(state: InvestigationState): InvestigationState {
  const result = state.experimentResult ?? {};
  const metrics = (result as any).metrics ?? {};
  const latency = (result as any).latencyMs ?? metrics.databaseLatency ?? 0;

  const analysis = `The investigation showed the dominant signal around ${latency} ms with the highest stress in ${Object.keys(metrics).length ? Object.keys(metrics).join(', ') : 'the simulated workload'}. This points to the selected bottleneck as the most likely root cause.`;

  return {
    ...state,
    analysis,
    status: 'analyzed',
    events: [...state.events, 'Results analyzed'],
  };
}
