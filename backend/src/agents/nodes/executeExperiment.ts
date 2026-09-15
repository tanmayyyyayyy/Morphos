import { InvestigationState } from '../state.js';
import { benchmarkTool } from '../tools/benchmarkTool.js';
import { mockDataTool } from '../tools/mockDataTool.js';

export async function executeExperiment(state: InvestigationState): Promise<InvestigationState> {
  const experiment = state.experiment;
  if (!experiment) {
    return {
      ...state,
      experimentResult: { ok: false, error: 'No experiment selected' },
      status: 'error',
      events: [...state.events, 'Experiment execution failed'],
    };
  }

  let result: Record<string, unknown>;

  if (experiment.tool === 'benchmark_tool') {
    const args = experiment.inputs as { datasetSize?: number; loadFactor?: number };
    const raw = await benchmarkTool.invoke({
      datasetSize: args.datasetSize ?? 1000,
      loadFactor: args.loadFactor ?? 1,
    });
    result = JSON.parse(String(raw));
  } else {
    const raw = await mockDataTool.invoke({
      scenario: String((experiment.inputs as { scenario?: string }).scenario ?? 'api latency'),
    });
    result = JSON.parse(String(raw));
  }

  return {
    ...state,
    experimentResult: result,
    status: 'experiment_running',
    events: [...state.events, `Running experiment: ${experiment.name}`],
  };
}
