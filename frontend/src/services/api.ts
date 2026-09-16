export type InvestigationEvent = {
  type: 'node_completed' | 'status_changed' | 'error';
  node: string;
  timestamp: string;
  message: string;
};

export type InvestigationResponse = {
  id?: string;
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
  events: InvestigationEvent[];
  finalConclusion: string;
  status: string;
  firebase?: { id?: string };
};

export async function investigate(question: string, authToken: string): Promise<InvestigationResponse> {
  const response = await fetch('http://localhost:4000/api/investigate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error('Investigation request failed');
  }

  return response.json();
}

export async function getInvestigations(authToken: string): Promise<Array<Record<string, unknown>>> {
  const response = await fetch('http://localhost:4000/api/investigations', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Investigation history request failed');
  }
  return response.json();
}

export async function getInvestigationById(id: string, authToken: string): Promise<Record<string, unknown>> {
  const response = await fetch(`http://localhost:4000/api/investigations/${id}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Investigation detail request failed');
  }

  return response.json();
}

export async function getAnalytics(authToken: string): Promise<Record<string, unknown>> {
  const response = await fetch('http://localhost:4000/api/analytics', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Analytics request failed');
  }

  return response.json();
}

export async function deleteInvestigation(id: string, authToken: string): Promise<{ success: boolean; deletedId: string }> {
  const response = await fetch(`http://localhost:4000/api/investigations/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Investigation deletion failed');
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
