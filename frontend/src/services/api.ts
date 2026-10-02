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

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
while (API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export async function investigate(question: string, authToken: string): Promise<InvestigationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/investigate`, {
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
  const response = await fetch(`${API_BASE_URL}/api/investigations`, {
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
  const response = await fetch(`${API_BASE_URL}/api/investigations/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/analytics`, {
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
  const response = await fetch(`${API_BASE_URL}/api/investigations/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}
