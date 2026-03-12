/**
 * Analytics Dashboard — Admin-only view
 * Reads from analytics_sessions + analytics_events
 * All queries are server-side aggregations via Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, MousePointerClick, Mail, FileText, TrendingUp, Activity, Lightbulb, Target, Package, ArrowRight } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────

function pct(a: number, b: number) {
  if (!b) return '0%';
  return `${Math.round((a / b) * 100)}%`;
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// Color palette — uses design tokens via hex so recharts can render
const COLORS = ['#1d5ba8', '#e53935', '#2563eb', '#64748b', '#22c55e', '#f59e0b'];

// ── Types ─────────────────────────────────────────────────────

interface Session {
  id: string;
  visitor_id: string;
  landing_page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  country: string | null;
  started_at: string;
  intent_score: number;
  intent_level: string;
  converted: boolean;
}

interface AnalyticsEvent {
  id: string;
  session_id: string | null;
  event_type: string;
  page_path: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

// ── Summary Card ──────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? 'border-primary/40 bg-primary/5' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${accent ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`w-5 h-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Recommendations engine ────────────────────────────────────

function generateRecommendations(
  sessions: Session[],
  events: AnalyticsEvent[]
): string[] {
  const recs: string[] = [];
  const total = sessions.length;
  if (!total) return ['No data yet — recommendations will appear once visitors start arriving.'];

  const conversions = sessions.filter((s) => s.converted).length;
  const convRate = conversions / total;

  // Funnel by page
  const serviceViews = events.filter((e) => e.event_type === 'page_view' && e.page_path.startsWith('/services')).length;
  const ctaClicks   = events.filter((e) => e.event_type === 'cta_click').length;
  const emailClicks = events.filter((e) => e.event_type === 'email_click').length;

  if (serviceViews > 5 && ctaClicks / serviceViews < 0.05)
    recs.push('Services page gets traffic but low CTA clicks — consider a stronger, more visible CTA above the fold.');

  const aboutViews = events.filter((e) => e.event_type === 'page_view' && e.page_path === '/about').length;
  if (aboutViews > 0) {
    const aboutAssist = sessions.filter((s) => {
      const sEvents = events.filter((e) => e.session_id === s.id);
      return sEvents.some((e) => e.page_path === '/about') && s.converted;
    }).length;
    if (aboutAssist / aboutViews > 0.1)
      recs.push('About page frequently assists conversions — add a contact CTA block earlier on the page.');
  }

  // Mobile vs desktop
  const mobile = sessions.filter((s) => s.device_type === 'mobile');
  const desktop = sessions.filter((s) => s.device_type === 'desktop');
  const mobileConv = mobile.filter((s) => s.converted).length / (mobile.length || 1);
  const desktopConv = desktop.filter((s) => s.converted).length / (desktop.length || 1);
  if (desktop.length > 5 && mobileConv < desktopConv * 0.6)
    recs.push('Mobile conversion rate is lower than desktop — review mobile CTA placement and form usability.');

  // Source quality
  const linkedinSessions = sessions.filter((s) =>
    s.utm_source === 'linkedin' || (s.referrer || '').includes('linkedin')
  );
  const linkedinConv = linkedinSessions.filter((s) => s.converted).length / (linkedinSessions.length || 1);
  if (linkedinSessions.length >= 3 && linkedinConv > convRate * 1.3)
    recs.push('LinkedIn traffic converts better than average — consider increasing LinkedIn content activity.');

  if (emailClicks > ctaClicks)
    recs.push('More visitors click email directly than CTA buttons — your email link is the primary CTA; make it more prominent.');

  if (convRate < 0.02 && total > 20)
    recs.push('Overall conversion rate is below 2% — audit the homepage hero messaging and primary CTA.');

  if (!recs.length) recs.push('Conversion rate looks healthy. Keep monitoring as traffic grows.');

  return recs;
}

// ── Main Dashboard Component ──────────────────────────────────

export default function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents]     = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [range, setRange]       = useState<7 | 30 | 90>(30);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = new Date(Date.now() - range * 86_400_000).toISOString();

      const [{ data: sessData }, { data: evData }] = await Promise.all([
        supabase.from('analytics_sessions').select('*').gte('started_at', since).order('started_at', { ascending: false }),
        supabase.from('analytics_events').select('*').gte('created_at', since).order('created_at', { ascending: false }),
      ]);

      setSessions((sessData as Session[]) || []);
      setEvents((evData as AnalyticsEvent[]) || []);
      setLoading(false);
    }
    load();
  }, [range]);

  // ── Aggregations ────────────────────────────────────────────

  const totalSessions  = sessions.length;
  const uniqueVisitors = new Set(sessions.map((s) => s.visitor_id)).size;
  const conversions    = sessions.filter((s) => s.converted).length;
  const emailClicks    = events.filter((e) => e.event_type === 'email_click').length;
  const formSubmits    = events.filter((e) => e.event_type === 'form_submit').length;
  const ctaClicks      = events.filter((e) => e.event_type === 'cta_click').length;
  const convRate       = pct(conversions, totalSessions);

  // Sessions with 2+ page views = "engaged"
  const sessionPageCounts = sessions.map((s) => ({
    ...s,
    pageViews: events.filter((e) => e.session_id === s.id && e.event_type === 'page_view').length,
  }));
  const engagedSessions = sessionPageCounts.filter((s) => s.pageViews >= 2).length;

  // Sessions over time (daily)
  const dailyMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = s.started_at.slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  // Conversions over time
  const convDailyMap: Record<string, number> = {};
  sessions.filter((s) => s.converted).forEach((s) => {
    const day = s.started_at.slice(0, 10);
    convDailyMap[day] = (convDailyMap[day] || 0) + 1;
  });
  const convDailyData = dailyData.map((d) => ({
    ...d,
    conversions: convDailyMap[`20${d.date}`] || convDailyMap[Object.keys(convDailyMap).find((k) => k.slice(5) === d.date) || ''] || 0,
  }));

  // Traffic sources
  const sourceMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const src = s.utm_source || (s.referrer ? new URL(s.referrer.startsWith('http') ? s.referrer : `http://${s.referrer}`).hostname.replace('www.', '') : 'Direct');
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Device breakdown
  const deviceMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const d = s.device_type || 'unknown';
    deviceMap[d] = (deviceMap[d] || 0) + 1;
  });
  const deviceData = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));

  // Top pages
  const pageMap: Record<string, number> = {};
  events.filter((e) => e.event_type === 'page_view').forEach((e) => {
    pageMap[e.page_path] = (pageMap[e.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([page, views]) => ({ page, views }));

  // CTA performance
  const ctaMap: Record<string, number> = {};
  events.filter((e) => e.event_type === 'cta_click').forEach((e) => {
    const label = (e.event_data as { label?: string })?.label || 'Unknown';
    ctaMap[label] = (ctaMap[label] || 0) + 1;
  });
  const ctaData = Object.entries(ctaMap)
    .sort(([, a], [, b]) => b - a)
    .map(([label, clicks]) => ({ label, clicks }));

  // Intent breakdown
  const intentMap = { low: 0, medium: 0, high: 0 };
  sessions.forEach((s) => {
    intentMap[s.intent_level as keyof typeof intentMap]++;
  });

  // Funnel data
  const funnelSteps = [
    { name: 'All Visitors',        value: totalSessions },
    { name: 'Engaged (2+ pages)',  value: engagedSessions },
    { name: 'Services Page',       value: sessions.filter((s) => events.some((e) => e.session_id === s.id && e.page_path.startsWith('/services'))).length },
    { name: 'CTA Click',           value: sessions.filter((s) => events.some((e) => e.session_id === s.id && e.event_type === 'cta_click')).length },
    { name: 'Converted',           value: conversions },
  ];

  // Recent conversions
  const recentConversions = sessions
    .filter((s) => s.converted)
    .slice(0, 10)
    .map((s) => ({
      ...s,
      trigger: events.find(
        (e) => e.session_id === s.id && ['email_click', 'form_submit', 'cta_click'].includes(e.event_type)
      ),
    }));

  // UTM campaigns
  const utmMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const key = [s.utm_source, s.utm_medium, s.utm_campaign].filter(Boolean).join(' / ') || 'Organic/Direct';
    utmMap[key] = (utmMap[key] || 0) + 1;
  });
  const utmData = Object.entries(utmMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const recommendations = generateRecommendations(sessions, events);

  // ── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Date range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Conversion Analytics</h2>
          <p className="text-sm text-muted-foreground">Visitor behaviour, engagement, and hire-intent signals</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                range === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* ── Executive Summary ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard icon={Users}           label="Sessions"          value={fmt(totalSessions)}  sub={`${uniqueVisitors} unique`} />
        <SummaryCard icon={Activity}        label="Engaged"           value={fmt(engagedSessions)} sub={pct(engagedSessions, totalSessions)} />
        <SummaryCard icon={MousePointerClick} label="CTA Clicks"      value={fmt(ctaClicks)}       sub={pct(ctaClicks, totalSessions)} />
        <SummaryCard icon={Mail}            label="Email Clicks"      value={fmt(emailClicks)}      accent />
        <SummaryCard icon={FileText}        label="Form Submits"      value={fmt(formSubmits)}      accent />
        <SummaryCard icon={TrendingUp}      label="Conversion Rate"   value={convRate}              sub={`${conversions} converted`} accent />
      </div>

      {/* ── Visitors & Conversions Over Time ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Sessions Over Time</CardTitle></CardHeader>
          <CardContent>
            {dailyData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1d5ba8" strokeWidth={2} dot={false} name="Sessions" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">No data in range</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Conversions Over Time</CardTitle></CardHeader>
          <CardContent>
            {convDailyData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={convDailyData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="conversions" fill="#e53935" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">No conversions in range</p>}
          </CardContent>
        </Card>
      </div>

      {/* ── Traffic Sources & Devices ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Traffic Sources</CardTitle></CardHeader>
          <CardContent>
            {sourceData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sourceData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1d5ba8" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground py-8 text-center">No data</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Device Breakdown</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {deviceData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
      </div>

      {/* ── Conversion Funnel ────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {funnelSteps.map((step, i) => {
              const prev = funnelSteps[0].value;
              const width = prev ? Math.max((step.value / prev) * 100, 2) : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-40 shrink-0">{step.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${width}%`, background: i === funnelSteps.length - 1 ? '#e53935' : '#1d5ba8' }}
                    >
                      <span className="text-xs text-white font-medium">{step.value}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{pct(step.value, prev)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Top Pages & CTA Performance ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPages.length ? topPages.map(({ page, views }) => (
                <div key={page} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-sm font-mono text-foreground truncate max-w-[200px]">{page || '/'}</span>
                  <Badge variant="secondary">{views} views</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No page views tracked yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">CTA Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ctaData.length ? ctaData.map(({ label, clicks }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-sm text-foreground truncate max-w-[200px]">"{label}"</span>
                  <Badge variant="outline">{clicks} clicks</Badge>
                </div>
              )) : <p className="text-sm text-muted-foreground">No CTA clicks tracked yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Intent Score Distribution ────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4" /> Lead Intent Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-3xl font-bold text-foreground">{intentMap.high}</p>
              <p className="text-sm text-muted-foreground mt-1">High Intent</p>
              <Badge className="mt-2 bg-green-500/10 text-green-600 border-green-200">Ready to hire</Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-3xl font-bold text-foreground">{intentMap.medium}</p>
              <p className="text-sm text-muted-foreground mt-1">Medium Intent</p>
              <Badge className="mt-2 bg-amber-500/10 text-amber-600 border-amber-200">Considering</Badge>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-3xl font-bold text-foreground">{intentMap.low}</p>
              <p className="text-sm text-muted-foreground mt-1">Low Intent</p>
              <Badge className="mt-2 bg-muted text-muted-foreground">Browsing</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Scores are rule-based — edit thresholds in <code className="font-mono">src/lib/analytics.ts → INTENT_SCORES</code>
          </p>
        </CardContent>
      </Card>

      {/* ── UTM / Campaign Tracking ──────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base">UTM Campaign Traffic</CardTitle></CardHeader>
        <CardContent>
          {utmData.length ? (
            <div className="space-y-2">
              {utmData.map(([key, count]) => (
                <div key={key} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-sm font-mono text-foreground">{key}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No UTM-tagged traffic yet. Add <code className="font-mono text-xs">?utm_source=linkedin&amp;utm_medium=post</code> to your shared links.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Conversions ───────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Conversion Activity</CardTitle></CardHeader>
        <CardContent>
          {recentConversions.length ? (
            <div className="space-y-3">
              {recentConversions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.trigger?.event_type === 'email_click' ? '✉️ Email clicked' :
                         s.trigger?.event_type === 'form_submit' ? '📝 Form submitted' :
                         s.trigger?.event_type === 'cta_click'   ? `🖱️ CTA: "${(s.trigger.event_data as {label?:string})?.label || ''}"` :
                         '✅ Converted'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.landing_page} · {s.device_type || 'unknown'} · score {s.intent_score}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.started_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No conversions tracked yet — conversions are recorded when visitors click email links or submit the contact form.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Recommendations ──────────────────────────────────── */}
      <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-amber-500 mt-0.5">→</span>
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
