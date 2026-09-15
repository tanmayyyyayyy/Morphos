import { describe, expect, it } from 'vitest';
import { evaluateConfidence } from './evaluateConfidence.js';
import { createEvent, defaultState } from '../state.js';

describe('confidence routing', () => {
  it('returns a high confidence status when metrics indicate strong evidence', () => {
    const state = {
      ...defaultState,
      experimentResult: { metrics: { databaseLatency: 80, cpuUtilization: 75, memoryUsage: 60 } },
      iteration: 1,
      confidence: 0,
      status: 'experiment_running',
      events: [createEvent('evaluateConfidence', 'Running experiment')],
    };

    const result = evaluateConfidence(state);
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.status).toBe('confidence_high');
  });

  it('keeps the investigation active when evidence is weak', () => {
    const state = {
      ...defaultState,
      experimentResult: { metrics: { databaseLatency: 20, cpuUtilization: 15, memoryUsage: 10 } },
      iteration: 1,
      confidence: 0,
      status: 'experiment_running',
      events: [createEvent('evaluateConfidence', 'Running experiment')],
    };

    const result = evaluateConfidence(state);
    expect(result.status).toBe('confidence_low');
  });
});
