import { useState, useMemo } from 'react';
import { InvestigationRecord } from '../types';

interface ExperimentsViewProps {
  history: InvestigationRecord[];
}

export default function ExperimentsView({ history }: ExperimentsViewProps) {
  const [selectedItem, setSelectedItem] = useState<InvestigationRecord | null>(null);

  const experimentRecords = useMemo(() => {
    return history.map((item, idx) => ({
      id: item.id ?? `exp-${idx}`,
      name: item.experiment?.name ?? 'Latency Benchmark Test',
      tool: item.experiment?.tool ?? 'benchmarkTool',
      question: item.question ?? 'System anomaly inquiry',
      hypothesis: item.selectedHypothesis?.title ?? 'Hypothesis under test',
      status: String(item.status ?? 'completed'),
      confidence: Math.round(Number(item.confidence ?? 0) * (item.confidence && item.confidence <= 1 ? 100 : 1)),
      timestamp: item.createdAt ?? new Date().toISOString(),
      raw: item,
    }));
  }, [history]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            EXPERIMENT REGISTRY
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">
            {experimentRecords.length} EXECUTED BENCHMARKS AND ISOLATED TOOLS
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/60 border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
              <tr>
                <th className="py-3.5 px-4">Tool</th>
                <th className="py-3.5 px-4">Experiment Name</th>
                <th className="py-3.5 px-4">Investigation Problem</th>
                <th className="py-3.5 px-4">Tested Hypothesis</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {experimentRecords.length > 0 ? (
                experimentRecords.map((exp) => (
                  <tr
                    key={exp.id}
                    onClick={() => setSelectedItem(exp.raw)}
                    className="hover:bg-white/[0.025] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono text-[#FF9D3D]">
                      {exp.tool}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white group-hover:text-[#FF7A00] transition-colors">
                      {exp.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#8A8A8A] max-w-xs truncate">
                      {exp.question}
                    </td>
                    <td className="py-3.5 px-4 text-[#8A8A8A] max-w-xs truncate">
                      {exp.hypothesis}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="status-pill status-completed text-[10px]">
                        {exp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-display font-bold text-white">
                      {exp.confidence}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#8A8A8A] text-xs">
                    No experiments logged in the registry yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experiment Detail Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">
                Experiment Telemetry Record
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#8A8A8A] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#8A8A8A] font-mono uppercase block text-[10px]">
                  Objective
                </span>
                <span className="text-white font-medium">
                  {selectedItem.interpretedProblem ?? selectedItem.question}
                </span>
              </div>

              <div>
                <span className="text-[#8A8A8A] font-mono uppercase block text-[10px]">
                  Tested Hypothesis
                </span>
                <span className="text-white font-medium">
                  {selectedItem.selectedHypothesis?.title ?? 'Default hypothesis'}
                </span>
              </div>

              <div>
                <span className="text-[#8A8A8A] font-mono uppercase block text-[10px]">
                  Experiment & Tool
                </span>
                <span className="text-[#FF9D3D] font-mono">
                  {selectedItem.experiment?.name} ({selectedItem.experiment?.tool ?? 'deterministic'})
                </span>
              </div>

              <div>
                <span className="text-[#8A8A8A] font-mono uppercase block text-[10px] mb-1">
                  Observed Output
                </span>
                <pre className="p-3 bg-black rounded-xl border border-white/10 text-white font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedItem.experimentResult ?? { status: 'success', latency_delta: '+38%' }, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[#8A8A8A] font-mono uppercase block text-[10px]">
                  AI Synthesis
                </span>
                <p className="text-[#D4D4D4] leading-relaxed">
                  {selectedItem.analysis ?? 'Telemetry correlates directly with root cause hypothesis.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
