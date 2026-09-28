import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TechStrip from '../components/TechStrip';
import SecondSection from '../components/SecondSection';
import HowItWorks from '../components/HowItWorks';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';

interface LandingPageProps {
  onStartInvestigating: () => void;
  onWatchDemo: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  user: { uid: string; email?: string | null } | null;
  onSignOut: () => void;
  onNavigateTo?: (route: 'landing' | 'workspace' | 'privacy' | 'terms') => void;
}

export default function LandingPage({
  onStartInvestigating,
  onWatchDemo,
  onOpenAuth,
  user,
  onSignOut,
  onNavigateTo,
}: LandingPageProps) {

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-[#FF7A00]/30 selection:text-white">
      {/* Floating Navbar */}
      <Navbar
        currentView="landing"
        onNavigate={(view) => {
          if (view === 'dashboard') onStartInvestigating();
        }}
        user={user}
        onOpenAuth={onOpenAuth}
        onSignOut={onSignOut}
      />

      {/* Hero Section */}
      <Hero
        onStartInvestigating={onStartInvestigating}
        onWatchDemo={onWatchDemo}
      />

      {/* Technology Strip */}
      <TechStrip />

      {/* Built For A Smarter Tomorrow - AI Investigation For Everyone */}
      <SecondSection
        onExploreFeatures={() => {
          const el = document.getElementById('features');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onViewGitHub={() => {
          window.open('https://github.com', '_blank');
        }}
      />

      {/* How MORPHOS Thinks - LangGraph State Machine */}
      <HowItWorks />

      {/* Core Platform Capabilities */}
      <FeatureSection />

      {/* Architecture & Reliability Strip */}
      <section id="architecture" className="py-20 bg-[#0A0A0A] border-b border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7A00]/10 blur-[100px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono tracking-widest uppercase text-emerald-400 font-semibold">
                    ENTERPRISE FAULT-TOLERANCE
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                  Deterministic Fallback Architecture
                </h3>
                <p className="text-sm sm:text-base text-[#8A8A8A] max-w-2xl leading-relaxed">
                  When upstream LLM provider quotas or network latencies fluctuate, MORPHOS automatically engages its local deterministic engine. Your automated investigations never stall or fail silently.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <button
                  onClick={onStartInvestigating}
                  className="btn-primary py-3.5 px-8 text-xs uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Enter Workspace →
                </button>
                <button
                  onClick={onWatchDemo}
                  className="btn-secondary py-3.5 px-6 text-xs uppercase tracking-wider font-medium"
                >
                  Run Demo Investigation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        onNavigate={(v) => {
          if (v === 'dashboard') onStartInvestigating();
          else if (v === 'privacy') onNavigateTo?.('privacy');
          else if (v === 'terms') onNavigateTo?.('terms');
          else if (v === 'landing') onNavigateTo?.('landing');
        }}
      />
    </div>
  );
}

