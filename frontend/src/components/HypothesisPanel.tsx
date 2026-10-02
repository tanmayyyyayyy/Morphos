import { Hypothesis } from '../types';

interface HypothesisPanelProps {
  hypotheses?: Hypothesis[];
  selectedHypothesis?: Hypothesis | null;
}

export default function HypothesisPanel({
  hypotheses = [],
  selectedHypothesis = null,
}: HypothesisPanelProps) {
  // If no hypotheses provided yet, show clean fallback placeholder or default example
  const items = hypotheses.length > 0 ? hypotheses : [
    {
      id: 'h1',
      title: 'Database connection pool exhaustion',
      rationale: 'Persistent thread locks cause connection starvation under elevated query concurrency.',
      confidence: 0.72,
      evidence: ['Connection wait queue exceeds threshold', 'Idle connections at 0%'],
    },
    {
      id: 'h2',
      title: 'External API downstream latency',
      rationale: 'Third-party gateway timeout delays cascade into caller worker threads.',
      confidence: 0.54,
      evidence: ['P99 response time spikes on external calls'],
    },
    {
      id: 'h3',
      title: 'CPU saturation on worker nodes',
      rationale: 'Compute thread contention during garbage collection cycles.',
      confidence: 0.31,
      evidence: ['GC pause spikes correlating with latency degradation'],
    },
  ];

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
          <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white">
            HYPOTHESES EVALUATION
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8A8A8A]">
          {items.length} CANDIDATE {items.length === 1 ? 'CAUSE' : 'CAUSES'}
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map((hyp, index) => {
          const confidencePct = Math.round(Number(hyp.confidence ?? 0) * (hyp.confidence <= 1 ? 100 : 1));
          const isSelected = selectedHypothesis && selectedHypothesis.title === hyp.title;

          return (
            <div
              key={hyp.id ?? index}
              className={`p-4 rounded-xl border transition-all duration-200 relative ${
                isSelected
                  ? 'bg-[#FF7A00]/[0.06] border-[#FF7A00]/50 shadow-[0_0_18px_rgba(255,122,0,0.18)]'
                  : 'bg-white/[0.02] border-white/[0.07] hover:border-white/15 hover:bg-white/[0.035]'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#FF7A00]">
                      Hypothesis 0{index + 1}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FF7A00]/20 text-[#FF9D3D] border border-[#FF7A00]/30">
                        Selected For Testing
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    {hyp.title}
                  </h4>
                </div>

                {/* Confidence Pill */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-mono text-[#8A8A8A] block">
                    Confidence
                  </span>
                  <span className="font-display font-bold text-base text-white">
                    {confidencePct}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 my-2.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(5, confidencePct))}%`,
                    background:
                      confidencePct >= 70
                        ? 'linear-gradient(90deg, #FF7A00, #FF9D3D)'
                        : confidencePct >= 40
                        ? 'linear-gradient(90deg, #FF9D3D, #FFD43B)'
                        : 'linear-gradient(90deg, #8A8A8A, #A3A3A3)',
                  }}
                />
              </div>

              {/* Rationale */}
              {hyp.rationale && (
                <p className="text-xs text-[#8A8A8A] leading-relaxed mb-3">
                  {hyp.rationale}
                </p>
              )}

              {/* Evidence Chips */}
              {hyp.evidence && hyp.evidence.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hyp.evidence.map((ev, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-[#A3A3A3] border border-white/[0.06]"
                    >
                      • {ev}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
