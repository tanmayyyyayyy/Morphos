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
  question: string;
  interpretedProblem: string;
  hypotheses: Hypothesis[];
  selectedHypothesis: Hypothesis | null;
  experiment: Experiment | null;
  experimentResult: Record<string, unknown> | null;
  analysis: string;
  confidence: number;
  iteration: number;
  maxIterations: number;
  events: string[];
  finalConclusion: string;
  status: string;
};

export const defaultState: InvestigationState = {
  question: '',
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
};
