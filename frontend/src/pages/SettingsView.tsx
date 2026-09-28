import { useState } from 'react';
import { firebaseStatus, signInEmail, signUpEmail } from '../services/firebase';

interface SettingsViewProps {
  user: { uid: string; email?: string | null } | null;
  onSignOut: () => void;
  onAuthSuccess: (msg?: string) => void;
}

export default function SettingsView({ user, onSignOut, onAuthSuccess }: SettingsViewProps) {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setLoading(true);
    try {
      if (authMode === 'register') {
        await signUpEmail(authEmail, authPassword);
        onAuthSuccess('Registered and authenticated successfully');
      } else {
        await signInEmail(authEmail, authPassword);
        onAuthSuccess('Signed in successfully');
      }
      setAuthPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setStatusMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            PLATFORM SETTINGS
          </h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">
            IDENTITY, SECRETS, AND TELEMETRY CONFIGURATION
          </p>
        </div>
      </div>

      {/* User Identity Card */}
      <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
          AUTHENTICATED IDENTITY
        </h3>

        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center font-display font-bold text-lg text-white">
                {(user.email ?? 'U')[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {user.email ?? 'Authenticated Operator'}
                </div>
                <div className="text-xs font-mono text-[#8A8A8A]">
                  Firebase UID: {user.uid}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-mono">
                ✓ Cryptographic ID Token Active
              </span>
              <button
                onClick={onSignOut}
                className="btn-secondary py-2 px-4 text-xs font-mono uppercase"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#8A8A8A]">
              Currently running in anonymous guest / offline mode. Sign in with Firebase to persist investigations permanently across devices.
            </p>

            <form onSubmit={handleAuth} className="space-y-3 max-w-md">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-[#555555] text-xs focus:outline-none focus:border-[#FF7A00]"
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/10 text-white placeholder-[#555555] text-xs focus:outline-none focus:border-[#FF7A00]"
              />

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-2 px-5 text-xs uppercase font-bold"
                >
                  {loading ? 'Working…' : authMode === 'login' ? 'Sign In' : 'Register'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
                  className="text-xs text-[#8A8A8A] hover:text-white"
                >
                  Switch to {authMode === 'login' ? 'Register' : 'Login'}
                </button>
              </div>

              {statusMsg && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs">
                  {statusMsg}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* System Telemetry & Provider Status */}
      <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-white/10 space-y-4">
        <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
          PROVIDER TELEMETRY & RUNTIMES
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[#8A8A8A]">Firebase Client SDK</span>
            <span className="font-mono text-emerald-400">
              {firebaseStatus.configured ? 'Configured & Initialized' : 'Standby / Local Fallback'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[#8A8A8A]">Model Provider Loop</span>
            <span className="font-mono text-[#FF9D3D]">
              LangGraph Dual Engine (Gemini 3.6 Flash + Deterministic Sandbox)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[#8A8A8A]">Backend Express Endpoint</span>
            <span className="font-mono text-white">http://localhost:4000/api</span>
          </div>
        </div>
      </div>
    </div>
  );
}
