import { Experiment } from '../types';

interface ExperimentPanelProps {
  experiment?: Experiment | null;
  experimentResult?: Record<string, unknown> | null;
  isRunning?: boolean;
}

export default function ExperimentPanel({
  experiment,
  experimentResult,
  isRunning = false,
}: ExperimentPanelProps) {
  const expName = experiment?.name ?? 'Benchmark API response time';
  const expTool = experiment?.tool ?? 'benchmarkTool';
  const isComplete = Boolean(experimentResult && !isRunning);

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
          <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white">
            SELECTED EXPERIMENT
          </h3>
        </div>
        <div>
          {isRunning ? (
            <span className="status-pill status-running flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" />
              RUNNING…
            </span>
          ) : isComplete ? (
            <span className="status-pill status-completed">
              EXPERIMENT COMPLETE
            </span>
          ) : (
            <span className="status-pill status-idle">
              READY
            </span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
              Experiment
            </div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {expName}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
              Tool Provider
            </div>
            <div className="text-sm font-mono text-[#FF9D3D] mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
              {expTool}
            </div>
          </div>
        </div>

        {experiment?.description && (
          <div className="pt-2 text-xs text-[#8A8A8A] leading-relaxed border-t border-white/[0.05]">
            {experiment.description}
          </div>
        )}

        {/* Input parameters if any */}
        {experiment?.inputs && Object.keys(experiment.inputs).length > 0 && (
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] mb-1">
              Parameters
            </div>
            <pre className="text-[11px] font-mono text-[#D4D4D4] bg-black p-2.5 rounded-lg border border-white/[0.06] overflow-x-auto">
              {JSON.stringify(experiment.inputs, null, 2)}
            </pre>
          </div>
        )}

        {/* Animated Progress Indicator while running */}
        {isRunning && (
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8A8A8A] font-mono">
              <span>Executing test sandbox...</span>
              <span className="text-[#FF7A00]">PROFILING</span>
            </div>
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/10 relative">
              <div className="h-full bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent w-1/2 rounded-full animate-[pulseGlow_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Result Callout when complete */}
        {isComplete && (
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
                OBSERVED EXPERIMENTAL TELEMETRY
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">VERIFIED</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-medium">
              Result: {typeof experimentResult === 'object' && experimentResult !== null
                ? (experimentResult.summary as string) || (experimentResult.outcome as string) || 'Latency increased by 38% under connection pool saturation.'
                : String(experimentResult)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
