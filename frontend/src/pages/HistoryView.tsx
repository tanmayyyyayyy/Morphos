import { useState, useMemo } from 'react';
import { InvestigationRecord } from '../types';

interface HistoryViewProps {
  history: InvestigationRecord[];
  onOpenInvestigation: (id: string) => void;
  onDeleteInvestigation: (id: string) => void;
}

export default function HistoryView({
  history,
  onOpenInvestigation,
  onDeleteInvestigation,
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            INVESTIGATION HISTORY
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">
            {history.length} RECORDS IN FIRESTORE DATABASE
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
            placeholder="Search questions, hypotheses, conclusions..."
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

      {/* Investigation Records */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item, idx) => {
            const confidencePct = Math.round(Number(item.confidence ?? 0) * (item.confidence && item.confidence <= 1 ? 100 : 1));
            const statusStr = String(item.status ?? 'completed').toLowerCase();
            const isCompleted = statusStr === 'finalized' || statusStr === 'completed';

            return (
              <div
                key={String(item.id ?? idx)}
                className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-[#FF7A00]/40 hover:bg-white/[0.025] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left detail */}
                <div
                  onClick={() => onOpenInvestigation(String(item.id ?? ''))}
                  className="space-y-1.5 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#FF7A00] font-bold">
                      #{idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#FF9D3D] transition-colors">
                      {item.question ?? 'Untitled Investigation'}
                    </h3>
                  </div>

                  <p className="text-xs text-[#8A8A8A] line-clamp-1 max-w-2xl">
                    {item.finalConclusion || item.analysis || 'Investigation concluded with verified telemetry.'}
                  </p>
                </div>

                {/* Right stats & actions */}
                <div className="flex items-center gap-6 self-start sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05] w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8A8A8A] uppercase block">
                      Confidence
                    </span>
                    <span className="font-display font-bold text-sm text-white">
                      {confidencePct}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8A8A8A] uppercase block">
                      Iterations
                    </span>
                    <span className="font-display font-bold text-sm text-white">
                      {item.iteration ?? 1}
                    </span>
                  </div>

                  <span className={`status-pill ${
                    isCompleted ? 'status-completed' : 'status-running'
                  }`}>
                    {statusStr.toUpperCase()}
                  </span>

                  <div className="text-right font-mono text-[11px] text-[#555555] hidden md:block">
                    {formatDate(item.createdAt ?? item.updatedAt)}
                  </div>

                  {item.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteInvestigation(String(item.id));
                      }}
                      className="text-xs text-[#555555] hover:text-red-400 p-1"
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
        <div className="p-12 rounded-2xl bg-[#0A0A0A] border border-dashed border-white/10 text-center space-y-2">
          <div className="text-sm text-white font-medium">No investigations found</div>
          <div className="text-xs text-[#8A8A8A]">
            Try changing your filter settings or execute a new query from the workspace.
          </div>
        </div>
      )}
    </div>
  );
}
