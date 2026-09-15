import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const scenarios: Record<string, Record<string, number>> = {
  'api latency': {
    databaseLatency: 41,
    cpuUtilization: 62,
    memoryUsage: 55,
    requestVolume: 118,
    connectionPoolUsage: 74,
  },
  'database performance': {
    databaseLatency: 73,
    cpuUtilization: 58,
    memoryUsage: 49,
    requestVolume: 126,
    connectionPoolUsage: 82,
  },
  'memory usage': {
    databaseLatency: 33,
    cpuUtilization: 47,
    memoryUsage: 92,
    requestVolume: 81,
    connectionPoolUsage: 41,
  },
  'dataset size': {
    databaseLatency: 25,
    cpuUtilization: 68,
    memoryUsage: 63,
    requestVolume: 52,
    connectionPoolUsage: 57,
  },
};

export const mockDataTool = tool(
  async ({ scenario }: { scenario: string }) => {
    const normalized = scenario.toLowerCase();
    const base = scenarios[normalized] ?? {
      databaseLatency: 30,
      cpuUtilization: 45,
      memoryUsage: 60,
      requestVolume: 70,
      connectionPoolUsage: 50,
    };

    return JSON.stringify({
      ok: true,
      scenario,
      metrics: {
        databaseLatency: base.databaseLatency + Math.round(Math.random() * 18),
        cpuUtilization: base.cpuUtilization + Math.round(Math.random() * 15),
        memoryUsage: base.memoryUsage + Math.round(Math.random() * 20),
        requestVolume: base.requestVolume + Math.round(Math.random() * 25),
        connectionPoolUsage: base.connectionPoolUsage + Math.round(Math.random() * 18),
      },
    });
  },
  {
    name: 'mock_data_tool',
    description: 'Return realistic simulated metrics for common performance investigation scenarios.',
    schema: z.object({
      scenario: z.string().describe('The scenario to simulate, for example API latency or memory usage'),
    }),
  },
);
