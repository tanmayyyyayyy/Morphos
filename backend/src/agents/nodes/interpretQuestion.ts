/**
 * File README
 * What this file does: converts a natural-language user question into a structured investigation framing.
 * Why it exists: the workflow needs a clear problem definition before it can generate meaningful hypotheses.
 * Data in: the raw question string from the API request.
 * Data out: the interpretedProblem field plus the updated event history.
 * LangGraph connection: this is the first node after START and feeds directly into hypothesis generation.
 */
import { createEvent, InvestigationState } from '../state.js';
import { classifyDomain } from '../domain.js';

export function interpretQuestion(state: InvestigationState): InvestigationState {
  const { domain, interpretedProblem } = classifyDomain(state.question);

  return {
    ...state,
    domain,
    interpretedProblem,
    status: 'interpreted',
    events: [...state.events, createEvent('interpretQuestion', `Question interpreted for domain: ${domain}`)],
  };
}
