/**
 * File README
 * What this file does: produces candidate explanations for the investigation.
 * Why it exists: the agent must reason about multiple plausible causes before choosing a test.
 * Data in: the interpreted problem and the user's question.
 * Data out: a list of hypothesis objects with rationale, evidence, and confidence.
 * LangGraph connection: it follows interpretQuestion and precedes experiment selection.
 */
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { config, isGeminiConfigured } from '../../config.js';
import { createEvent, Hypothesis, InvestigationState } from '../state.js';

let ChatGoogleGenerativeAI: any = null;

try {
  // Lazy-load only when a Gemini API key is available so local dev remains safe without credentials.
  if (isGeminiConfigured) {
    ({ ChatGoogleGenerativeAI } = await import('@langchain/google-genai'));
  }
} catch (error) {
  console.warn('Gemini model unavailable; continuing with deterministic fallback logic.', error);
}

const HypothesisListSchema = z.object({
  hypotheses: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      rationale: z.string(),
      confidence: z.number().min(0).max(1),
      evidence: z.array(z.string()),
    }),
  ),
});

const shouldUseLiveGemini = isGeminiConfigured && process.env.NODE_ENV !== 'test' && process.env.USE_LIVE_GEMINI !== 'false';

const model = shouldUseLiveGemini
  ? new ChatGoogleGenerativeAI({
      model: 'gemini-3.6-flash',
      apiKey: config.geminiApiKey,
      temperature: 0.3,
    }).withStructuredOutput(HypothesisListSchema)
  : null;

const scenarioMap: Record<string, Hypothesis[]> = {
  latency: [
    {
      id: 'h1',
      title: 'Connection pool saturation',
      rationale: 'As traffic rises, connection reuse or pooling may become the bottleneck.',
      confidence: 0.38,
      evidence: ['request volume is climbing', 'latency correlates with concurrency'],
    },
    {
      id: 'h2',
      title: 'Database query slowdown',
      rationale: 'Query execution may become slower under higher concurrent access patterns.',
      confidence: 0.46,
      evidence: ['database latency metrics are elevated', 'query throughput is reduced'],
    },
    {
      id: 'h3',
      title: 'CPU saturation',
      rationale: 'CPU load may be limiting request processing as traffic increases.',
      confidence: 0.31,
      evidence: ['processing time increases with volume', 'CPU usage spikes'],
    },
  ],
  database: [
    {
      id: 'd1',
      title: 'Lock contention in database writes',
      rationale: 'Increasing load can amplify blocked transactions and queueing.',
      confidence: 0.44,
      evidence: ['database throughput drops under load', 'query latency rises'],
    },
    {
      id: 'd2',
      title: 'Insufficient connection pooling',
      rationale: 'The app may be opening too many DB connections under traffic spikes.',
      confidence: 0.52,
      evidence: ['connection pool usage climbs', 'database wait time rises'],
    },
    {
      id: 'd3',
      title: 'Indexing or query plan degradation',
      rationale: 'Query plans may be inefficient as data volume grows.',
      confidence: 0.34,
      evidence: ['database performance worsens with data scale', 'query patterns are heavy'],
    },
  ],
  memory: [
    {
      id: 'm1',
      title: 'Memory leak in request handling',
      rationale: 'Object retention may be growing without release across requests.',
      confidence: 0.57,
      evidence: ['memory continues rising over time', 'retained heap scales with usage'],
    },
    {
      id: 'm2',
      title: 'Caching layer is too aggressive',
      rationale: 'A cache may be holding stale or oversized entries in memory.',
      confidence: 0.33,
      evidence: ['memory trend correlates with cache load', 'working set grows'],
    },
    {
      id: 'm3',
      title: 'Background task accumulation',
      rationale: 'Tasks may continue accumulating without cleanup.',
      confidence: 0.41,
      evidence: ['memory use rises even when throughput is stable', 'background jobs remain active'],
    },
  ],
  dataset: [
    {
      id: 's1',
      title: 'Algorithmic complexity is dominating runtime',
      rationale: 'Processing cost may scale superlinearly with dataset size.',
      confidence: 0.61,
      evidence: ['runtime accelerates as input size grows', 'cost increases disproportionately'],
    },
    {
      id: 's2',
      title: 'Inefficient join or aggregation pattern',
      rationale: 'Data processing may be re-scanning or recomputing intermediate state.',
      confidence: 0.39,
      evidence: ['processing time increases with row count', 'sequential operations are expensive'],
    },
    {
      id: 's3',
      title: 'Memory pressure is causing spillover',
      rationale: 'As the dataset grows, memory pressure may increase the cost of sorting and swapping.',
      confidence: 0.36,
      evidence: ['memory growth accompanies processing slowdown', 'system moves from RAM to slower storage'],
    },
  ],
};

export async function generateHypotheses(state: InvestigationState): Promise<InvestigationState> {
  const key = state.question.toLowerCase();
  const matches = Object.keys(scenarioMap).filter((scenario) =>
    key.includes(scenario) || (scenario === 'latency' && key.includes('api')) || (scenario === 'dataset' && key.includes('processing')),
  );

  let hypotheses: Hypothesis[] = matches.length ? scenarioMap[matches[0]] : [
    ...scenarioMap.latency,
    ...scenarioMap.database,
  ].slice(0, 3);

  if (model) {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', 'You are MORPHOS, an autonomous investigation planner. Generate 2-4 structured hypotheses for a performance investigation.'],
        ['human', 'Question: {question}\nReturn a JSON object with a hypotheses array where each item includes id, title, rationale, confidence, and evidence.'],
      ]);
      const content = await prompt.invoke({ question: state.question });
      const response = await model.invoke(content);
      const structured = response as { hypotheses?: Hypothesis[] };
      if (structured.hypotheses && structured.hypotheses.length > 0) {
        hypotheses = structured.hypotheses as Hypothesis[];
      }
    } catch (error) {
      console.warn('Falling back from Gemini hypothesis generation', error);
    }
  }

  return {
    ...state,
    hypotheses,
    status: 'hypotheses_ready',
    events: [...state.events, createEvent('generateHypotheses', `Generated ${hypotheses.length} hypotheses`)],
  };
}
