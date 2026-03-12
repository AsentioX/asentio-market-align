/**
 * ============================================================
 * ASENTIO ANALYTICS — Event Tracking Utility
 * ============================================================
 *
 * Architecture:
 *  - Sessions are created once per browser session (sessionStorage)
 *  - Events are inserted per interaction
 *  - Intent score is accumulated client-side and synced to the session row
 *  - All tracking is fire-and-forget (no awaiting in UI code)
 *
 * To edit:
 *  - Primary email:  CONTACT_EMAIL below
 *  - Scoring rules:  INTENT_SCORES object below
 *  - Event types:    EVENTS object below
 * ============================================================
 */

import { supabase } from '@/integrations/supabase/client';

// ── EDIT: your contact email ──────────────────────────────────
export const CONTACT_EMAIL = 'info@asentio.com';

// ── EDIT: intent score values per behavior ────────────────────
const INTENT_SCORES = {
  visited_services:    3,
  visited_about:       1,
  multi_page:          2,   // awarded when 2+ pages visited in session
  long_session:        2,   // awarded at 60s+ on site
  scroll_deep:         3,   // scroll 75%+ on services/case study page
  cta_click:           5,
  email_click:         8,
  form_start:          3,
  form_submit:        10,
  outbound_click:      1,
} as const;

// Intent level thresholds — EDIT to adjust sensitivity
const INTENT_THRESHOLDS = { medium: 4, high: 10 };

// ── Event type constants — EDIT to add new event types ────────
export const EVENTS = {
  PAGE_VIEW:        'page_view',
  CTA_CLICK:        'cta_click',
  EMAIL_CLICK:      'email_click',
  FORM_START:       'form_start',
  FORM_SUBMIT:      'form_submit',
  SCROLL_DEPTH:     'scroll_depth',
  OUTBOUND_CLICK:   'outbound_click',
  NAV_CLICK:        'nav_click',
  TIME_ON_PAGE:     'time_on_page',
  SECTION_ENGAGE:   'section_engage',
} as const;

// ─────────────────────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────────────────────

const SESSION_KEY = 'asentio_session_id';
const VISITOR_KEY = 'asentio_visitor_id';
const PAGE_COUNT_KEY = 'asentio_page_count';

let currentScore = 0;
let sessionId: string | null = null;

// Generate a random anonymous ID
function generateId(): string {
  return crypto.randomUUID();
}

// Visitor ID persists across sessions (localStorage)
function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) { id = generateId(); localStorage.setItem(VISITOR_KEY, id); }
  return id;
}

// Session ID lives for the browser tab session (sessionStorage)
function getSessionId(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

function setSessionId(id: string) {
  sessionStorage.setItem(SESSION_KEY, id);
  sessionId = id;
}

// Device type detection
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

// Parse UTM params from URL
function getUTMParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source:   p.get('utm_source')   || undefined,
    utm_medium:   p.get('utm_medium')   || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
    utm_content:  p.get('utm_content')  || undefined,
    utm_term:     p.get('utm_term')     || undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Session initialisation — call once per page load
// ─────────────────────────────────────────────────────────────

export async function initSession(): Promise<string> {
  // Reuse existing session if present
  const existing = getSessionId();
  if (existing) { sessionId = existing; return existing; }

  const visitorId = getVisitorId();
  const utms = getUTMParams();

  const { data, error } = await supabase
    .from('analytics_sessions')
    .insert({
      visitor_id:   visitorId,
      landing_page: window.location.pathname,
      referrer:     document.referrer || undefined,
      device_type:  getDeviceType(),
      user_agent:   navigator.userAgent.slice(0, 200),
      ...utms,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.warn('[analytics] session init failed', error);
    return '';
  }

  setSessionId(data.id);
  return data.id;
}

// ─────────────────────────────────────────────────────────────
// Intent scoring helpers
// ─────────────────────────────────────────────────────────────

function intentLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= INTENT_THRESHOLDS.high)   return 'high';
  if (score >= INTENT_THRESHOLDS.medium) return 'medium';
  return 'low';
}

async function addIntent(points: number) {
  currentScore += points;
  const sid = sessionId || getSessionId();
  if (!sid) return;

  await supabase
    .from('analytics_sessions')
    .update({
      intent_score: currentScore,
      intent_level: intentLevel(currentScore),
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', sid);
}

async function markConverted() {
  const sid = sessionId || getSessionId();
  if (!sid) return;
  await supabase
    .from('analytics_sessions')
    .update({ converted: true, last_seen_at: new Date().toISOString() })
    .eq('id', sid);
}

// ─────────────────────────────────────────────────────────────
// Core event logger
// ─────────────────────────────────────────────────────────────

export async function trackEvent(
  eventType: string,
  eventData?: Record<string, unknown>,
  pagePath?: string
) {
  const sid = sessionId || getSessionId();
  if (!sid) return;

  await supabase.from('analytics_events').insert({
    session_id:  sid,
    event_type:  eventType,
    page_path:   pagePath || window.location.pathname,
    event_data:  eventData || null,
  });
}

// ─────────────────────────────────────────────────────────────
// High-level tracking helpers — call these from page components
// ─────────────────────────────────────────────────────────────

/** Track a page view. Call in useEffect on mount. */
export function trackPageView(path?: string) {
  const p = path || window.location.pathname;

  // Increment page count for multi-page intent scoring
  const count = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || '0') + 1;
  sessionStorage.setItem(PAGE_COUNT_KEY, String(count));

  // Award multi-page bonus only once
  if (count === 2) addIntent(INTENT_SCORES.multi_page);

  // Award per-page intent
  if (p === '/services' || p.startsWith('/services')) addIntent(INTENT_SCORES.visited_services);
  if (p === '/about')                                  addIntent(INTENT_SCORES.visited_about);

  // Also fire GA4 if present
  if (typeof window.gtag === 'function') {
    window.gtag('config', 'G-YMVGV4MD6C', { page_path: p });
  }

  trackEvent(EVENTS.PAGE_VIEW, { path: p }, p);
}

/** Track a CTA button click.
 *  @param label  - the button text, e.g. "Start a Conversation"
 *  @param isConversion - true for email/form CTAs that are direct hire-intent
 */
export function trackCTAClick(label: string, isConversion = false) {
  addIntent(INTENT_SCORES.cta_click);
  if (isConversion) markConverted();
  trackEvent(EVENTS.CTA_CLICK, { label, is_conversion: isConversion });
}

/** Track an email link click — primary conversion event */
export function trackEmailClick(email = CONTACT_EMAIL) {
  addIntent(INTENT_SCORES.email_click);
  markConverted();
  trackEvent(EVENTS.EMAIL_CLICK, { email });
}

/** Track contact form first interaction */
export function trackFormStart(formName: string) {
  addIntent(INTENT_SCORES.form_start);
  trackEvent(EVENTS.FORM_START, { form: formName });
}

/** Track contact form successful submission — highest value conversion */
export function trackFormSubmit(formName: string) {
  addIntent(INTENT_SCORES.form_submit);
  markConverted();
  trackEvent(EVENTS.FORM_SUBMIT, { form: formName });
}

/** Track scroll depth — call at 25/50/75/100% thresholds */
export function trackScrollDepth(pct: number, page: string) {
  if (pct >= 75) addIntent(INTENT_SCORES.scroll_deep);
  trackEvent(EVENTS.SCROLL_DEPTH, { pct, page });
}

/** Track an outbound link click */
export function trackOutboundClick(url: string, label?: string) {
  addIntent(INTENT_SCORES.outbound_click);
  trackEvent(EVENTS.OUTBOUND_CLICK, { url, label });
}

/** Track a navigation menu click */
export function trackNavClick(label: string, dest: string) {
  trackEvent(EVENTS.NAV_CLICK, { label, dest });
}

/** Track time on page (call on page unmount with elapsed ms) */
export function trackTimeOnPage(ms: number, path: string) {
  if (ms > 60_000) addIntent(INTENT_SCORES.long_session);
  trackEvent(EVENTS.TIME_ON_PAGE, { ms, path }, path);
}

// ─────────────────────────────────────────────────────────────
// Scroll depth tracker hook helper — attach to window
// ─────────────────────────────────────────────────────────────

const SCROLL_THRESHOLDS = [25, 50, 75, 100];

export function createScrollTracker(path: string) {
  const fired = new Set<number>();

  return function onScroll() {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const pct = Math.round((scrolled / total) * 100);

    for (const t of SCROLL_THRESHOLDS) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        trackScrollDepth(t, path);
      }
    }
  };
}
