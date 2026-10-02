import {
  InvestigationDomain,
  InvestigationEvent,
  InvestigationResponse,
  ResultStatus,
} from '../types';

export type { InvestigationDomain, InvestigationEvent, InvestigationResponse, ResultStatus };

export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function investigate(question: string, authToken: string): Promise<InvestigationResponse> {
  const response = await fetch(`${API_BASE}/api/investigate`, {
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
  const response = await fetch(`${API_BASE}/api/investigations`, {
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
  const response = await fetch(`${API_BASE}/api/investigations/${id}`, {
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
  const response = await fetch(`${API_BASE}/api/analytics`, {
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
  const response = await fetch(`${API_BASE}/api/investigations/${id}`, {
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
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}
