export type InvestigationResponse = {
  question: string;
  interpretedProblem: string;
  hypotheses: Array<{ id: string; title: string; rationale: string; confidence: number; evidence: string[] }>;
  selectedHypothesis: { id: string; title: string; rationale: string; confidence: number; evidence: string[] } | null;
  experiment: { id: string; name: string; description: string; tool: string; inputs: Record<string, unknown> } | null;
  experimentResult: Record<string, unknown> | null;
  analysis: string;
  confidence: number;
  iteration: number;
  maxIterations: number;
  events: string[];
  finalConclusion: string;
  status: string;
};

export async function investigate(question: string): Promise<InvestigationResponse> {
  const response = await fetch('http://localhost:4000/api/investigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error('Investigation request failed');
  }

  return response.json();
}

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch('http://localhost:4000/api/health');
  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}
