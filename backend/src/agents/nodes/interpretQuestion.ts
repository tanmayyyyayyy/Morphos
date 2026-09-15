/**
 * File README
 * What this file does: converts a natural-language user question into a structured investigation framing.
 * Why it exists: the workflow needs a clear problem definition before it can generate meaningful hypotheses.
 * Data in: the raw question string from the API request.
 * Data out: the interpretedProblem field plus the updated event history.
 * LangGraph connection: this is the first node after START and feeds directly into hypothesis generation.
 */
import { createEvent, InvestigationState } from '../state.js';

export function interpretQuestion(state: InvestigationState): InvestigationState {
  const question = state.question.trim();
  const normalized = question.toLowerCase();

  const problemMap = [
    { keyword: 'latency', pattern: 'Investigating API latency and request performance under rising demand.' },
    { keyword: 'database', pattern: 'Investigating database throughput and query latency as load increases.' },
    { keyword: 'memory', pattern: 'Investigating memory growth and retention patterns over time.' },
    { keyword: 'dataset', pattern: 'Investigating scaling behavior and computational cost as dataset size increases.' },
  ];

  const interpretedProblem =
    problemMap.find((entry) => normalized.includes(entry.keyword))?.pattern ??
    'Investigating the underlying performance bottleneck described by the user question.';

  return {
    ...state,
    interpretedProblem,
    status: 'interpreted',
    events: [...state.events, createEvent('interpretQuestion', 'Question interpreted')],
  };
}
