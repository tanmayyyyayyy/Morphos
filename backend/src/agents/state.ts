/**
 * File README
 * What this file does: defines the shared state for the MORPHOS agent workflow.
 * Why it exists: every LangGraph node reads and writes the same investigation structure so the loop stays consistent.
 * Data in: the user's question plus intermediate findings, selected hypotheses, experiments, results, and status.
 * Data out: a fully typed state object that the workflow can pass between nodes.
 * LangGraph connection: this is the state contract used by the graph and each node that mutates the workflow.
 */
export type InvestigationDomain =
  | 'ml_model_performance'
  | 'api_latency'
  | 'memory'
  | 'database'
  | 'general';

export type ResultStatus = 'real' | 'simulated' | 'no_matching_template';

export type WorkflowEvent = {
  type: 'node_completed' | 'status_changed' | 'error';
  node: string;
  timestamp: string;
  message: string;
};

export type Hypothesis = {
  id: string;
  title: string;
  rationale: string;
  confidence: number;
  evidence: string[];
};

export type Experiment = {
  id: string;
  name: string;
  description: string;
  tool: string;
  inputs: Record<string, unknown>;
  result?: Record<string, unknown>;
};

export type InvestigationState = {
  id?: string;
  question: string;
  domain: InvestigationDomain;
  interpretedProblem: string;
  hypotheses: Hypothesis[];
  selectedHypothesis: Hypothesis | null;
  experiment: Experiment | null;
  experimentResult: Record<string, unknown> | null;
  analysis: string;
  confidence: number;
  iteration: number;
  maxIterations: number;
  events: WorkflowEvent[];
  finalConclusion: string;
  status: string;
  resultStatus: ResultStatus;
};

export function createEvent(node: string, message: string, type: WorkflowEvent['type'] = 'node_completed'): WorkflowEvent {
  return {
    type,
    node,
    timestamp: new Date().toISOString(),
    message,
  };
}

export const defaultState: InvestigationState = {
  question: '',
  domain: 'general',
  interpretedProblem: '',
  hypotheses: [],
  selectedHypothesis: null,
  experiment: null,
  experimentResult: null,
  analysis: '',
  confidence: 0,
  iteration: 0,
  maxIterations: 3,
  events: [],
  finalConclusion: '',
  status: 'idle',
  resultStatus: 'simulated',
};

export function createFreshState(question: string, id?: string): InvestigationState {
  return {
    id: id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    question: question.trim(),
    domain: 'general',
    interpretedProblem: '',
    hypotheses: [],
    selectedHypothesis: null,
    experiment: null,
    experimentResult: null,
    analysis: '',
    confidence: 0,
    iteration: 0,
    maxIterations: 3,
    events: [createEvent('graph', 'Investigation started')],
    finalConclusion: '',
    status: 'starting',
    resultStatus: 'simulated',
  };
}

