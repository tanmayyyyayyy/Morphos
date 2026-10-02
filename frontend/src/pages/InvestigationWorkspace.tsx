import { useState } from 'react';
import { InvestigationRecord, InvestigationResponse, InvestigationDomain, ResultStatus } from '../types';
import { classifyDomain, getDomainInsights } from '../services/domain';

interface InvestigationWorkspaceProps {
  investigation: InvestigationRecord | InvestigationResponse;
  onBack: () => void;
  onRunAgain: (q: string) => void;
  onExport: () => void;
  onDelete?: () => void;
  isRunning?: boolean;
}

export default function InvestigationWorkspace({
  investigation,
  onBack,
  onRunAgain,
  onExport,
  onDelete,
  isRunning = false,
}: InvestigationWorkspaceProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const question = investigation.question || 'Untitled Investigation';
  const domain: InvestigationDomain =
    investigation.domain || classifyDomain(question).domain;

  const rawConfidence = Number(investigation.confidence ?? 0.72);
  const confidencePct = Math.round(rawConfidence * (rawConfidence <= 1 ? 100 : 1));
  const confidenceTier: 'High' | 'Medium' | 'Low' =
    confidencePct >= 70 ? 'High' : confidencePct >= 45 ? 'Medium' : 'Low';

  const resultStatus: ResultStatus =
    investigation.resultStatus ||
    (domain === 'ml_model_performance'
      ? 'no_matching_template'
      : investigation.isLocal
      ? 'simulated'
      : 'simulated');

  const hypotheses = investigation.hypotheses && investigation.hypotheses.length > 0
    ? investigation.hypotheses
    : [];

  const selectedHypothesis =
    investigation.selectedHypothesis || (hypotheses.length > 0 ? hypotheses[0] : null);

  const insights = getDomainInsights(domain, selectedHypothesis?.title);

  // Extract plain-English answer
  const plainEnglishAnswer = (() => {
    if (resultStatus === 'no_matching_template') {
      return 'Possible causes include overfitting, noisy labels, distribution shift, or insufficient regularization.';
    }
    if (domain === 'ml_model_performance') {
      return 'Possible causes include overfitting, noisy labels, distribution shift, or insufficient regularization.';
    }
    if (selectedHypothesis) {
      return `${selectedHypothesis.title} is causing the observed performance degradation.`;
    }
    return insights.plainEnglishAnswer;
  })();

  // 3 short evidence bullets
  const evidenceBullets = (() => {
    if (resultStatus === 'no_matching_template') {
      return [
        'No matching experiment was available for this question.',
        'These are domain-based hypotheses, not measured findings.',
        'Validate them with real model training and evaluation data.',
      ];
    }
    if (selectedHypothesis && selectedHypothesis.evidence && selectedHypothesis.evidence.length >= 2) {
      const list = [...selectedHypothesis.evidence];
      if (list.length < 3 && insights.evidence.length > 0) {
        list.push(insights.evidence[0]);
      }
      return list.slice(0, 3);
    }
    return insights.evidence.slice(0, 3);
  })();

  // 2-3 concrete actions
  const recommendedActions = insights.recommendedActions.slice(0, 3);

  // Stepper stages
  const pipelineStages = [
    { num: 1, label: 'Asked', desc: 'Received your question.' },
    { num: 2, label: 'Understood', desc: 'Identified what the question is about.' },
    { num: 3, label: 'Brainstormed causes', desc: 'Considered possible explanations.' },
    { num: 4, label: 'Ran a test', desc: 'Tested the most useful explanations.' },
    { num: 5, label: 'Read results', desc: 'Examined what the test showed.' },
    { num: 6, label: 'Judged evidence', desc: 'Compared the evidence.' },
    { num: 7, label: 'Scored confidence', desc: 'Estimated how strongly the evidence supports the answer.' },
    { num: 8, label: 'Concluded', desc: 'Created the final explanation.' },
  ];

  const currentStageIndex = isRunning ? 3 : 7;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="btn-secondary py-2 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:border-white/30"
        >
          <span>←</span>
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            className="btn-secondary py-2 px-3 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5"
            title="Export markdown report"
          >
            <span>↓</span>
            <span>Export</span>
          </button>
          <button
            onClick={() => onRunAgain(question)}
            className="btn-primary py-2 px-4 text-xs uppercase tracking-wider font-bold"
          >
            Run Again
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-[#8A8A8A] hover:text-red-400 transition-colors uppercase font-mono px-2 py-1"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ANSWER CARD                                            */}
      {/* ========================================================= */}
      <section className="relative rounded-3xl bg-[#0D0D0D] border-2 border-[#FF7A00]/40 p-6 sm:p-9 shadow-[0_0_40px_rgba(255,122,0,0.18)] space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[32rem] h-32 bg-[#FF7A00]/15 blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF9D3D] font-bold">
              INVESTIGATION ANSWER
            </span>
          </div>

          {/* Result Status Badge */}
          <div>
            {resultStatus === 'no_matching_template' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                No matching experiment was available
              </span>
            ) : resultStatus === 'real' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Measured experiment result
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-300 border border-sky-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Simulated experiment result
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8A8A8A]">
            Question
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
            {question}
          </h1>
        </div>

        {/* Plain-English Answer */}
        <div className="p-5 sm:p-6 rounded-2xl bg-black/70 border border-white/[0.08] space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF9D3D] font-bold block">
            Plain-English Answer
          </span>
          <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
            {plainEnglishAnswer}
          </p>
        </div>

        {/* Key Cluster: Confidence & What this means */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
          {/* Confidence Badge */}
          <div className="md:col-span-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <div>
              <span
                className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A8A] block"
                title={
                  resultStatus === 'no_matching_template'
                    ? 'This reflects the reasoning based on the question, not measured experiment evidence.'
                    : 'How strongly the available evidence supports this explanation.'
                }
              >
                {resultStatus === 'no_matching_template' ? 'Preliminary assessment ℹ' : 'Confidence ℹ'}
              </span>
              <span className="font-display font-extrabold text-xl sm:text-2xl text-white mt-0.5 block">
                {resultStatus === 'no_matching_template'
                  ? `Reasoning confidence: ${confidencePct}%`
                  : `${confidenceTier} — ${confidencePct}%`}
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
              resultStatus === 'no_matching_template'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : confidenceTier === 'High'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : confidenceTier === 'Medium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30'
            }`}>
              {resultStatus === 'no_matching_template' ? 'PRELIMINARY' : confidenceTier.toUpperCase()}
            </div>
          </div>

          {/* What This Means */}
          <div className="md:col-span-7 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A8A] block">
              {resultStatus === 'no_matching_template' ? 'Assessment Context' : 'What This Means'}
            </span>
            <p className="text-sm text-[#D4D4D4] leading-relaxed">
              {resultStatus === 'no_matching_template'
                ? 'This reflects the reasoning based on the question, not measured experiment evidence. No matching experiment was executed.'
                : insights.whatThisMeans}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. WHY WE THINK SO                                        */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
          <h2 className="font-display font-bold text-base text-white tracking-wide uppercase">
            Why We Think So
          </h2>
        </div>

        <ul className="space-y-3 pt-1">
          {evidenceBullets.map((bullet, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm sm:text-[15px] text-[#E5E5E5] leading-relaxed"
            >
              <span className="text-[#FF7A00] font-bold text-base shrink-0 leading-none mt-0.5">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ========================================================= */}
      {/* 3. WHAT WE TESTED / DOMAIN HYPOTHESES                     */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
            <h2 className="font-display font-bold text-base text-white tracking-wide uppercase">
              {resultStatus === 'no_matching_template' ? 'Domain Hypotheses Evaluated' : 'What We Tested'}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8A8A8A]">
            {resultStatus === 'no_matching_template'
              ? `${hypotheses.length} THEORETICAL CANDIDATES (REASONING ONLY)`
              : `${hypotheses.length} EXPLANATIONS EVALUATED`}
          </span>
        </div>

        <div className="space-y-3.5 pt-1">
          {hypotheses.map((hyp, index) => {
            const hConf = Number(hyp.confidence ?? 0.5);
            const hPct = Math.round(hConf * (hConf <= 1 ? 100 : 1));
            const status: 'Likely' | 'Possible' | 'Unlikely' =
              hPct >= 65 ? 'Likely' : hPct >= 45 ? 'Possible' : 'Unlikely';

            const statusColor =
              status === 'Likely'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : status === 'Possible'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-zinc-700/30 text-zinc-400 border-zinc-600/30';

            const barColor =
              status === 'Likely'
                ? 'bg-emerald-500'
                : status === 'Possible'
                ? 'bg-amber-500'
                : 'bg-zinc-600';

            return (
              <div
                key={hyp.id || index}
                className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <h3 className="font-semibold text-sm sm:text-base text-white tracking-tight">
                      {hyp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                      {hyp.rationale}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display font-bold text-sm text-white font-mono">
                      {hPct}%
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Simple 0-100% Confidence Bar */}
                <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(5, Math.min(100, hPct))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHAT TO DO NEXT                                        */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
          <h2 className="font-display font-bold text-base text-white tracking-wide uppercase">
            What To Do Next
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {recommendedActions.map((action, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.07] space-y-2 flex flex-col justify-between"
            >
              <span className="text-xs font-mono text-[#FF7A00] font-bold">
                Step 0{idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-[#E5E5E5] leading-relaxed">
                {action}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. TECHNICAL DETAILS (COLLAPSED BY DEFAULT)              */}
      {/* ========================================================= */}
      <section className="rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-lg">
        <button
          onClick={() => setShowTechnicalDetails((prev) => !prev)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
          aria-expanded={showTechnicalDetails}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-[#8A8A8A]">
              {showTechnicalDetails ? '▼' : '▶'}
            </span>
            <span className="font-display font-bold text-sm tracking-wider uppercase text-white">
              Technical Details
            </span>
            <span className="text-[11px] font-mono text-[#555555]">
              (Raw telemetry, JSON logs, internal state)
            </span>
          </div>
          <span className="text-xs font-mono text-[#FF7A00] uppercase">
            {showTechnicalDetails ? 'Hide' : 'Show'}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="p-6 pt-0 border-t border-white/[0.08] space-y-6 mt-2">
            {/* Metadata cluster */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-black border border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-[#8A8A8A] block">DOMAIN:</span>
                <span className="text-white font-semibold">{domain}</span>
              </div>
              <div>
                <span className="text-[#8A8A8A] block">ID:</span>
                <span className="text-white truncate block">{String(investigation.id || 'local')}</span>
              </div>
              <div>
                <span className="text-[#8A8A8A] block">STATUS:</span>
                <span className="text-[#FF9D3D]">{String(investigation.status || 'finalized').toUpperCase()}</span>
              </div>
              <div>
                <span className="text-[#8A8A8A] block">SOURCE:</span>
                <span className="text-white">{investigation.isLocal ? 'Local Guest' : 'Firestore Backend'}</span>
              </div>
            </div>

            {/* Experiment Output if available */}
            {investigation.experiment && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#8A8A8A] block">
                  Experiment Configuration
                </span>
                <pre className="p-4 rounded-xl bg-black border border-white/10 text-xs font-mono text-[#D4D4D4] overflow-x-auto">
                  {JSON.stringify(investigation.experiment, null, 2)}
                </pre>
              </div>
            )}

            {investigation.experimentResult && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#8A8A8A] block">
                  Raw Experiment Result
                </span>
                <pre className="p-4 rounded-xl bg-black border border-white/10 text-xs font-mono text-[#D4D4D4] overflow-x-auto">
                  {JSON.stringify(investigation.experimentResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Raw JSON State */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-[#8A8A8A] block">
                Raw Investigation State (Full State Machine)
              </span>
              <pre className="p-4 rounded-xl bg-black border border-white/10 text-xs font-mono text-[#D4D4D4] max-h-72 overflow-y-auto leading-relaxed">
                {JSON.stringify(investigation, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 6. PIPELINE STEPPER                                       */}
      {/* ========================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
            <h2 className="font-display font-bold text-sm tracking-wider uppercase text-white">
              Investigation Pipeline
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8A8A8A]">
            8 STAGES COMPLETED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
          {pipelineStages.map((stage, idx) => {
            const isDone = idx <= currentStageIndex;
            const isActive = idx === currentStageIndex && isRunning;

            return (
              <div
                key={stage.num}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-[#FF7A00]/10 border-[#FF7A00] ring-1 ring-[#FF7A00]/40'
                    : isDone
                    ? 'bg-white/[0.03] border-white/15'
                    : 'bg-white/[0.01] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${
                    isActive ? 'text-[#FF7A00]' : isDone ? 'text-white' : 'text-[#555555]'
                  }`}>
                    0{stage.num}
                  </span>
                  {isDone && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                </div>

                <div>
                  <h4 className={`text-xs font-semibold tracking-wide ${
                    isActive ? 'text-[#FF9D3D]' : isDone ? 'text-white' : 'text-[#777777]'
                  }`}>
                    {stage.label}
                  </h4>
                  <p className="text-[10px] text-[#8A8A8A] mt-0.5 leading-snug line-clamp-2">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
