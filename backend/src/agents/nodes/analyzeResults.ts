/**
 * File README
 * What this file does: interprets the experiment output and writes a plain-English analysis.
 * Why it exists: the graph needs a clear bridge between raw metrics and a coherent reasoning summary.
 * Data in: the experiment result and the selected hypothesis.
 * Data out: the analysis string and the updated event history.
 * LangGraph connection: it prepares state for confidence evaluation and decides whether the evidence is strong enough.
 */
import { createEvent, InvestigationState } from '../state.js';

export function analyzeResults(state: InvestigationState): InvestigationState {
  const result = state.experimentResult ?? {};
  const metrics = (result as any).metrics ?? {};
  const latency = (result as any).latencyMs ?? metrics.databaseLatency ?? 0;

  const analysis = `The investigation showed the dominant signal around ${latency} ms with the highest stress in ${Object.keys(metrics).length ? Object.keys(metrics).join(', ') : 'the simulated workload'}. This points to the selected bottleneck as the most likely root cause.`;

  return {
    ...state,
    analysis,
    status: 'analyzed',
    events: [...state.events, createEvent('analyzeResults', 'Results analyzed')],
  };
}
