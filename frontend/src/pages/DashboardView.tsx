import { useState } from 'react';
import { InvestigationRecord } from '../types';

interface DashboardViewProps {
  question: string;
  setQuestion: (q: string) => void;
  onStartInvestigation: () => void;
  onTryDemo: () => void;
  loading: boolean;
  error: string | null;
  history: InvestigationRecord[];
  onOpenInvestigation: (id: string) => void;
  metrics: {
    totalInvestigations: number;
    experimentsRun: number;
    avgConfidence: number;
    completionRate: number;
  };
}

export default function DashboardView({
  question,
  setQuestion,
  onStartInvestigation,
  onTryDemo,
  loading,
  error,
  history,
  onOpenInvestigation,
  metrics,
}: DashboardViewProps) {
  // Determine dynamic greeting based on client time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning.';
    if (hour < 18) return 'Good afternoon.';
    return 'Good evening.';
  };

  const sampleQuestions = [
    'Why is API latency increasing?',
    'Why does memory usage grow over time?',
    'Why is database throughput falling under load?',
    'Why does model accuracy decrease with dataset size?',
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner / Model Provider Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse" />
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#8A8A8A] font-semibold">
              AI PROVIDER TELEMETRY
            </div>
            <div className="text-xs text-white font-medium">
              Deterministic Fallback Engine Active • Gemini Heuristic Engine Standby
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/[0.04] text-[#8A8A8A] border border-white/[0.08]">
            LANGGRAPH 0.2
          </span>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#FF7A00]/10 text-[#FF9D3D] border border-[#FF7A00]/25">
            BOUNDED ITERATIONS
          </span>
        </div>
      </div>

      {/* Hero Investigation Input Panel */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0A0A0A] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient glow in background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF7A00]/8 blur-[100px] pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A8A8A]">
              {getGreeting()}
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              WHAT ARE YOU INVESTIGATING?
            </h2>
            <p className="text-sm text-[#8A8A8A] max-w-2xl">
              Input a technical symptom, latency regression, or pipeline anomaly. MORPHOS will formulate candidate hypotheses, select deterministic tools, and measure confidence.
            </p>
          </div>

          {/* Large Command Textarea / Input */}
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={1000}
              aria-label="Investigation question or anomaly description"
              placeholder="e.g. Why is my API latency increasing under high request concurrency?"
              className="w-full p-4 sm:p-5 rounded-2xl bg-black/80 border border-white/15 text-white placeholder-[#555555] text-base sm:text-lg font-sans focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] transition-all shadow-inner leading-relaxed resize-none"
            />
            <div className="flex justify-between items-center px-1 mt-1 text-[10px] font-mono text-[#666666]">
              <span>Min. 8 characters</span>
              <span className={question.length > 900 ? 'text-[#FF7A00]' : ''}>
                {question.length}/1000
              </span>
            </div>
          </div>


          {/* Quick Demo Question Chips */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#555555]">
              RECOMMENDED INQUIRIES
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 text-left ${
                    question === q
                      ? 'bg-[#FF7A00]/15 border-[#FF7A00] text-white shadow-[0_0_12px_rgba(255,122,0,0.25)]'
                      : 'bg-white/[0.02] border-white/[0.08] text-[#8A8A8A] hover:border-white/20 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartInvestigation}
              disabled={loading}
              className="btn-primary py-3.5 px-8 text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>INVESTIGATING…</span>
                </span>
              ) : (
                <span>RUN INVESTIGATION →</span>
              )}
            </button>

            <button
              onClick={onTryDemo}
              disabled={loading}
              className="btn-secondary py-3.5 px-7 text-xs uppercase tracking-wider font-medium hover:border-white/30"
            >
              TRY DEMO
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-200 text-xs leading-relaxed">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            Total Investigations
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {metrics.totalInvestigations}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            Experiments Run
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {metrics.experimentsRun}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            Average Confidence
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {Math.round(metrics.avgConfidence * 100)}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
            Workflow Completion Rate
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {Math.round(metrics.completionRate)}%
          </div>
        </div>
      </div>

      {/* Recent Investigations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white">
            Recent Investigations
          </h3>
          <span className="text-xs font-mono text-[#8A8A8A]">
            {history.length} SAVED IN FIRESTORE
          </span>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.slice(0, 4).map((item, idx) => (
              <div
                key={String(item.id ?? idx)}
                onClick={() => onOpenInvestigation(String(item.id ?? ''))}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-[#FF7A00]/40 hover:bg-white/[0.04] transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#FF9D3D] transition-colors line-clamp-1">
                    {String(item.question ?? 'Investigation')}
                  </h4>
                  <span className="status-pill status-completed shrink-0 text-[10px]">
                    {String(item.status ?? 'COMPLETED').toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-[#8A8A8A] line-clamp-2 leading-relaxed">
                  {String(item.finalConclusion ?? item.analysis ?? 'Analysis concluded with verified evidence.')}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#555555] pt-2 border-t border-white/[0.05]">
                  <span>CONFIDENCE: {Math.round(Number(item.confidence ?? 0) * 100)}%</span>
                  <span className="text-[#8A8A8A] group-hover:text-white transition-colors">
                    Open Workspace →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-center text-xs text-[#8A8A8A]">
            No previous investigations found. Type a question above or click &ldquo;TRY DEMO&rdquo; to start your first run.
          </div>
        )}
      </div>
    </div>
  );
}
