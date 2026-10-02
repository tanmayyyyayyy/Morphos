/**
 * MORPHOS Privacy-Preserving Analytics Service
 *
 * Implements telemetry tracking respecting user consent.
 * Never transmits sensitive prompt contents or private keys.
 */

type AnalyticsEvent =
  | { name: 'landing_page_view' }
  | { name: 'sign_up'; method: 'email' }
  | { name: 'sign_in'; method: 'email' }
  | { name: 'investigation_started'; questionLength: number }
  | { name: 'investigation_completed'; iterations: number; confidenceTier: 'high' | 'medium' | 'low'; mode: 'firebase' | 'dev-fallback' }
  | { name: 'investigation_failed'; reason: string }
  | { name: 'demo_started' };

const CONSENT_STORAGE_KEY = 'morphos_analytics_consent';

export function getAnalyticsConsent(): boolean | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === 'granted') return true;
  if (stored === 'denied') return false;
  return null;
}

export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied');
  if (!granted) {
    console.info('ANALYTICS: Telemetry disabled by user preference.');
  } else {
    console.info('ANALYTICS: Telemetry enabled.');
  }
}

export function trackEvent(event: AnalyticsEvent): void {
  const consent = getAnalyticsConsent();
  // Strictly require explicit opt-in consent before tracking any event
  if (consent !== true) {
    return;
  }

  // Safe sanitized logging
  console.debug(`[Telemetry Event] ${event.name}`, {
    ...event,
    timestamp: new Date().toISOString(),
  });

  // If Firebase analytics or custom telemetry endpoint is attached in the future:
  try {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', event.name, event);
    }
  } catch {
    // Ignore external tracking failures silently
  }
}
