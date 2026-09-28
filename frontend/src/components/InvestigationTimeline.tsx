interface InvestigationTimelineProps {
  currentStageIndex: number;
  events?: Array<{ node?: string; message?: string; timestamp?: string }>;
  status?: string;
}

export default function InvestigationTimeline({
  currentStageIndex,
  events = [],
  status = 'idle',
}: InvestigationTimelineProps) {
  const stages = [
    { id: 'question', label: 'QUESTION', desc: 'Query Ingestion' },
    { id: 'interpretation', label: 'INTERPRETATION', desc: 'Scope Definition' },
    { id: 'hypotheses', label: 'HYPOTHESES', desc: 'Candidate Causes' },
    { id: 'experiment', label: 'EXPERIMENT', desc: 'Tool Execution' },
    { id: 'results', label: 'RESULTS', desc: 'Telemetry Data' },
    { id: 'analysis', label: 'ANALYSIS', desc: 'Observation Correlation' },
    { id: 'confidence', label: 'CONFIDENCE', desc: 'Bayesian Scoring' },
    { id: 'conclusion', label: 'CONCLUSION', desc: 'Final Verdict' },
  ];

  const isCompleted = status.toLowerCase() === 'finalized' || status.toLowerCase() === 'completed';

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse" />
          <h3 className="font-display font-bold text-sm tracking-wider uppercase text-white">
            WORKFLOW PIPELINE
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8A8A8A]">
          {isCompleted ? 'ALL NODES EXECUTED' : `STAGE ${Math.min(currentStageIndex + 1, stages.length)} OF ${stages.length}`}
        </span>
      </div>

      {/* Horizontal / Wrapped Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {stages.map((st, idx) => {
          const isDone = isCompleted || idx < currentStageIndex;
          const isActive = !isCompleted && idx === currentStageIndex;
          const isPending = !isCompleted && idx > currentStageIndex;

          return (
            <div
              key={st.id}
              className={`p-3 rounded-xl border transition-all duration-300 relative flex flex-col justify-between ${
                isActive
                  ? 'bg-[#FF7A00]/10 border-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.3)] ring-1 ring-[#FF7A00]/50'
                  : isDone
                  ? 'bg-white/[0.03] border-white/20 text-[#D4D4D4]'
                  : 'bg-white/[0.01] border-white/[0.05] text-[#555555]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono font-bold ${
                  isActive ? 'text-[#FF7A00]' : isDone ? 'text-white' : 'text-[#555555]'
                }`}>
                  0{idx + 1}
                </span>

                {isDone && (
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                )}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
                )}
              </div>

              <div>
                <div className={`text-[11px] font-bold tracking-wider uppercase ${
                  isActive ? 'text-white' : isDone ? 'text-[#E5E5E5]' : 'text-[#555555]'
                }`}>
                  {st.label}
                </div>
                <div className="text-[9px] text-[#8A8A8A] mt-0.5 truncate font-mono">
                  {st.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Event Log */}
      {events.length > 0 && (
        <div className="pt-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] mb-2 flex items-center justify-between">
            <span>REAL-TIME AUDIT STREAM</span>
            <span>{events.length} EVENTS RECORDED</span>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-[11px]">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-[#8A8A8A]">
                <span className="text-[#FF7A00] shrink-0">›</span>
                <span className="text-[#555555] shrink-0">{ev.timestamp ? String(ev.timestamp).slice(11, 19) : '00:00:00'}</span>
                <span className="text-white truncate">{String(ev.message ?? ev.node ?? 'Node transition')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
