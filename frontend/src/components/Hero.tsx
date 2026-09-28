import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStartInvestigating: () => void;
  onWatchDemo: () => void;
}

export default function Hero({ onStartInvestigating, onWatchDemo }: HeroProps) {
  const [activeStep, setActiveStep] = useState(2); // Default to Experiment

  // Auto-cycle through workflow steps every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 5) + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const workflowSteps = [
    {
      num: '01',
      title: 'Interpret',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Hypothesize',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 18h6m-4 4h2a6 6 0 0 0 4-4.5 7 7 0 1 0-10 0A6 6 0 0 0 11 22z" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Experiment',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Analyze',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      num: '05',
      title: 'Learn',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
    },
  ];

  return (
    <section id="hero" className="relative min-h-[92vh] pt-28 pb-16 flex items-center overflow-hidden bg-[#050505]">
      {/* Background Subtle Grid & Radial Glow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Warm Orange Glow behind Center */}
        <div className="absolute top-1/2 left-[58%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#FF7A00]/12 blur-[130px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Text Content (col-span-6) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 pt-4"
          >
            {/* Eyebrow Label with Orange Accent Bar */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[#FF7A00] rounded-full shadow-[0_0_8px_rgba(255,122,0,0.8)]" />
              <span className="eyebrow tracking-[0.22em] text-[#8A8A8A]">
                AUTONOMOUS AI EXPERIMENTATION PLATFORM
              </span>
            </div>

            {/* Oversized Editorial Headline */}
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.25rem] tracking-tight leading-[1.05] text-[#F5F5F5]">
                <span className="block text-white tracking-[-0.03em] mb-2">- MORPHOS -</span>
                <span className="text-[#8A8A8A]">An AI system </span>
                <span className="text-[#555555]">that learns </span>
                <span className="text-[#F5F5F5]">by experimenting.</span>
              </h1>
            </div>

            {/* Secondary Description */}
            <p className="text-base sm:text-lg text-[#8A8A8A] leading-relaxed max-w-xl font-normal">
              Turn your questions into structured investigations. MORPHOS generates hypotheses,
              runs experiments, analyzes results, and learns — step by step.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onStartInvestigating}
                className="btn-primary py-3.5 px-8 text-sm tracking-wider uppercase font-bold group shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)]"
              >
                <span>Start an Investigation</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>

              <button
                onClick={onWatchDemo}
                className="btn-secondary py-3.5 px-7 text-sm tracking-wider uppercase font-medium flex items-center gap-2.5 hover:border-white/40"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">
                  ▶
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Minimal Stats Row */}
            <div className="pt-10 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  300+
                </div>
                <div className="text-xs text-[#8A8A8A] uppercase tracking-wider font-medium mt-1">
                  Investigations Run
                </div>
              </div>

              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  98%
                </div>
                <div className="text-xs text-[#8A8A8A] uppercase tracking-wider font-medium mt-1">
                  Workflow Success Rate
                </div>
              </div>

              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  10×
                </div>
                <div className="text-xs text-[#8A8A8A] uppercase tracking-wider font-medium mt-1">
                  Faster Problem Solving
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Robot Visual & HUD Details (col-span-6) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[500px] lg:min-h-[580px]"
          >
            {/* Orbital Rings & Halo Background behind Robot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer thin orbital line */}
              <div className="w-[440px] h-[440px] sm:w-[500px] h-[500px] rounded-full border border-[#FF7A00]/20 orbital-ring" />
              {/* Inner glowing ring */}
              <div className="absolute w-[360px] h-[360px] sm:w-[410px] h-[410px] rounded-full border border-[#FF7A00]/30 shadow-[0_0_35px_rgba(255,122,0,0.18)]" />
              {/* Soft radial glow */}
              <div className="absolute w-[280px] h-[280px] rounded-full bg-[#FF7A00]/15 blur-[60px]" />
            </div>

            {/* Futuristic Robot Image */}
            <div className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] aspect-square flex items-center justify-center">
              <picture className="w-full h-full">
                <source srcSet="/robot-hero.webp" type="image/webp" />
                <img
                  src="/robot-hero.jpg"
                  alt="MORPHOS Autonomous AI Agent"
                  width={460}
                  height={460}
                  className="w-full h-full object-cover rounded-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
              {/* Seamless Vignette Overlay to blend perfectly into pure black #050505 */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
            </div>


            {/* Floating Top Right: Workflow Steps (01-05) */}
            <div className="absolute right-0 top-4 sm:top-8 z-20 bg-[#0A0A0A]/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.8)] max-w-[200px] sm:max-w-[215px]">
              <div className="text-[9px] tracking-[0.16em] uppercase text-[#8A8A8A] font-semibold mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-[1.5px] bg-[#FF7A00]" />
                POWERED BY AI × CURIOSITY
              </div>

              <div className="space-y-2">
                {workflowSteps.map((step, idx) => {
                  const isCurrent = activeStep === idx + 1;
                  return (
                    <div
                      key={step.num}
                      onClick={() => setActiveStep(idx + 1)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-300 ${
                        isCurrent
                          ? 'bg-[#FF7A00]/10 border border-[#FF7A00]/40 text-white shadow-[0_0_12px_rgba(255,122,0,0.25)]'
                          : 'text-[#8A8A8A] hover:text-[#D4D4D4] hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-[#FF7A00]' : 'text-[#555555]'}`}>
                        {step.num}
                      </span>
                      <span className={`text-xs ${isCurrent ? 'text-[#FF7A00]' : 'text-[#8A8A8A]'}`}>
                        {step.icon}
                      </span>
                      <span className="text-xs font-medium tracking-wide">
                        {step.title}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Bottom Right: Our Tech Stack Icons */}
            <div className="absolute right-0 bottom-2 sm:bottom-4 z-20 bg-[#0A0A0A]/85 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-3.5 shadow-xl">
              <div className="text-[9px] tracking-[0.16em] uppercase text-[#8A8A8A] font-semibold mb-2.5">
                OUR TECH STACK
              </div>
              <div className="flex items-center gap-2">
                {/* React */}
                <div className="w-8 h-8 rounded-lg bg-[#0E1726] border border-[#00D8FF]/30 flex items-center justify-center text-[#00D8FF] text-xs font-bold shadow-sm" title="React 18">
                  ⚛
                </div>
                {/* TypeScript */}
                <div className="w-8 h-8 rounded-lg bg-[#18273F] border border-[#3178C6]/30 flex items-center justify-center text-[#3178C6] text-xs font-bold" title="TypeScript">
                  TS
                </div>
                {/* Node */}
                <div className="w-8 h-8 rounded-lg bg-[#122216] border border-[#539E43]/30 flex items-center justify-center text-[#539E43] text-xs font-bold" title="Node.js">
                  JS
                </div>
                {/* Python */}
                <div className="w-8 h-8 rounded-lg bg-[#1D212E] border border-[#FFD43B]/30 flex items-center justify-center text-[#FFD43B] text-xs font-bold" title="Python">
                  🐍
                </div>
                {/* Firebase */}
                <div className="w-8 h-8 rounded-lg bg-[#271E0B] border border-[#FFCA28]/30 flex items-center justify-center text-[#FFA000] text-xs font-bold" title="Firebase">
                  🔥
                </div>
                {/* GCP */}
                <div className="w-8 h-8 rounded-lg bg-[#1A1E29] border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] text-xs font-bold" title="Google Cloud">
                  ☁
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
