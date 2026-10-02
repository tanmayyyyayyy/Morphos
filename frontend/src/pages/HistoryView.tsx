import { useState, useMemo } from 'react';
import { InvestigationRecord } from '../types';

interface HistoryViewProps {
  history: InvestigationRecord[];
  onOpenInvestigation: (id: string) => void;
  onDeleteInvestigation: (id: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function HistoryView({
  history,
  onOpenInvestigation,
  onDeleteInvestigation,
  isLoading = false,
  error = null,
}: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        const query = search.trim().toLowerCase();
        const matchesQuery =
          !query ||
          [
            item.question,
            item.domain,
            item.status,
            item.finalConclusion,
            item.selectedHypothesis?.title,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query);

        const status = String(item.status ?? '').toLowerCase();
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'completed' && (status === 'finalized' || status === 'completed')) ||
          (statusFilter === 'running' && ['interpreted', 'hypotheses_ready', 'experiment_selected', 'experiment_running', 'analyzed', 'running'].includes(status)) ||
          (statusFilter === 'failed' && status === 'failed');

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        const aTime = new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime();
        const bTime = new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime();
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      });
  }, [history, search, statusFilter, sortOrder]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDomain = (domain?: string) => {
    switch (domain) {
      case 'ml_model_performance':
        return 'ML Model Performance';
      case 'api_latency':
        return 'API Latency';
      case 'memory':
        return 'Memory Leak / Heap';
      case 'database':
        return 'Database Performance';
      case 'general':
      default:
        return 'General System';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            INVESTIGATION HISTORY
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">
            {history.length} SAVED INVESTIGATIONS
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/10 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555555] text-sm">
            ⌕
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, domains, hypotheses, conclusions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-[#555555] text-xs focus:outline-none focus:border-[#FF7A00] transition-colors"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto">
          {(['all', 'completed', 'running', 'failed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`text-xs px-3 py-1.5 rounded-lg uppercase font-mono tracking-wider transition-colors ${
                statusFilter === filter
                  ? 'bg-[#FF7A00]/20 text-[#FF9D3D] border border-[#FF7A00]/40'
                  : 'bg-white/[0.03] text-[#8A8A8A] border border-white/[0.06] hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          className="px-3 py-2 rounded-xl bg-black border border-white/10 text-[#8A8A8A] text-xs font-mono uppercase focus:outline-none self-start md:self-auto"
        >
          <option value="newest">NEWEST FIRST</option>
          <option value="oldest">OLDEST FIRST</option>
        </select>
      </div>

      {/* State View: Loading */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-[#0A0A0A] border border-white/10 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF7A00] border-t-transparent animate-spin mx-auto" />
          <div className="text-sm font-medium text-white">Loading your investigations...</div>
        </div>
      ) : error ? (
        <div className="p-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
          <div className="text-sm text-red-300 font-medium">Unable to load your investigation history.</div>
          <div className="text-xs text-red-400/80">{error}</div>
        </div>
      ) : filteredHistory.length > 0 ? (
        /* Investigation Records List */
        <div className="space-y-3.5">
          {filteredHistory.map((item, idx) => {
            const confidencePct = Math.round(Number(item.confidence ?? 0) * (item.confidence && item.confidence <= 1 ? 100 : 1));
            const statusStr = String(item.status ?? 'completed').toLowerCase();
            const isCompleted = statusStr === 'finalized' || statusStr === 'completed';

            const resStatus =
              item.resultStatus === 'no_matching_template'
                ? 'NO MATCHING EXPERIMENT'
                : item.resultStatus === 'real'
                ? 'MEASURED'
                : 'SIMULATED';

            const resStatusColor =
              resStatus === 'MEASURED'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : resStatus === 'NO MATCHING EXPERIMENT'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-sky-400 bg-sky-500/10 border-sky-500/20';

            return (
              <div
                key={String(item.id ?? idx)}
                className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-[#FF7A00]/40 hover:bg-white/[0.025] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left detail */}
                <div
                  onClick={() => onOpenInvestigation(String(item.id ?? ''))}
                  className="space-y-2 flex-1 cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono text-[#FF7A00] font-bold">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] text-[#A3A3A3] border border-white/[0.06]">
                      {formatDomain(item.domain as string)}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${resStatusColor}`}>
                      {resStatus}
                    </span>
                    {item.isLocal && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        Local Guest
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-[#FF9D3D] transition-colors leading-snug">
                    {item.question ?? 'Untitled Investigation'}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#8A8A8A] line-clamp-2 max-w-3xl leading-relaxed">
                    {item.finalConclusion || item.analysis || 'Investigation concluded with verified findings.'}
                  </p>
                </div>

                {/* Right stats & actions */}
                <div className="flex items-center gap-5 self-start sm:self-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.05] w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8A8A8A] uppercase block">
                      Confidence
                    </span>
                    <span className="font-display font-bold text-base text-white">
                      {confidencePct}%
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs text-[#8A8A8A] hidden sm:block">
                    {formatDate(item.createdAt ?? item.updatedAt)}
                  </div>

                  <span className={`status-pill ${
                    isCompleted ? 'status-completed' : 'status-running'
                  }`}>
                    {statusStr.toUpperCase()}
                  </span>

                  {item.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteInvestigation(String(item.id));
                      }}
                      className="text-xs text-[#555555] hover:text-red-400 p-1.5 rounded transition-colors"
                      title="Delete record"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-2xl bg-[#0A0A0A] border border-dashed border-white/10 text-center space-y-2">
          <div className="text-base text-white font-semibold">No investigations yet.</div>
          <div className="text-xs text-[#8A8A8A] max-w-sm mx-auto">
            Submit a question from the workspace to begin your first autonomous investigation.
          </div>
        </div>
      )}
    </div>
  );
}
