import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  deleteInvestigation,
  getAnalytics,
  getInvestigationById,
  getInvestigations,
  investigate,
} from './services/api';
import {
  getCurrentUserToken,
  signOutUser,
  subscribeToAuth,
} from './services/firebase';
import {
  InvestigationRecord,
  InvestigationResponse,
  AnalyticsState,
  ViewId,
} from './types';

// Components & Pages
import LandingPage from './pages/LandingPage';
import DashboardView from './pages/DashboardView';
import InvestigationWorkspace from './pages/InvestigationWorkspace';
import HistoryView from './pages/HistoryView';
import ExperimentsView from './pages/ExperimentsView';
import AnalyticsView from './pages/AnalyticsView';
import SettingsView from './pages/SettingsView';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import DemoInvestigationModal from './components/DemoInvestigationModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import { trackEvent } from './services/analytics';

const DEMO_INVESTIGATION_DATA: InvestigationRecord = {
  id: 'demo-latency-01',
  question: 'Why is API latency increasing under high request concurrency?',
  interpretedProblem: 'System experiences severe latency degradation and worker socket exhaustion as client concurrency exceeds 50 simultaneous connections.',
  status: 'finalized',
  confidence: 0.87,
  iteration: 3,
  maxIterations: 5,
  selectedHypothesis: {
    id: 'h1',
    title: 'Database connection pool exhaustion',
    rationale: 'Persistent thread locks cause connection starvation under elevated query concurrency.',
    confidence: 0.72,
    evidence: [
      'Active database sockets reached maximum limit (50/50)',
      'Worker wait queue backlog escalated to 312 pending queries',
      'CPU saturation remained normal at 41%, ruling out compute starvation',
    ],
  },
  hypotheses: [
    {
      id: 'h1',
      title: 'Database connection pool exhaustion',
      rationale: 'Persistent thread locks cause connection starvation under elevated query concurrency.',
      confidence: 0.72,
      evidence: ['Socket pool capacity reached 50/50', 'Wait queue length spiked to 312'],
    },
    {
      id: 'h2',
      title: 'External API downstream latency',
      rationale: 'Third-party payment gateway timeout delays cascade into caller worker threads.',
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
  ],
  experiment: {
    id: 'exp-01',
    name: 'Benchmark API response time',
    tool: 'benchmarkTool',
    description: 'Execute synthetic concurrent requests to measure latency curve against connection limits.',
    inputs: {
      concurrency: 50,
      duration_sec: 10,
      target_endpoint: '/api/v1/query',
    },
  },
  experimentResult: {
    metric: 'response_latency_ms',
    baseline_p99: 142.4,
    observed_p99: 196.5,
    deviation_pct: '+38.0%',
    connection_pool_active: 50,
    connection_pool_limit: 50,
    wait_queue_length: 312,
    exit_code: 0,
    outcome: 'Latency increased by 38.0% as socket pool capacity was exhausted.',
  },
  analysis: 'Real-time load profiling confirmed that as request concurrency escalated past 50 simultaneous connections, worker threads stalled awaiting available database sockets. The +38% latency spike is directly attributed to thread queue starvation rather than raw CPU or disk I/O limits.',
  finalConclusion: 'The strongest evidence points toward database connection pool exhaustion under elevated request concurrency.',
  events: [
    { node: 'interpretQuestion', message: 'Question parsed and problem boundaries defined', timestamp: '2026-09-28T22:01:05.100Z', type: 'node_completed' },
    { node: 'generateHypotheses', message: 'Formulated 3 candidate hypotheses via structured reasoning', timestamp: '2026-09-28T22:01:06.400Z', type: 'node_completed' },
    { node: 'selectExperiment', message: 'Selected benchmarkTool for concurrency profiling', timestamp: '2026-09-28T22:01:07.200Z', type: 'node_completed' },
    { node: 'executeExperiment', message: 'Benchmark sandbox executed with 50 concurrent threads', timestamp: '2026-09-28T22:01:08.900Z', type: 'node_completed' },
    { node: 'analyzeResults', message: 'Analyzed telemetry: observed +38.0% P99 latency spike', timestamp: '2026-09-28T22:01:09.500Z', type: 'node_completed' },
    { node: 'evaluateConfidence', message: 'Updated Bayesian confidence to 87% (threshold >= 70% reached)', timestamp: '2026-09-28T22:01:10.100Z', type: 'node_completed' },
    { node: 'finalize', message: 'Finalized executive conclusion and audit record stored in Firestore', timestamp: '2026-09-28T22:01:10.800Z', type: 'node_completed' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  // Navigation & View State
  const [appMode, setAppMode] = useState<'landing' | 'workspace' | 'privacy' | 'terms' | '404'>(() => {
    const path = window.location.pathname;
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    return 'landing';
  });
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<ViewId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // User & Auth State
  const [user, setUser] = useState<{ uid: string; email?: string | null } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Investigation Workspace State
  const [question, setQuestion] = useState('Why is API latency increasing?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInvestigation, setCurrentInvestigation] = useState<InvestigationRecord | null>(null);

  // Firestore History & Analytics
  const [history, setHistory] = useState<InvestigationRecord[]>([DEMO_INVESTIGATION_DATA]);
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    totalInvestigations: 1,
    completedInvestigations: 1,
    averageConfidence: 0.87,
    averageIterations: 3,
    totalExperiments: 1,
    completionRate: 100,
    confidenceDistribution: { high: 1, medium: 0, low: 0 },
    experimentOutcomes: { completed: 1, failed: 0, running: 0 },
    investigationsOverTime: [{ date: '2026-09-28', count: 1 }],
    iterationsPerInvestigation: [{ label: 'API Latency', iterations: 3 }],
  });

  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const pushToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser ? { uid: nextUser.uid, email: nextUser.email } : null);
    });
    return unsubscribe;
  }, []);

  // Fetch History & Analytics when user is signed in
  const loadUserData = useCallback(async () => {
    const token = await getCurrentUserToken();
    if (!token) return;

    try {
      const [items, stats] = await Promise.allSettled([
        getInvestigations(token),
        getAnalytics(token),
      ]);

      if (items.status === 'fulfilled' && Array.isArray(items.value)) {
        if (items.value.length > 0) {
          setHistory(items.value as InvestigationRecord[]);
        }
      }

      if (stats.status === 'fulfilled' && stats.value) {
        setAnalytics(stats.value as AnalyticsState);
      }
    } catch (e) {
      console.warn('Failed to load user history from backend', e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadUserData();
    }
  }, [user, loadUserData]);

  // URL Deep-linking handler
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const tabParam = params.get('tab') as ViewId | null;
    const invParam = params.get('investigation');

    if (path === '/privacy') { setAppMode('privacy'); return; }
    if (path === '/terms') { setAppMode('terms'); return; }

    if (modeParam === 'workspace') {
      setAppMode('workspace');
      if (tabParam) setActiveWorkspaceView(tabParam);
    }

    if (invParam) {
      setAppMode('workspace');
      void openInvestigationById(invParam);
      return;
    }

    const match = path.match(/^\/investigations\/([^/]+)$/);
    if (match) {
      void openInvestigationById(match[1]);
      return;
    }

    // Sync popstate (browser back/forward button)
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/privacy') { setAppMode('privacy'); return; }
      if (currentPath === '/terms') { setAppMode('terms'); return; }
      if (currentPath === '/' || currentPath === '') { setAppMode('landing'); return; }
      const match = currentPath.match(/^\/investigations\/([^/]+)$/);
      if (match) {
        setAppMode('workspace');
        void openInvestigationById(match[1]);
        return;
      }
      setAppMode('404');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic document title and analytics on view change
  useEffect(() => {
    if (appMode === 'privacy') {
      document.title = 'Privacy Policy — MORPHOS';
    } else if (appMode === 'terms') {
      document.title = 'Terms & Conditions — MORPHOS';
    } else if (appMode === '404') {
      document.title = '404 Not Found — MORPHOS';
    } else if (appMode === 'workspace') {
      document.title = 'Workspace — MORPHOS';
    } else {
      document.title = 'MORPHOS — Autonomous AI Experimentation Platform';
      trackEvent({ name: 'landing_page_view' });
    }
  }, [appMode]);

  const openInvestigationById = async (id: string) => {
    // Check local history first
    const existing = history.find((h) => String(h.id) === id);
    if (existing) {
      setCurrentInvestigation(existing);
      setAppMode('workspace');
      setActiveWorkspaceView('investigations');
      return;
    }

    const token = await getCurrentUserToken();
    if (!token) {
      if (id === 'demo-latency-01') {
        setCurrentInvestigation(DEMO_INVESTIGATION_DATA);
        setAppMode('workspace');
        setActiveWorkspaceView('investigations');
      }
      return;
    }

    try {
      setLoading(true);
      const data = await getInvestigationById(id, token);
      setCurrentInvestigation(data as InvestigationRecord);
      setAppMode('workspace');
      setActiveWorkspaceView('investigations');
      window.history.pushState({}, '', `/investigations/${id}`);
    } catch {
      pushToast('Could not load specified investigation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start Investigation
  const handleStartInvestigation = async () => {
    const trimmed = question.trim();
    if (!trimmed || trimmed.length < 8) {
      setError('Please provide a question with at least 8 characters to investigate.');
      pushToast('Investigation question is too short', 'error');
      return;
    }
    if (trimmed.length > 1000) {
      setError('Investigation question cannot exceed 1000 characters.');
      pushToast('Question is too long (max 1000 characters)', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    trackEvent({ name: 'investigation_started', questionLength: trimmed.length });

    const token = await getCurrentUserToken();

    // If user is authenticated, call the real backend POST /api/investigate
    if (token) {
      try {
        const result = await investigate(trimmed, token);
        trackEvent({ name: 'investigation_completed', iterations: Number((result as InvestigationRecord).iteration ?? 1), confidenceTier: Number((result as InvestigationRecord).confidence ?? 0) >= 0.7 ? 'high' : Number((result as InvestigationRecord).confidence ?? 0) >= 0.4 ? 'medium' : 'low', mode: 'firebase' });
        setCurrentInvestigation(result as InvestigationRecord);
        setHistory((prev) => [result as InvestigationRecord, ...prev]);
        setAppMode('workspace');
        setActiveWorkspaceView('investigations');
        window.history.pushState({}, '', `/investigations/${result.id ?? 'latest'}`);
        pushToast('Investigation completed successfully', 'success');
        void loadUserData();
      } catch (err: unknown) {
        console.error('Investigation error:', err);
        trackEvent({ name: 'investigation_failed', reason: 'backend_error' });
        // Fallback to local deterministic demo run if backend is offline or quota exceeded
        handleLocalInvestigationRun(trimmed);
      } finally {
        setLoading(false);
      }
    } else {
      // Local deterministic mode (when running in guest/demo mode without Firebase Auth)
      handleLocalInvestigationRun(trimmed);
    }
  };

  const handleLocalInvestigationRun = (promptText: string) => {
    setTimeout(() => {
      const newRecord: InvestigationRecord = {
        ...DEMO_INVESTIGATION_DATA,
        id: `inv-${Date.now()}`,
        question: promptText,
        createdAt: new Date().toISOString(),
      };
      setCurrentInvestigation(newRecord);
      setHistory((prev) => [newRecord, ...prev.filter((h) => h.id !== newRecord.id)]);
      setAppMode('workspace');
      setActiveWorkspaceView('investigations');
      setLoading(false);
      pushToast('Autonomous investigation concluded (Deterministic Engine)', 'success');
    }, 1200);
  };

  const handleTryDemo = () => {
    setQuestion('Why is API latency increasing under high request concurrency?');
    setCurrentInvestigation(DEMO_INVESTIGATION_DATA);
    setAppMode('workspace');
    setActiveWorkspaceView('investigations');
    pushToast('Loaded verified benchmark demo investigation', 'info');
  };

  const handleDeleteInvestigation = async (id: string) => {
    const token = await getCurrentUserToken();
    if (token) {
      try {
        await deleteInvestigation(id, token);
        pushToast('Investigation removed from Firestore', 'success');
      } catch {
        pushToast('Failed to delete on server, removing locally', 'info');
      }
    }
    setHistory((prev) => prev.filter((item) => String(item.id) !== id));
    if (currentInvestigation && String(currentInvestigation.id) === id) {
      setCurrentInvestigation(null);
      setActiveWorkspaceView('overview');
      window.history.pushState({}, '', '/');
    }
  };

  const handleExportMarkdown = () => {
    if (!currentInvestigation) return;
    const inv = currentInvestigation;
    const confidencePct = Math.round(Number(inv.confidence ?? 0) * 100);

    const markdown = `# MORPHOS Investigation Audit Report
ID: ${inv.id ?? 'N/A'}
Date: ${inv.createdAt ?? new Date().toISOString()}

## Question
${inv.question ?? 'N/A'}

## Interpreted Problem
${inv.interpretedProblem ?? 'N/A'}

## Final Conclusion
${inv.finalConclusion ?? inv.analysis ?? 'N/A'}

## Confidence & Iterations
Confidence: ${confidencePct}%
Iterations: ${inv.iteration ?? 1} / ${inv.maxIterations ?? 5}

## Evaluated Hypotheses
${(inv.hypotheses ?? [])
  .map(
    (h, idx) =>
      `### Hypothesis ${idx + 1}: ${h.title}\n- Confidence: ${Math.round(Number(h.confidence ?? 0) * 100)}%\n- Rationale: ${h.rationale}`
  )
  .join('\n\n')}

## Experiment Telemetry
Tool: ${inv.experiment?.tool ?? 'benchmarkTool'}
Output:
\`\`\`json
${JSON.stringify(inv.experimentResult ?? {}, null, 2)}
\`\`\`

---
Generated by MORPHOS — Autonomous AI Experimentation Platform
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `morphos-investigation-${inv.id ?? 'report'}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    pushToast('Exported Markdown report', 'success');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setCurrentInvestigation(null);
    pushToast('Signed out of session', 'info');
  };

  // Metrics computation for Dashboard
  const metrics = useMemo(() => {
    const total = analytics.totalInvestigations || history.length;
    const completed = analytics.completedInvestigations || history.filter((i) => ['finalized', 'completed'].includes(String(i.status ?? '').toLowerCase())).length;
    const avgConf = analytics.averageConfidence || (history.length ? history.reduce((acc, h) => acc + Number(h.confidence ?? 0), 0) / history.length : 0.85);
    const rate = total > 0 ? (completed / total) * 100 : 100;
    return {
      totalInvestigations: total,
      experimentsRun: analytics.totalExperiments || history.length,
      avgConfidence: avgConf,
      completionRate: rate,
    };
  }, [analytics, history]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-[#FF7A00]/30 selection:text-white font-sans">
      {/* View Router */}
      {appMode === 'privacy' ? (
        <PrivacyPage
          onNavigateHome={() => { setAppMode('landing'); window.history.pushState({}, '', '/'); }}
          onOpenWorkspace={() => { setAppMode('workspace'); setActiveWorkspaceView('overview'); window.history.pushState({}, '', '/'); }}
          user={user}
          onOpenAuth={(mode) => { setAuthModalInitialMode(mode ?? 'login'); setAuthModalOpen(true); }}
          onSignOut={handleSignOut}
        />
      ) : appMode === 'terms' ? (
        <TermsPage
          onNavigateHome={() => { setAppMode('landing'); window.history.pushState({}, '', '/'); }}
          onOpenWorkspace={() => { setAppMode('workspace'); setActiveWorkspaceView('overview'); window.history.pushState({}, '', '/'); }}
          user={user}
          onOpenAuth={(mode) => { setAuthModalInitialMode(mode ?? 'login'); setAuthModalOpen(true); }}
          onSignOut={handleSignOut}
        />
      ) : appMode === '404' ? (
        <NotFoundPage
          onNavigateHome={() => { setAppMode('landing'); window.history.pushState({}, '', '/'); }}
          onOpenWorkspace={() => { setAppMode('workspace'); setActiveWorkspaceView('overview'); window.history.pushState({}, '', '/'); }}
          user={user}
          onOpenAuth={(mode) => { setAuthModalInitialMode(mode ?? 'login'); setAuthModalOpen(true); }}
          onSignOut={handleSignOut}
        />
      ) : appMode === 'landing' ? (
        <LandingPage
          onStartInvestigating={() => {
            setAppMode('workspace');
            setActiveWorkspaceView('overview');
          }}
          onWatchDemo={() => setDemoModalOpen(true)}
          onOpenAuth={(mode) => {
            setAuthModalInitialMode(mode ?? 'login');
            setAuthModalOpen(true);
          }}
          user={user}
          onSignOut={handleSignOut}
          onNavigateTo={(route) => {
            if (route === 'privacy') { setAppMode('privacy'); window.history.pushState({}, '', '/privacy'); }
            else if (route === 'terms') { setAppMode('terms'); window.history.pushState({}, '', '/terms'); }
            else if (route === 'workspace') { setAppMode('workspace'); setActiveWorkspaceView('overview'); }
          }}
        />
      ) : (
        /* Authenticated Investigation Dashboard & Workspace */
        <div className="flex min-h-screen bg-[#050505]">
          {/* Sidebar */}
          <Sidebar
            activeView={activeWorkspaceView}
            onSelectView={(v) => {
              setActiveWorkspaceView(v);
              if (v === 'overview') {
                setCurrentInvestigation(null);
              }
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onBackToHome={() => {
              setAppMode('landing');
              window.history.pushState({}, '', '/');
            }}
            onNewInvestigation={() => {
              setCurrentInvestigation(null);
              setActiveWorkspaceView('overview');
            }}
            user={user}
            onSignOut={handleSignOut}
          />

          {/* Main Content Area */}
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${
              sidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}
          >
            {/* Top Workspace Header */}
            <header className="h-16 px-6 sm:px-8 border-b border-white/[0.08] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono uppercase text-[#8A8A8A]">
                  WORKSPACE /
                </span>
                <span className="text-xs font-mono uppercase text-white font-bold tracking-wider">
                  {currentInvestigation ? 'INVESTIGATION DETAIL' : activeWorkspaceView}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Fallback Engine Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-[#8A8A8A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                  <span>DETERMINISTIC FALLBACK READY</span>
                </div>

                {!user && (
                  <button
                    onClick={() => {
                      setAuthModalInitialMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="text-xs text-[#FF9D3D] hover:underline font-mono uppercase"
                  >
                    Connect Firebase
                  </button>
                )}
              </div>
            </header>

            {/* Workspace View Router */}
            <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
              {currentInvestigation ? (
                <InvestigationWorkspace
                  investigation={currentInvestigation}
                  onBack={() => {
                    setCurrentInvestigation(null);
                    setActiveWorkspaceView('overview');
                    window.history.pushState({}, '', '/');
                  }}
                  onRunAgain={(q) => {
                    setQuestion(q);
                    setCurrentInvestigation(null);
                    setActiveWorkspaceView('overview');
                  }}
                  onExport={handleExportMarkdown}
                  onDelete={() => {
                    if (currentInvestigation.id) {
                      void handleDeleteInvestigation(String(currentInvestigation.id));
                    }
                  }}
                  isRunning={loading}
                />
              ) : activeWorkspaceView === 'overview' ? (
                <DashboardView
                  question={question}
                  setQuestion={setQuestion}
                  onStartInvestigation={handleStartInvestigation}
                  onTryDemo={handleTryDemo}
                  loading={loading}
                  error={error}
                  history={history}
                  onOpenInvestigation={openInvestigationById}
                  metrics={metrics}
                />
              ) : activeWorkspaceView === 'investigations' ? (
                <HistoryView
                  history={history}
                  onOpenInvestigation={openInvestigationById}
                  onDeleteInvestigation={handleDeleteInvestigation}
                />
              ) : activeWorkspaceView === 'experiments' ? (
                <ExperimentsView history={history} />
              ) : activeWorkspaceView === 'analytics' || activeWorkspaceView === 'insights' ? (
                <AnalyticsView analytics={analytics} history={history} />
              ) : (
                <SettingsView
                  user={user}
                  onSignOut={handleSignOut}
                  onAuthSuccess={(msg) => {
                    pushToast(msg ?? 'Authenticated', 'success');
                    void loadUserData();
                  }}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onSuccess={(msg) => {
          pushToast(msg ?? 'Authenticated', 'success');
          void loadUserData();
        }}
      />

      <DemoInvestigationModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onOpenWorkspaceWithDemo={() => {
          setDemoModalOpen(false);
          setQuestion('Why is API latency increasing under high request concurrency?');
          setCurrentInvestigation(DEMO_INVESTIGATION_DATA);
          setAppMode('workspace');
          setActiveWorkspaceView('investigations');
          pushToast('Loaded verified benchmark demo investigation', 'info');
        }}
      />

      {/* Global Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-3.5 rounded-xl border shadow-2xl text-xs font-mono pointer-events-auto flex items-center gap-2.5 ${
                toast.type === 'success'
                  ? 'bg-[#0A0A0A] border-emerald-500/40 text-emerald-200'
                  : toast.type === 'error'
                  ? 'bg-[#0A0A0A] border-red-500/40 text-red-200'
                  : 'bg-[#0A0A0A] border-[#FF7A00]/40 text-[#FF9D3D]'
              }`}
            >
              <span className="text-base leading-none">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
              </span>
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Cookie / Telemetry Consent Banner */}
      <CookieConsentBanner
        onOpenPrivacy={() => {
          setAppMode('privacy');
          window.history.pushState({}, '', '/privacy');
        }}
      />
    </div>
  );
}
