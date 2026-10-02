import { useState, useEffect } from 'react';
import { getAnalyticsConsent, setAnalyticsConsent } from '../services/analytics';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export default function CookieConsentBanner({ onOpenPrivacy }: CookieConsentBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only display if user hasn't made a choice yet
    const existing = getAnalyticsConsent();
    if (existing === null) {
      // Small delay so it smoothly appears after initial render
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Storage and Telemetry Consent"
      className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-xs text-[#CCCCCC] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-2 h-2 rounded-full bg-[#FF7A00] mt-1.5 flex-shrink-0 animate-pulse" />
        <div>
          <h2 className="font-mono text-xs uppercase tracking-wider text-white font-bold mb-1">
            Telemetry &amp; Local Storage
          </h2>
          <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
            MORPHOS uses local storage strictly for Firebase session persistence and optional anonymous diagnostic telemetry. We do not use third-party advertising cookies or track sensitive query text. Read our{' '}
            <button
              onClick={onOpenPrivacy}
              className="text-[#FF7A00] hover:underline underline-offset-2"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
        <button
          onClick={handleDecline}
          className="px-3.5 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono uppercase tracking-wider text-[#8A8A8A] hover:text-white hover:border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
        >
          Reject Optional
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-1.5 rounded-lg bg-white text-black text-[11px] font-mono uppercase tracking-wider font-bold hover:bg-neutral-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
        >
          Accept
        </button>
      </div>
    </aside>
  );
}
