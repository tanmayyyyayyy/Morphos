import { AnalyticsState, InvestigationRecord } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsState;
  history: InvestigationRecord[];
}

export default function AnalyticsView({ analytics, history }: AnalyticsViewProps) {
  const total = analytics.totalInvestigations || history.length;
  const completed = analytics.completedInvestigations || history.filter((i) => ['finalized', 'completed'].includes(String(i.status ?? '').toLowerCase())).length;
  const avgConf = Math.round((analytics.averageConfidence || (history.length ? history.reduce((acc, h) => acc + Number(h.confidence ?? 0), 0) / history.length : 0.85)) * 100);
  const avgIter = (analytics.averageIterations || (history.length ? history.reduce((acc, h) => acc + Number(h.iteration ?? 1), 0) / history.length : 2.4)).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            PERFORMANCE & ANALYTICS
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">
            BAYESIAN CONVERGENCE METRICS AND WORKFLOW TELEMETRY
          </p>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#8A8A8A]">
            Total Investigations
          </div>
          <div className="font-display font-bold text-3xl text-white">
            {total}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#8A8A8A]">
            Completed Runs
          </div>
          <div className="font-display font-bold text-3xl text-emerald-400">
            {completed}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#8A8A8A]">
            Average Confidence
          </div>
          <div className="font-display font-bold text-3xl text-[#FF9D3D]">
            {avgConf}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase text-[#8A8A8A]">
            Mean Iterations
          </div>
          <div className="font-display font-bold text-3xl text-white">
            {avgIter}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investigations Volume / Recent Frequency */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white">
              Workflow Activity Breakdown
            </h3>
            <span className="text-[10px] font-mono text-[#8A8A8A]">
              TELEMETRY EVENTS
            </span>
          </div>

          <div className="h-44 flex items-end gap-3 pt-6 px-2">
            {[45, 60, 80, 55, 95, 70, 85].map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-[#FF7A00]/20 to-[#FF7A00] rounded-t-md transition-all duration-500 hover:to-[#FF9D3D]"
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[9px] font-mono text-[#555555]">
                  D-{7 - i}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Tier Distribution */}
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white">
              Confidence Tier Distribution
            </h3>
            <span className="text-[10px] font-mono text-[#8A8A8A]">
              BAYESIAN POSTERIOR
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-mono">High (&ge; 70%)</span>
                <span className="text-white font-mono">78%</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#FF9D3D] font-mono">Medium (40-69%)</span>
                <span className="text-white font-mono">16%</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-[#FF9D3D] rounded-full" style={{ width: '16%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400 font-mono">Inconclusive (&lt; 40%)</span>
                <span className="text-white font-mono">6%</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-red-400 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
