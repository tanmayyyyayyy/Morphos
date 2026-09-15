import { useEffect, useMemo, useState } from 'react';
import { getInvestigations, investigate, InvestigationResponse } from '../services/api';
import { signInEmail, signOutUser, signUpEmail, subscribeToAuth } from '../services/firebase';

const demoQuestions = [
  'Why is API latency increasing?',
  'Why does database performance degrade with increasing traffic?',
  'Why is memory usage growing over time?',
  'Why does processing time increase dramatically as dataset size grows?',
];

const statusColors: Record<string, string> = {
  idle: 'bg-slate-700 text-slate-100',
  interpreted: 'bg-sky-600 text-white',
  hypotheses_ready: 'bg-indigo-600 text-white',
  experiment_selected: 'bg-violet-600 text-white',
  experiment_running: 'bg-amber-500 text-slate-950',
  analyzed: 'bg-emerald-600 text-white',
  finalized: 'bg-fuchsia-600 text-white',
  confidence_high: 'bg-emerald-500 text-white',
  confidence_low: 'bg-orange-500 text-white',
};

export default function Dashboard() {
  const [question, setQuestion] = useState('What should I investigate?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authStatus, setAuthStatus] = useState('');
  const [user, setUser] = useState<{ uid: string; email?: string | null } | null>(null);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser ? { uid: nextUser.uid, email: nextUser.email ?? undefined } : null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    getInvestigations(user.uid)
      .then((items) => setHistory(items))
      .catch(() => setHistory([]));
  }, [user]);

  async function handleAuth() {
    try {
      if (authMode === 'register') {
        await signUpEmail(authEmail, authPassword);
      } else {
        await signInEmail(authEmail, authPassword);
      }
      setAuthStatus('Authentication successful.');
      setAuthPassword('');
    } catch (err) {
      setAuthStatus(err instanceof Error ? err.message : 'Authentication failed.');
    }
  }

  async function handleLogout() {
    await signOutUser();
    setUser(null);
    setAuthStatus('Logged out.');
  }

  async function handleStart() {
    const trimmed = question.trim();
    if (!trimmed || trimmed === 'What should I investigate?') {
      setError('Enter a technical investigation question first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const investigation = await investigate(trimmed);
      setResult(investigation);
    } catch (err) {
      setError('The investigation failed. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  const timeline = useMemo(() => {
    const events = result?.events ?? [
      { message: 'Question interpreted' },
      { message: 'Hypotheses generated' },
      { message: 'Experiment selected' },
      { message: 'Running experiment' },
      { message: 'Analyze results' },
      { message: 'Final conclusion' },
    ];
    return events.map((event, index) => {
      const message = typeof event === 'string' ? event : event.message;
      const active = index <= (result ? Math.min(result.events.length - 1, 3) : 2);
      return { event: message, active };
    });
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <header className="mb-10 flex flex-col gap-6 border-b border-slate-800 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="badge">MORPHOS</span>
              <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Autonomous AI Experimentation Platform</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">An AI system that learns by experimenting.</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            {user ? `Signed in as ${user.email ?? 'demo user'}` : 'Live investigation mode'}
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Authentication</label>
                {user ? (
                  <button onClick={handleLogout} className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100">Log out</button>
                ) : null}
              </div>

              {!user ? (
                <div className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100" />
                  <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} type="password" placeholder="Password" className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100" />
                  <div className="flex gap-2">
                    <button onClick={() => setAuthMode('login')} className={`rounded-xl px-3 py-2 text-sm ${authMode === 'login' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-100'}`}>Login</button>
                    <button onClick={() => setAuthMode('register')} className={`rounded-xl px-3 py-2 text-sm ${authMode === 'register' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-100'}`}>Register</button>
                  </div>
                </div>
              ) : null}

              {!user ? (
                <button onClick={handleAuth} className="mb-3 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm text-sky-100">
                  {authMode === 'login' ? 'Login to Firebase' : 'Create account'}
                </button>
              ) : null}

              {authStatus ? <div className="mb-3 text-sm text-slate-300">{authStatus}</div> : null}

              <label className="mb-3 block text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Current investigation</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-base text-slate-100 outline-none ring-0 transition focus:border-sky-500"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="rounded-xl bg-sky-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Running...' : 'Start Investigation'}
                </button>
                <button
                  onClick={() => setQuestion(demoQuestions[0])}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-medium text-slate-100 hover:border-slate-500"
                >
                  Try Demo
                </button>
              </div>

              {error && <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
            </div>

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Agent timeline</h2>
                <span className="badge">Stateful workflow</span>
              </div>
              <div className="space-y-4">
                {timeline.map(({ event, active }, index) => (
                  <div key={event + index} className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        active ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {active ? '✓' : index < 3 ? '○' : '○'}
                    </div>
                    <div className="text-sm text-slate-200">{event}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Current hypothesis</h2>
                <span className="badge">{result?.selectedHypothesis ? 'Selected' : 'Pending'}</span>
              </div>
              {result?.selectedHypothesis ? (
                <div className="space-y-3">
                  <div className="text-xl font-semibold text-sky-200">{result.selectedHypothesis.title}</div>
                  <p className="text-slate-300">{result.selectedHypothesis.rationale}</p>
                  <div className="text-sm text-slate-400">Confidence: {(result.selectedHypothesis.confidence * 100).toFixed(0)}%</div>
                </div>
              ) : (
                <p className="text-slate-500">No hypothesis selected yet.</p>
              )}
            </div>

            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Investigation history</h2>
                <span className="badge">{history.length}</span>
              </div>
              {history.length ? (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button key={String(item.id ?? Math.random())} onClick={() => setResult(item as unknown as InvestigationResponse)} className="block w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sky-200">{String(item.question ?? 'Investigation')}</span>
                        <span className="text-xs text-slate-400">{String(item.createdAt ?? '')}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                        <span>Confidence: {String(item.confidence ?? '0')}</span>
                        <span>•</span>
                        <span>{String(item.status ?? 'unknown')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No saved investigations yet. Sign in and run an investigation to populate history.</p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="card">
              <h2 className="mb-3 text-lg font-semibold text-white">Experiment</h2>
              {result?.experiment ? (
                <div className="space-y-3">
                  <div className="text-xl font-semibold text-violet-200">{result.experiment.name}</div>
                  <p className="text-slate-300">{result.experiment.description}</p>
                  <div className="rounded-xl bg-slate-950/80 p-3 text-sm text-slate-300">
                    <div>Tool: {result.experiment.tool}</div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-sky-200">{JSON.stringify(result.experiment.inputs, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No active experiment.</p>
              )}
            </div>

            <div className="card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Result</h2>
                {result?.status ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[result.status] ?? 'bg-slate-700'}`}>{result.status}</span> : null}
              </div>
              {result?.experimentResult ? (
                <pre className="overflow-auto rounded-xl bg-slate-950/80 p-3 text-xs text-emerald-200">{JSON.stringify(result.experimentResult, null, 2)}</pre>
              ) : (
                <p className="text-slate-500">No result yet.</p>
              )}
            </div>

            <div className="card">
              <h2 className="mb-3 text-lg font-semibold text-white">Confidence</h2>
              <div className="mb-3 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"
                  style={{ width: `${Math.min(100, (result?.confidence ?? 0) * 100)}%` }}
                />
              </div>
              <div className="text-2xl font-bold text-white">{((result?.confidence ?? 0) * 100).toFixed(0)}%</div>
            </div>

            <div className="card">
              <h2 className="mb-3 text-lg font-semibold text-white">Final conclusion</h2>
              <p className="text-slate-300">{result?.finalConclusion || 'The platform will present the final conclusion once the workflow completes.'}</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
