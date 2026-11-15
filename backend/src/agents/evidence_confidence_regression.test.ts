import { describe, expect, it } from 'vitest';
import { runInvestigation, shouldContinue } from './graph.js';
import { evaluateConfidence } from './nodes/evaluateConfidence.js';
import { finalize } from './nodes/finalize.js';
import { createEvent, createFreshState, defaultState, InvestigationState } from './state.js';

describe('Evidence-Based Confidence Evaluation & Verification Status Regression Suite', () => {
  // Scenario 1: The reported ml_model_performance bug
  describe('Scenario 1: Reported ml_model_performance bug', () => {
    it('does not assign 0.72 evidence confidence when experiment result is null', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'ml_model_performance',
        resultStatus: 'no_matching_template',
        status: 'experiment_skipped',
        experiment: null,
        experimentResult: null,
        selectedHypothesis: {
          id: 'ml-1',
          title: 'Overfitting and poor generalization',
          rationale: 'As dataset size increases, model capacity or regularization may fail.',
          confidence: 0.72,
          evidence: ['Candidate hypothesis: Validation error diverging from training loss'],
        },
      };

      const evaluated = evaluateConfidence(state);

      // Must NOT be considered experimentally validated
      expect(evaluated.verificationStatus).toBe('unverified');
      // Evidence-based confidence must be 0, NOT 0.72
      expect(evaluated.confidence).toBe(0);
      expect(evaluated.evidenceConfidence).toBeNull();
      // Theoretical hypothesis confidence must be preserved
      expect(evaluated.hypothesisConfidence).toBe(0.72);
      expect(evaluated.status).toBe('confidence_low');
    });

    it('shouldContinue handles missing experiment results explicitly and does not treat 0.72 as validation', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'ml_model_performance',
        resultStatus: 'no_matching_template',
        status: 'experiment_skipped',
        experiment: null,
        experimentResult: null,
        confidence: 0,
        hypothesisConfidence: 0.72,
        verificationStatus: 'unverified',
      };

      // Routes to finalize because no matching template / experiment available, NOT because continuation threshold was met
      expect(shouldContinue(state)).toBe('finalize');
    });

    it('end-to-end ml_model_performance investigation is marked unverified with 0 evidence confidence', async () => {
      const result = await runInvestigation('Why does model accuracy decrease with dataset size?');

      expect(result.domain).toBe('ml_model_performance');
      expect(result.resultStatus).toBe('no_matching_template');
      expect(result.experiment).toBeNull();
      expect(result.experimentResult).toBeNull();
      expect(result.verificationStatus).toBe('unverified');
      expect(result.confidence).toBe(0);
      expect(result.hypothesisConfidence).toBeGreaterThan(0);
      expect(result.finalConclusion).toContain('Preliminary assessment');
      expect(result.finalConclusion).toContain('No matching experiment was available for this question');
      expect(result.finalConclusion).toContain('these are domain-based hypotheses, not measured findings');
      expect(result.finalConclusion).not.toContain('Most likely root cause:');
    });
  });

  // Scenario 2: No experiment selected
  describe('Scenario 2: No experiment selected', () => {
    it('marks investigation as unverified when no experiment is selected', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        experiment: null,
        experimentResult: null,
        selectedHypothesis: {
          id: 'db-1',
          title: 'Missing indexes',
          rationale: 'Sequential table scans',
          confidence: 0.74,
          evidence: ['Sequential scans observed'],
        },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('unverified');
      expect(evaluated.confidence).toBe(0);
      expect(evaluated.evidenceConfidence).toBeNull();

      const finalized = finalize(evaluated);
      expect(finalized.verificationStatus).toBe('unverified');
      expect(finalized.finalConclusion).toContain('Preliminary assessment');
      expect(finalized.finalConclusion).toContain('No valid experimental results were available');
    });
  });

  // Scenario 3: Experiment selected but not executed
  describe('Scenario 3: Experiment selected but not executed', () => {
    it('remains unverified when experiment was selected but execution skipped or returned null', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'api_latency',
        status: 'experiment_skipped',
        experiment: {
          id: 'exp-latency',
          name: 'Load and bottleneck benchmark',
          description: 'Measure latency',
          tool: 'benchmark_tool',
          inputs: {},
        },
        experimentResult: null,
        selectedHypothesis: {
          id: 'api-1',
          title: 'Concurrency bottleneck',
          rationale: 'Thread contention',
          confidence: 0.75,
          evidence: ['P99 response time climbs'],
        },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('unverified');
      expect(evaluated.confidence).toBe(0);
      expect(evaluated.evidenceConfidence).toBeNull();

      const route = shouldContinue(evaluated);
      expect(route).toBe('finalize');

      const finalized = finalize(evaluated);
      expect(finalized.verificationStatus).toBe('unverified');
      expect(finalized.finalConclusion).toContain('Preliminary assessment');
      expect(finalized.finalConclusion).toContain('No valid experimental results were available');
      expect(finalized.finalConclusion).not.toContain('Most likely root cause:');
    });
  });

  // Scenario 4: Experiment executed with valid results
  describe('Scenario 4: Experiment executed with valid results', () => {
    it('processes actual evidence and validates when evidence meets threshold', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        status: 'experiment_running',
        experiment: {
          id: 'exp-db',
          name: 'Database contention experiment',
          description: 'Simulate DB workload',
          tool: 'mock_data_tool',
          inputs: {},
        },
        experimentResult: {
          metrics: {
            databaseLatency: 85,
            cpuUtilization: 78,
            memoryUsage: 65,
            connectionPoolUsage: 90,
          },
        },
        selectedHypothesis: {
          id: 'db-1',
          title: 'Database connection pool exhaustion',
          rationale: 'Connection starvation',
          confidence: 0.68,
          evidence: ['Connection queue wait times'],
        },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('validated');
      expect(evaluated.confidence).toBeGreaterThanOrEqual(0.7);
      expect(evaluated.evidenceConfidence).toBe(evaluated.confidence);
      expect(evaluated.status).toBe('confidence_high');

      const route = shouldContinue(evaluated);
      expect(route).toBe('finalize');

      const finalized = finalize(evaluated);
      expect(finalized.verificationStatus).toBe('validated');
      expect(finalized.finalConclusion).toContain('Most likely root cause: Database connection pool exhaustion');
      expect(finalized.finalConclusion).toContain('Confidence:');
    });
  });

  // Scenario 5: Experiment executed but results are inconclusive
  describe('Scenario 5: Experiment executed but results are inconclusive', () => {
    it('does not mark investigation as validated when evidence metrics are weak', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        status: 'experiment_running',
        iteration: 1,
        maxIterations: 3,
        experiment: {
          id: 'exp-db',
          name: 'Database contention experiment',
          description: 'Simulate DB workload',
          tool: 'mock_data_tool',
          inputs: {},
        },
        experimentResult: {
          metrics: {
            databaseLatency: 15,
            cpuUtilization: 10,
            memoryUsage: 12,
          },
        },
        selectedHypothesis: {
          id: 'db-1',
          title: 'Database connection pool exhaustion',
          rationale: 'Connection starvation',
          confidence: 0.68,
          evidence: ['Connection queue wait times'],
        },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('inconclusive');
      expect(evaluated.confidence).toBeLessThan(0.7);
      expect(evaluated.status).toBe('confidence_low');

      // Graph should continue iterating when iteration < maxIterations
      const route = shouldContinue(evaluated);
      expect(route).toBe('generate_hypotheses');

      // When finalized at maxIterations, conclusion reports inconclusive finding, not validated
      const maxIterState = { ...evaluated, iteration: 3 };
      expect(shouldContinue(maxIterState)).toBe('finalize');

      const finalized = finalize(maxIterState);
      expect(finalized.verificationStatus).toBe('inconclusive');
      expect(finalized.finalConclusion).toContain('Inconclusive finding');
      expect(finalized.finalConclusion).toContain('Experimental evidence was inconclusive');
      expect(finalized.finalConclusion).not.toContain('Most likely root cause:');
    });
  });

  // Scenario 6: Missing or malformed experiment results
  describe('Scenario 6: Missing or malformed experiment results', () => {
    it('safely handles empty object as unverified without unjustified confidence', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        experiment: { id: 'exp-1', name: 'Test', description: 'Test', tool: 'test', inputs: {} },
        experimentResult: {},
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('unverified');
      expect(evaluated.confidence).toBe(0);
      expect(evaluated.evidenceConfidence).toBeNull();
    });

    it('safely handles empty metrics object as unverified', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        experiment: { id: 'exp-1', name: 'Test', description: 'Test', tool: 'test', inputs: {} },
        experimentResult: { metrics: {} },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('unverified');
      expect(evaluated.confidence).toBe(0);
    });

    it('safely handles non-numeric metrics without generating confidence', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        experiment: { id: 'exp-1', name: 'Test', description: 'Test', tool: 'test', inputs: {} },
        experimentResult: { metrics: { errorRate: 'unknown' as unknown as number, latency: NaN } },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('unverified');
      expect(evaluated.confidence).toBe(0);
    });

    it('safely handles tool error payloads without generating confidence', () => {
      const state: InvestigationState = {
        ...defaultState,
        domain: 'database',
        experiment: { id: 'exp-1', name: 'Test', description: 'Test', tool: 'test', inputs: {} },
        experimentResult: { ok: false, error: 'Connection to database agent timed out' },
      };

      const evaluated = evaluateConfidence(state);
      expect(evaluated.verificationStatus).toBe('unverified');
      expect(evaluated.confidence).toBe(0);
      expect(evaluated.evidenceConfidence).toBeNull();
    });
  });

  // Scenario 7: Existing valid investigation workflow
  describe('Scenario 7: Existing valid investigation workflow', () => {
    it('runs a complete database investigation with valid simulated telemetry', async () => {
      const result = await runInvestigation('Why are database queries getting slower?');

      expect(result.domain).toBe('database');
      expect(result.experiment).not.toBeNull();
      expect(result.experimentResult).not.toBeNull();
      expect(result.verificationStatus).toBe('validated');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.status).toBe('finalized');
      expect(result.finalConclusion).toContain('Most likely root cause:');
    });

    it('runs a complete API latency investigation with benchmark tool', async () => {
      const result = await runInvestigation('Why is API latency increasing?');

      expect(result.domain).toBe('api_latency');
      expect(result.experiment).not.toBeNull();
      expect(result.experimentResult).not.toBeNull();
      expect(result.status).toBe('finalized');
      expect(result.finalConclusion).toBeTruthy();
      expect(result.events.length).toBeGreaterThan(0);
    });
  });
});
