interface ConclusionCardProps {
  conclusion?: string;
  confidence?: number;
  iteration?: number;
  maxIterations?: number;
  status?: string;
  onRunAgain: () => void;
  onExport: () => void;
  onDelete?: () => void;
}

export default function ConclusionCard({
  conclusion = 'The strongest evidence points toward database connection pool exhaustion under elevated concurrency.',
  confidence = 0.87,
  iteration = 3,
  maxIterations = 5,
  status = 'INVESTIGATION COMPLETE',
  onRunAgain,
  onExport,
  onDelete,
}: ConclusionCardProps) {
  const confidencePct = Math.round(Number(confidence) * (confidence <= 1 ? 100 : 1));

  return (
    <div className="relative rounded-2xl bg-[#0A0A0A] border border-[#FF7A00]/40 p-6 sm:p-8 shadow-[0_0_35px_rgba(255,122,0,0.18)] space-y-6 overflow-hidden">
      {/* Subtle top orange glow accent */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#FF7A00]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse" />
          <span className="font-display font-bold text-xs tracking-[0.2em] uppercase text-[#FF9D3D]">
            FINAL CONCLUSION
          </span>
        </div>

        <span className="status-pill status-completed">
          {status.toUpperCase()}
        </span>
      </div>

      {/* Quotation / Verdict */}
      <div className="space-y-3">
        <blockquote className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight leading-snug">
          &ldquo;{conclusion}&rdquo;
        </blockquote>
      </div>

      {/* Key Metrics cluster */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-4 sm:px-6 rounded-xl bg-black/60 border border-white/[0.06]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] block">
            Confidence
          </span>
          <span className="font-display font-bold text-2xl text-white">
            {confidencePct}%
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] block">
            Iterations
          </span>
          <span className="font-display font-bold text-2xl text-white">
            {iteration} <span className="text-xs text-[#555555]">/ {maxIterations}</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] block">
            Exit Code
          </span>
          <span className="font-mono font-bold text-2xl text-emerald-400">
            0 (OK)
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] block">
            State Machine
          </span>
          <span className="font-mono font-bold text-base text-[#FF9D3D] mt-1 block">
            CONVERGED
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onRunAgain}
            className="btn-primary py-2.5 px-6 text-xs uppercase tracking-wider font-bold"
          >
            Run Again
          </button>
          <button
            onClick={onExport}
            className="btn-secondary py-2.5 px-5 text-xs uppercase tracking-wider font-medium flex items-center gap-2"
          >
            <span>↓</span>
            <span>Export Markdown</span>
          </button>
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs text-[#8A8A8A] hover:text-red-400 transition-colors uppercase font-mono tracking-wider py-1"
          >
            Delete Investigation
          </button>
        )}
      </div>
    </div>
  );
}
