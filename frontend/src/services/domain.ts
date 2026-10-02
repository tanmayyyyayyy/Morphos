import {
  Hypothesis,
  InvestigationDomain,
  InvestigationRecord,
  ResultStatus,
} from '../types';

export interface DomainInterpretation {
  domain: InvestigationDomain;
  interpretedProblem: string;
}

export function classifyDomain(question: string): DomainInterpretation {
  const q = question.trim().toLowerCase();

  // 1. ML Model Performance (Must be checked before dataset keywords)
  const isMlQuestion =
    /accuracy/i.test(q) ||
    /model/i.test(q) ||
    /overfitting|underfitting|generalization/i.test(q) ||
    /label noise|ground truth/i.test(q) ||
    /distribution shift|covariate shift/i.test(q) ||
    /precision|recall|f1-score/i.test(q) ||
    /training loss|validation loss/i.test(q) ||
    (q.includes('dataset') && (q.includes('accuracy') || q.includes('model') || q.includes('learn') || q.includes('predict')));

  if (isMlQuestion) {
    return {
      domain: 'ml_model_performance',
      interpretedProblem: 'Investigating model generalization, data quality, and learning dynamics as training data scales.',
    };
  }

  // 2. Memory
  const isMemoryQuestion =
    /memory/i.test(q) ||
    /heap/i.test(q) ||
    /ram/i.test(q) ||
    /leak/i.test(q) ||
    /oom|out of memory/i.test(q) ||
    /garbage collection|\bgc\b/i.test(q) ||
    /retention/i.test(q);

  if (isMemoryQuestion) {
    return {
      domain: 'memory',
      interpretedProblem: 'Investigating memory allocation, object retention, and heap consumption patterns over time.',
    };
  }

  // 3. Database
  const isDatabaseQuestion =
    /database/i.test(q) ||
    /query|queries/i.test(q) ||
    /sql|postgres|mysql/i.test(q) ||
    /connection pool/i.test(q) ||
    /lock contention/i.test(q) ||
    /index(es|ing)?\b/i.test(q) ||
    (q.includes('throughput') && q.includes('load'));

  if (isDatabaseQuestion) {
    return {
      domain: 'database',
      interpretedProblem: 'Investigating database query execution plans, connection pooling, and storage contention.',
    };
  }

  // 4. API Latency
  const isLatencyQuestion =
    /latency/i.test(q) ||
    /\bapi\b/i.test(q) ||
    /response time/i.test(q) ||
    /p99|p95/i.test(q) ||
    /slowdown|slow response/i.test(q) ||
    /endpoint/i.test(q) ||
    /request processing/i.test(q) ||
    /timeout/i.test(q);

  if (isLatencyQuestion) {
    return {
      domain: 'api_latency',
      interpretedProblem: 'Investigating API request processing latency and concurrency bottlenecks under load.',
    };
  }

  // 5. General / System Performance (e.g. CPU)
  if (/cpu|thread|compute|worker/i.test(q)) {
    return {
      domain: 'general',
      interpretedProblem: 'Investigating CPU compute utilization, thread scheduling, and worker saturation.',
    };
  }

  return {
    domain: 'general',
    interpretedProblem: 'Investigating system behavior and potential performance bottlenecks under workload.',
  };
}

export const DOMAIN_HYPOTHESES: Record<InvestigationDomain, Hypothesis[]> = {
  ml_model_performance: [
    {
      id: 'ml-1',
      title: 'Overfitting and poor generalization',
      rationale: 'As dataset size or complexity increases, model capacity or regularization may fail to generalize effectively across broader feature distributions.',
      confidence: 0.72,
      evidence: [
        'Candidate hypothesis: Validation error diverging from training loss as data scales',
        'Candidate hypothesis: Model struggling to generalize to newly introduced edge cases in larger data',
      ],
    },
    {
      id: 'ml-2',
      title: 'Data quality issues or label noise in added data',
      rationale: 'Scaling data collection often introduces noisy annotations, ambiguous classes, or conflicting ground truth labels that degrade model performance.',
      confidence: 0.65,
      evidence: [
        'Candidate hypothesis: Added samples carrying higher inter-annotator disagreement or label ambiguity',
        'Candidate hypothesis: Subsets with automated or scraped labels exhibiting higher residual noise',
      ],
    },
    {
      id: 'ml-3',
      title: 'Distribution shift between training and evaluation splits',
      rationale: 'Additional training data may introduce covariate or concept drift that differs from the target test distribution.',
      confidence: 0.58,
      evidence: [
        'Candidate hypothesis: Input feature distributions diverging between initial and extended datasets',
        'Candidate hypothesis: Performance drop concentrating in specific newly introduced sub-populations',
      ],
    },
    {
      id: 'ml-4',
      title: 'Insufficient model capacity or improper regularization',
      rationale: 'A model with limited parameter capacity cannot capture the richer multi-modal patterns present in larger datasets without underfitting.',
      confidence: 0.44,
      evidence: [
        'Candidate hypothesis: Model capacity reaching an expressive bottleneck as sample diversity grows',
        'Candidate hypothesis: Inadequate regularization failing to constrain high-dimensional parameter search',
      ],
    },
  ],

  api_latency: [
    {
      id: 'api-1',
      title: 'Increased request processing time under concurrency',
      rationale: 'As concurrent client requests increase, worker execution queues and thread contention introduce request queue wait latency.',
      confidence: 0.75,
      evidence: [
        'P99 response time climbs proportionally with simultaneous client connection count',
        'Request wait queue duration exceeds actual execution time under peak load',
      ],
    },
    {
      id: 'api-2',
      title: 'Downstream dependency or network latency',
      rationale: 'Upstream services or third-party gateways introduce cascading round-trip delays that block API workers.',
      confidence: 0.54,
      evidence: [
        'Downstream RPC and HTTP call durations account for over 60% of total response time',
        'Network socket wait times increase during peak external traffic',
      ],
    },
    {
      id: 'api-3',
      title: 'Worker thread pool saturation',
      rationale: 'Fixed worker pool sizes force incoming connections into backlog queues before execution begins.',
      confidence: 0.45,
      evidence: [
        'Active worker threads reach 100% capacity during elevated concurrency',
        'Queue wait backlog spikes while raw server CPU remains within normal thresholds',
      ],
    },
  ],

  memory: [
    {
      id: 'mem-1',
      title: 'Retained objects or memory leak in request handling',
      rationale: 'References to completed request payloads, buffers, or unclosed event listeners remain allocated in the heap.',
      confidence: 0.78,
      evidence: [
        'Heap usage climbs monotonically over repeated request cycles without returning to baseline',
        'Major garbage collection cycles fail to reclaim retained object references',
      ],
    },
    {
      id: 'mem-2',
      title: 'Unbounded in-memory caching',
      rationale: 'Application cache layers accumulate entries without strict size bounds, TTL expiration, or LRU eviction.',
      confidence: 0.55,
      evidence: [
        'Memory growth correlates directly with accumulated cache key count',
        'Cache footprint expands until process approaches memory limits',
      ],
    },
    {
      id: 'mem-3',
      title: 'Background task accumulation without cleanup',
      rationale: 'Asynchronous intervals, deferred promises, or worker timers accumulate unhandled state in memory.',
      confidence: 0.42,
      evidence: [
        'Active event loop task counts rise steadily during extended uptime',
        'Resident set size (RSS) continues growing even during periods of zero traffic',
      ],
    },
  ],

  database: [
    {
      id: 'db-1',
      title: 'Inefficient query execution or missing indexes',
      rationale: 'Full table scans and suboptimal query execution plans degrade database latency as row counts scale.',
      confidence: 0.74,
      evidence: [
        'Database query execution plans indicate sequential table scans on filtered columns',
        'I/O read volume and query duration scale superlinearly with table record size',
      ],
    },
    {
      id: 'db-2',
      title: 'Database connection pool exhaustion',
      rationale: 'Concurrent client queries exceed available pool connections, causing connection starvation and thread wait queues.',
      confidence: 0.68,
      evidence: [
        'Active database connections reach maximum configured pool limit',
        'Client connection acquisition wait time dominates total database round-trip duration',
      ],
    },
    {
      id: 'db-3',
      title: 'Lock contention under concurrent write transactions',
      rationale: 'Overlapping transactional write locks block worker threads awaiting row or table-level lock release.',
      confidence: 0.48,
      evidence: [
        'Row lock wait durations increase sharply during concurrent batch updates',
        'Transaction rollback and retry rates spike under elevated write concurrency',
      ],
    },
  ],

  general: [
    {
      id: 'gen-1',
      title: 'Compute resource starvation under peak workload',
      rationale: 'System CPU compute or execution thread capacity is exceeded by peak operational demand.',
      confidence: 0.65,
      evidence: [
        'CPU utilization approaches saturation limits during peak operational windows',
        'Task execution queue latency increases as available compute cycles saturate',
      ],
    },
    {
      id: 'gen-2',
      title: 'Inefficient processing pipeline or serialization bottleneck',
      rationale: 'Sequential operations or unoptimized JSON serialization limit overall execution throughput.',
      confidence: 0.50,
      evidence: [
        'Processing time scales disproportionately with payload size',
        'Worker throughput reaches an artificial processing bottleneck',
      ],
    },
    {
      id: 'gen-3',
      title: 'Unbounded queue growth under backpressure',
      rationale: 'Incoming work arrival rates outpace processing capacity, creating an escalating backlog.',
      confidence: 0.45,
      evidence: [
        'Job queue depth rises continuously under sustained workload',
        'End-to-end task turnaround time degrades as queue delay increases',
      ],
    },
  ],
};

export interface DomainInsights {
  plainEnglishAnswer: string;
  whatThisMeans: string;
  evidence: string[];
  recommendedActions: string[];
}

export function getDomainInsights(
  domain: InvestigationDomain,
  selectedHypothesisTitle?: string,
): DomainInsights {
  switch (domain) {
    case 'ml_model_performance':
      return {
        plainEnglishAnswer:
          'Possible causes include overfitting, noisy labels, distribution shift, or insufficient regularization.',
        whatThisMeans:
          'This reflects the reasoning based on the question, not measured experiment evidence. No matching experiment was executed.',
        evidence: [
          'No matching experiment was available for this question.',
          'These are domain-based hypotheses, not measured findings.',
          'Validate them with real model training and evaluation data.',
        ],
        recommendedActions: [
          'Audit new dataset samples for label noise, corrupted inputs, or ambiguous ground truth.',
          'Evaluate validation loss on original and newly added data partitions.',
          'Experiment with higher model capacity or adjusted regularization techniques.',
        ],
      };

    case 'api_latency':
      return {
        plainEnglishAnswer:
          'API response times are slowing down because worker threads are queued waiting under high request concurrency.',
        whatThisMeans:
          'Incoming client requests arrive faster than execution workers can process them, creating wait backlogs.',
        evidence: [
          'Response latency scales up as client concurrency climbs.',
          'Worker thread execution queues show accumulating backlog.',
          'Downstream service calls introduce cascading request delays.',
        ],
        recommendedActions: [
          'Increase worker thread pool size or enable horizontal request scaling.',
          'Introduce caching for hot API endpoints to reduce repeated computation.',
          'Audit and set strict timeouts on downstream microservice dependencies.',
        ],
      };

    case 'memory':
      return {
        plainEnglishAnswer:
          'Memory consumption is climbing continuously due to retained object references or unevicted cache growth.',
        whatThisMeans:
          'The system allocates memory for incoming tasks but fails to release all of it after completion.',
        evidence: [
          'Heap utilization rises monotonically over time without returning to baseline.',
          'Garbage collection cycles cannot reclaim long-lived allocated objects.',
          'Memory growth continues even during sustained or idle throughput.',
        ],
        recommendedActions: [
          'Take heap snapshots before and after request bursts to identify retaining roots.',
          'Configure explicit maximum size bounds and TTL eviction policies on caches.',
          'Verify that background intervals, timers, and event listeners are properly disposed.',
        ],
      };

    case 'database':
      return {
        plainEnglishAnswer:
          'Database operations are slowing down due to unindexed query scans and connection pool contention.',
        whatThisMeans:
          'Queries take longer to execute, while available database connections are tied up waiting.',
        evidence: [
          'Slow queries are performing sequential table scans on unindexed columns.',
          'Connection pool usage climbs close to maximum capacity under peak queries.',
          'Row lock wait times increase when concurrent write transactions conflict.',
        ],
        recommendedActions: [
          'Inspect slow query logs and add composite indexes for frequent filter clauses.',
          'Tune database connection pool limits or introduce connection multiplexing.',
          'Optimize transaction boundaries to minimize lock hold durations.',
        ],
      };

    case 'general':
    default:
      return {
        plainEnglishAnswer:
          'System throughput is bottlenecked by resource limits and processing contention under peak load.',
        whatThisMeans:
          'The current workload exceeds the capacity of one or more critical pipeline components.',
        evidence: [
          'Operational metrics indicate resource saturation during peak demand.',
          'Work queue backlog expands as arrival rates exceed worker processing rates.',
          'Latency degradation correlates with rising operational volume.',
        ],
        recommendedActions: [
          'Profile system bottlenecks during peak demand periods.',
          'Scale bottlenecked worker nodes or decouple queues with backpressure.',
          'Implement rate limiting and workload throttling for burst protection.',
        ],
      };
  }
}

/**
 * Generates an isolated, domain-aware investigation record for local/guest or fallback runs.
 * NEVER spreads DEMO_INVESTIGATION_DATA.
 */
export function generateDomainInvestigation(
  question: string,
  id?: string,
  isGuest = true,
): InvestigationRecord {
  const { domain, interpretedProblem } = classifyDomain(question);
  const hypotheses = [...(DOMAIN_HYPOTHESES[domain] ?? DOMAIN_HYPOTHESES.general)];
  const selectedHypothesis = hypotheses[0];
  const insights = getDomainInsights(domain, selectedHypothesis.title);
  const invId = id || `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const isMl = domain === 'ml_model_performance';
  const resultStatus: ResultStatus = isMl ? 'no_matching_template' : 'simulated';

  let experiment = null;
  let experimentResult = null;

  if (domain === 'api_latency') {
    experiment = {
      id: `exp-${Date.now()}`,
      name: 'Load and concurrency benchmark',
      tool: 'benchmarkTool',
      description: 'Simulate concurrent HTTP client requests to observe P99 response latency curve.',
      inputs: { concurrency: 50, durationSec: 10, endpoint: '/api/v1/query' },
    };
    experimentResult = {
      metric: 'response_latency_ms',
      baselineP99: 142,
      observedP99: 198,
      deviationPct: '+39.4%',
      activeWorkers: 50,
      workerLimit: 50,
      queueDepth: 218,
      exitCode: 0,
      outcome: 'Response latency elevated by 39.4% under worker pool queue saturation.',
    };
  } else if (domain === 'database') {
    experiment = {
      id: `exp-${Date.now()}`,
      name: 'Database query execution profiling',
      tool: 'mockDataTool',
      description: 'Inspect connection pool utilization and query execution times under concurrent queries.',
      inputs: { scenario: 'database performance' },
    };
    experimentResult = {
      metric: 'database_latency_ms',
      queryLatencyMs: 76,
      connectionPoolUsage: 84,
      cpuUtilization: 61,
      exitCode: 0,
      outcome: 'Database latency elevated to 76ms with pool usage at 84%.',
    };
  } else if (domain === 'memory') {
    experiment = {
      id: `exp-${Date.now()}`,
      name: 'Memory retention analysis',
      tool: 'mockDataTool',
      description: 'Profile heap allocation before and after repeated request batches.',
      inputs: { scenario: 'memory usage' },
    };
    experimentResult = {
      metric: 'heap_used_mb',
      initialHeapMb: 124,
      peakHeapMb: 418,
      retainedHeapMb: 386,
      exitCode: 0,
      outcome: 'Heap size grew from 124MB to 386MB after GC cycle, indicating object retention.',
    };
  } else if (domain === 'general') {
    experiment = {
      id: `exp-${Date.now()}`,
      name: 'System resource benchmark',
      tool: 'benchmarkTool',
      description: 'Profile CPU utilization and thread scheduling queues under peak traffic.',
      inputs: { loadFactor: 8, datasetSize: 10000 },
    };
    experimentResult = {
      metric: 'cpu_utilization_pct',
      cpuUtilization: 88,
      threadWaitMs: 34,
      exitCode: 0,
      outcome: 'CPU utilization reached 88% with worker thread scheduling contention.',
    };
  }

  const finalConclusion = isMl
    ? `Preliminary assessment: Possible causes include overfitting, noisy labels, distribution shift, or insufficient regularization (most likely: ${selectedHypothesis.title}). Evidence: No matching experiment was available for this question; these are domain-based hypotheses, not measured findings. Recommended next action: validate them with real model training and evaluation data.`
    : `Most likely root cause: ${selectedHypothesis.title}. Evidence: ${selectedHypothesis.evidence.join('; ')}. Experiments performed: ${experiment?.name ?? 'simulated benchmark'}. Confidence: ${selectedHypothesis.confidence}. Recommended next action: ${insights.recommendedActions[0]}.`;

  const events = [
    { node: 'interpretQuestion', message: `Question parsed and categorized as ${domain}`, timestamp: now, type: 'node_completed' },
    { node: 'generateHypotheses', message: `Formulated ${hypotheses.length} domain hypotheses`, timestamp: now, type: 'node_completed' },
    { node: 'selectExperiment', message: isMl ? 'Flagged simulated result (no matching physical experiment template)' : `Selected ${experiment?.name}`, timestamp: now, type: 'node_completed' },
    { node: 'executeExperiment', message: isMl ? 'Experiment skipped (simulated domain analysis)' : 'Executed test telemetry sandbox', timestamp: now, type: 'node_completed' },
    { node: 'analyzeResults', message: `Correlated observational signals for ${selectedHypothesis.title}`, timestamp: now, type: 'node_completed' },
    { node: 'evaluateConfidence', message: `Computed confidence score (${Math.round(selectedHypothesis.confidence * 100)}%)`, timestamp: now, type: 'node_completed' },
    { node: 'finalize', message: 'Finalized executive explanation and verified domain relevance', timestamp: now, type: 'node_completed' },
  ];

  return {
    id: invId,
    question: question.trim(),
    domain,
    resultStatus,
    interpretedProblem,
    hypotheses,
    selectedHypothesis,
    experiment,
    experimentResult,
    analysis: `${insights.whatThisMeans} Evidence points directly to ${selectedHypothesis.title.toLowerCase()} as the primary contributing factor.`,
    confidence: selectedHypothesis.confidence,
    iteration: 1,
    maxIterations: 3,
    events,
    finalConclusion,
    status: 'finalized',
    createdAt: now,
    updatedAt: now,
    isLocal: isGuest,
  };
}
