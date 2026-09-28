import { InvestigationRecord, InvestigationResponse } from '../types';
import InvestigationTimeline from '../components/InvestigationTimeline';
import HypothesisPanel from '../components/HypothesisPanel';
import ExperimentPanel from '../components/ExperimentPanel';
import AnalysisPanel from '../components/AnalysisPanel';
import ConclusionCard from '../components/ConclusionCard';

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
  const currentStatus = String(investigation.status ?? 'finalized');
  const isFinalized = currentStatus.toLowerCase() === 'finalized' || currentStatus.toLowerCase() === 'completed';

  // Determine stage index
  const stageIndex = isFinalized ? 7 : isRunning ? 3 : 7;

  const hypotheses = investigation.hypotheses ?? [];
  const selectedHypothesis = investigation.selectedHypothesis ?? (hypotheses.length > 0 ? hypotheses[0] : null);
  const evidenceList =
    selectedHypothesis?.evidence?.length
      ? selectedHypothesis.evidence
      : hypotheses.flatMap((h) => h.evidence ?? []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="btn-secondary py-2 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:border-white/30"
        >
          <span>←</span>
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#8A8A8A]">
            STATUS:
          </span>
          <span className={`status-pill ${
            isFinalized ? 'status-completed' : isRunning ? 'status-running' : 'status-idle'
          }`}>
            {currentStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Header Question Block */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-[2px] bg-[#FF7A00]" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#8A8A8A]">
            INVESTIGATION SUBJECT
          </span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
          {investigation.question ?? 'Technical Investigation'}
        </h2>
        {investigation.interpretedProblem && (
          <p className="text-sm text-[#8A8A8A] max-w-3xl leading-relaxed">
            <span className="text-[#F5F5F5] font-medium">Interpreted Problem: </span>
            {investigation.interpretedProblem}
          </p>
        )}
      </div>

      {/* Workflow Timeline */}
      <InvestigationTimeline
        currentStageIndex={stageIndex}
        events={investigation.events as Array<{ node?: string; message?: string; timestamp?: string }> ?? []}
        status={currentStatus}
      />

      {/* Middle Grid: Hypotheses & Selected Experiment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <HypothesisPanel
            hypotheses={hypotheses}
            selectedHypothesis={selectedHypothesis}
          />
        </div>

        <div className="lg:col-span-5">
          <ExperimentPanel
            experiment={investigation.experiment}
            experimentResult={investigation.experimentResult}
            isRunning={isRunning}
          />
        </div>
      </div>

      {/* Two-Column Telemetry & AI Analysis */}
      <AnalysisPanel
        experimentResult={investigation.experimentResult}
        analysis={investigation.analysis}
        confidence={investigation.confidence}
        selectedHypothesis={selectedHypothesis}
        evidence={evidenceList}
      />

      {/* Final Conclusion Card */}
      <ConclusionCard
        conclusion={investigation.finalConclusion || investigation.analysis}
        confidence={investigation.confidence}
        iteration={investigation.iteration ?? 1}
        maxIterations={investigation.maxIterations ?? 3}
        status={currentStatus}
        onRunAgain={() => onRunAgain(investigation.question ?? '')}
        onExport={onExport}
        onDelete={onDelete}
      />
    </div>
  );
}
