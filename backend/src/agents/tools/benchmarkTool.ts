/**
 * File README
 * What this file does: benchmarks simulated system performance under a dataset size and load factor.
 * Why it exists: it creates realistic latency and throughput numbers for the platform's demo scenarios.
 * Data in: datasetSize and loadFactor values chosen by the agent.
 * Data out: latency, throughput, and a summary string for downstream analysis.
 * LangGraph connection: the experiment selection step chooses this tool when the scenario is about latency or scaling behavior.
 */
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const benchmarkTool = tool(
  async ({ datasetSize, loadFactor }: { datasetSize: number; loadFactor: number }) => {
    const base = datasetSize * 0.12;
    const latency = Math.round(base * (1 + loadFactor * 0.4) + Math.random() * 30);
    const throughput = Math.max(10, Math.round((datasetSize / Math.max(1, latency)) * 7));

    return JSON.stringify({
      ok: true,
      datasetSize,
      loadFactor,
      latencyMs: latency,
      throughputRps: throughput,
      summary: `Benchmark completed with ${latency} ms latency and ${throughput} rps throughput.`,
    });
  },
  {
    name: 'benchmark_tool',
    description: 'Run a simulated benchmark to measure latency and throughput under load.',
    schema: z.object({
      datasetSize: z.number().int().positive(),
      loadFactor: z.number().min(0).max(10),
    }),
  },
);
