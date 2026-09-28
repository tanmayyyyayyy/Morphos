export type InvestigationEvent = {
  type: 'node_completed' | 'status_changed' | 'error';
  node: string;
  timestamp: string;
  message: string;
};

export type Hypothesis = {
  id?: string;
  title: string;
  rationale: string;
  confidence: number;
  evidence: string[];
};

export type Experiment = {
  id?: string;
  name: string;
  description: string;
  tool: string;
  inputs?: Record<string, unknown>;
};

export type InvestigationResponse = {
  id?: string;
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
  events: InvestigationEvent[];
  finalConclusion: string;
  status: string;
  firebase?: { id?: string };
};

export type InvestigationRecord = Record<string, unknown> & {
  id?: string;
  question?: string;
  status?: string;
  confidence?: number;
  createdAt?: string;
  updatedAt?: string;
  iteration?: number;
  maxIterations?: number;
  finalConclusion?: string;
  interpretedProblem?: string;
  analysis?: string;
  selectedHypothesis?: Hypothesis | null;
  hypotheses?: Hypothesis[];
  experiment?: Experiment | null;
  experimentResult?: Record<string, unknown> | null;
  events?: Array<Record<string, unknown>>;
  userId?: string;
};

export type AnalyticsState = {
  totalInvestigations: number;
  completedInvestigations: number;
  averageConfidence: number;
  averageIterations: number;
  totalExperiments: number;
  completionRate: number;
  confidenceDistribution: { high: number; medium: number; low: number };
  experimentOutcomes: { completed: number; failed: number; running: number };
  investigationsOverTime: Array<{ date: string; count: number }>;
  iterationsPerInvestigation: Array<{ label: string; iterations: number }>;
};

export type ViewId = 'overview' | 'investigations' | 'experiments' | 'insights' | 'analytics' | 'profile';
