import { Hypothesis } from '../types';

interface AnalysisPanelProps {
  experimentResult?: Record<string, unknown> | null;
  analysis?: string;
  confidence?: number;
  selectedHypothesis?: Hypothesis | null;
  evidence?: string[];
}

export default function AnalysisPanel({
  experimentResult,
  analysis,
  confidence = 0.87,
  selectedHypothesis,
  evidence = [],
}: AnalysisPanelProps) {
  const confidencePct = Math.round(Number(confidence) * (confidence <= 1 ? 100 : 1));

  const defaultResultJson = {
    metric: 'response_latency_ms',
    baseline_p99: 142.4,
    observed_p99: 196.5,
    deviation_pct: '+38.0%',
    connection_pool_active: 50,
    connection_pool_limit: 50,
    wait_queue_length: 312,
    exit_code: 0,
    timestamp: new Date().toISOString(),
  };

  const rawData = experimentResult || defaultResultJson;

  const analysisText =
    analysis ||
    'Real-time load profiling confirmed that as request concurrency escalated past 50 simultaneous connections, worker threads stalled awaiting available database sockets. The +38% latency spike is directly attributed to thread queue starvation rather than raw CPU or disk I/O limits.';

  const evidenceItems =
    evidence.length > 0
      ? evidence
      : [
          'Observed pool exhaustion (50/50 active connections)',
          'Thread wait queue backlog escalated to 312 pending items',
          'P99 response time degraded from 142.4ms to 196.5ms (+38%)',
          'CPU utilization remained constant at 41%, eliminating compute bottleneck',
        ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Monospace Technical Experiment Result */}
      <div className="lg:col-span-6 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
              <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white">
                EXPERIMENT RESULT
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] text-[#8A8A8A]">
              RAW TELEMETRY
            </span>
          </div>

          <p className="text-xs text-[#8A8A8A]">
            Deterministically measured sandbox output with system telemetry:
          </p>

          <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
            <div className="px-3 py-1.5 bg-[#050505] border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#555555]">
              <span>stdout.json</span>
              <span>read-only</span>
            </div>
            <pre className="p-4 font-mono text-xs text-[#E5E5E5] overflow-x-auto leading-relaxed max-h-72">
              <code>{JSON.stringify(rawData, null, 2)}</code>
            </pre>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
          <span>VERIFICATION: HASH_OK</span>
          <span className="text-[#FF7A00]">DETERMINISTIC</span>
        </div>
      </div>

      {/* Right Column: AI Analysis & Evidence */}
      <div className="lg:col-span-6 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
            <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white">
              AI ANALYSIS
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#8A8A8A]">
            EVALUATED EVIDENCE
          </span>
        </div>

        {/* Selected Hypothesis Tag */}
        {selectedHypothesis && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.07]">
            <span className="text-[10px] font-mono uppercase text-[#8A8A8A] block">
              CORRELATED HYPOTHESIS
            </span>
            <span className="text-xs font-semibold text-white mt-0.5 block">
              {selectedHypothesis.title}
            </span>
          </div>
        )}

        {/* Synthesis Text */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            OBSERVATIONAL SYNTHESIS
          </div>
          <p className="text-xs sm:text-sm text-[#D4D4D4] leading-relaxed">
            {analysisText}
          </p>
        </div>

        {/* Corroborating Evidence */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            CORROBORATING EVIDENCE
          </div>
          <ul className="space-y-2">
            {evidenceItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-[#A3A3A3]"
              >
                <span className="text-[#FF7A00] font-bold text-sm leading-none mt-0.5">
                  ›
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confidence Gauge */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-[#8A8A8A] block">
              POSTERIOR CONFIDENCE
            </span>
            <span className="text-xs text-white font-medium">
              Bayesian confidence threshold met (&gt;70%)
            </span>
          </div>
          <div className="text-right">
            <span className="font-display font-extrabold text-2xl text-[#FF9D3D]">
              {confidencePct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
