import { describe, expect, it } from 'vitest';
import { runInvestigation, shouldContinue } from './graph.js';
import { defaultState } from './state.js';

describe('graph orchestration', () => {
  it('enforces the max iteration guard before looping forever', () => {
    const state = {
      ...defaultState,
      confidence: 0.2,
      iteration: 3,
      maxIterations: 3,
      events: [],
    };

    expect(shouldContinue(state)).toBe('finalize');
  });

  it('records workflow events as structured metadata', async () => {
    const result = await runInvestigation('Why is API latency increasing?');

    expect(Array.isArray(result.events)).toBe(true);
    expect(result.events[0]).toMatchObject({
      type: 'node_completed',
      node: expect.any(String),
      timestamp: expect.any(String),
      message: expect.any(String),
    });
  });
});
