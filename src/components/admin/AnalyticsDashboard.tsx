/**
 * Analytics Dashboard — Admin-only view
 * Reads from analytics_sessions + analytics_events
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, MousePointerClick, Mail, FileText, TrendingUp, Activity, Lightbulb, Package, ArrowRight, Building2, Briefcase, Layers, Newspaper } from 'lucide-react';

function pct(a: number, b: number) { if (!b) return '0%'; return `${Math.round((a / b) * 100)}%`; }
function fmt(n: number) { if (n >= 1000) return `${(n / 1000).toFixed(1)}k`; return String(n); }

const COLORS = ['#1d5ba8', '#e53935', '#2563eb', '#64748b', '#22c55e', '#f59e0b'];

interface Session {
  id: string; visitor_id: string; landing_page: string; referrer: string | null;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
  device_type: string | null; country: string | null; started_at: string;
  intent_score: number; intent_level: string; converted: boolean;
}
interface AnalyticsEvent {
  id: string; session_id: string | null; event_type: string;
  page_path: string; event_data: Record<string, unknown> | null; created_at: string;
}

function SummaryCard({ icon: Icon, label, value, sub, accent = false }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean;
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

function generateRecommendations(sessions: Session[], events: AnalyticsEvent[]): string[] {
  const recs: string[] = [];
  const total = sessions.length;
  if (!total) return ['No data yet — recommendations will appear once visitors start arriving.'];
  const conversions = sessions.filter((s) => s.converted).length;
  const convRate = conversions / total;
  const serviceViews = events.filter((e) => e.event_type === 'page_view' && e.page_path.startsWith('/services')).length;
  const ctaClicks = events.filter((e) => e.event_type === 'cta_click').length;
  const emailClicks = events.filter((e) => e.event_type === 'email_click').length;
  if (serviceViews > 5 && ctaClicks / serviceViews < 0.05) recs.push('Services page gets traffic but low CTA clicks — consider a stronger, more visible CTA above the fold.');
  const aboutViews = events.filter((e) => e.event_type === 'page_view' && e.page_path === '/about').length;
  if (aboutViews > 0) {
    const aboutAssist = sessions.filter((s) => events.filter((e) => e.session_id === s.id).some((e) => e.page_path === '/about') && s.converted).length;
    if (aboutAssist / aboutViews > 0.1) recs.push('About page frequently assists conversions — add a contact CTA block earlier on the page.');
  }
  const mobile = sessions.filter((s) => s.device_type === 'mobile');
  const desktop = sessions.filter((s) => s.device_type === 'desktop');
  const mobileConv = mobile.filter((s) => s.converted).length / (mobile.length || 1);
  const desktopConv = desktop.filter((s) => s.converted).length / (desktop.length || 1);
  if (desktop.length > 5 && mobileConv < desktopConv * 0.6) recs.push('Mobile conversion rate is lower than desktop — review mobile CTA placement and form usability.');
  const linkedinSessions = sessions.filter((s) => s.utm_source === 'linkedin' || (s.referrer || '').includes('linkedin'));
  const linkedinConv = linkedinSessions.filter((s) => s.converted).length / (linkedinSessions.length || 1);
  if (linkedinSessions.length >= 3 && linkedinConv > convRate * 1.3) recs.push('LinkedIn traffic converts better than average — consider increasing LinkedIn content activity.');
  if (emailClicks > ctaClicks) recs.push('More visitors click email directly than CTA buttons — make the email link more prominent.');
  if (convRate < 0.02 && total > 20) recs.push('Overall conversion rate is below 2% — audit the homepage hero messaging and primary CTA.');
  if (!recs.length) recs.push('Conversion rate looks healthy. Keep monitoring as traffic grows.');
  return recs;
}

export default function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 30 | 90>(30);

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

  // ── Core Aggregations ────────────────────────────────────────
  const totalSessions = sessions.length;
  const uniqueVisitors = new Set(sessions.map((s) => s.visitor_id)).size;
  const conversions = sessions.filter((s) => s.converted).length;
  const emailClicks = events.filter((e) => e.event_type === 'email_click').length;
  const formSubmits = events.filter((e) => e.event_type === 'form_submit').length;
  const ctaClicks = events.filter((e) => e.event_type === 'cta_click').length;
  const convRate = pct(conversions, totalSessions);
  const engagedSessions = sessions.filter((s) => events.filter((e) => e.session_id === s.id && e.event_type === 'page_view').length >= 2).length;

  const dailyMap: Record<string, number> = {};
  sessions.forEach((s) => { const d = s.started_at.slice(0, 10); dailyMap[d] = (dailyMap[d] || 0) + 1; });
  const dailyData = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count }));

  const convDailyMap: Record<string, number> = {};
  sessions.filter((s) => s.converted).forEach((s) => { const d = s.started_at.slice(0, 10); convDailyMap[d] = (convDailyMap[d] || 0) + 1; });
  const convDailyData = dailyData.map((d) => ({ ...d, conversions: convDailyMap[Object.keys(convDailyMap).find((k) => k.slice(5) === d.date) || ''] || 0 }));

  const sourceMap: Record<string, number> = {};
  sessions.forEach((s) => {
    let src = 'Direct';
    try { src = s.utm_source || (s.referrer ? new URL(s.referrer.startsWith('http') ? s.referrer : `http://${s.referrer}`).hostname.replace('www.', '') : 'Direct'); } catch { /* ignore */ }
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));

  const deviceMap: Record<string, number> = {};
  sessions.forEach((s) => { const d = s.device_type || 'unknown'; deviceMap[d] = (deviceMap[d] || 0) + 1; });
  const deviceData = Object.entries(deviceMap).map(([name, value]) => ({ name, value }));

  const pageMap: Record<string, number> = {};
  events.filter((e) => e.event_type === 'page_view').forEach((e) => { pageMap[e.page_path] = (pageMap[e.page_path] || 0) + 1; });
  const topPages = Object.entries(pageMap).sort(([, a], [, b]) => b - a).slice(0, 8).map(([page, views]) => ({ page, views }));

  const ctaMap: Record<string, number> = {};
  events.filter((e) => e.event_type === 'cta_click').forEach((e) => { const label = (e.event_data as { label?: string })?.label || 'Unknown'; ctaMap[label] = (ctaMap[label] || 0) + 1; });
  const ctaData = Object.entries(ctaMap).sort(([, a], [, b]) => b - a).map(([label, clicks]) => ({ label, clicks }));

  const intentMap = { low: 0, medium: 0, high: 0 };
  sessions.forEach((s) => { intentMap[s.intent_level as keyof typeof intentMap]++; });

  const funnelSteps = [
    { name: 'All Visitors', value: totalSessions },
    { name: 'Engaged (2+ pages)', value: engagedSessions },
    { name: 'Services Page', value: sessions.filter((s) => events.some((e) => e.session_id === s.id && e.page_path.startsWith('/services'))).length },
    { name: 'CTA Click', value: sessions.filter((s) => events.some((e) => e.session_id === s.id && e.event_type === 'cta_click')).length },
    { name: 'Converted', value: conversions },
  ];

  const recentConversions = sessions.filter((s) => s.converted).slice(0, 10).map((s) => ({
    ...s, trigger: events.find((e) => e.session_id === s.id && ['email_click', 'form_submit', 'cta_click'].includes(e.event_type)),
  }));

  const utmMap: Record<string, number> = {};
  sessions.forEach((s) => { const key = [s.utm_source, s.utm_medium, s.utm_campaign].filter(Boolean).join(' / ') || 'Organic/Direct'; utmMap[key] = (utmMap[key] || 0) + 1; });
  const utmData = Object.entries(utmMap).sort(([, a], [, b]) => b - a).slice(0, 8);

  const recommendations = generateRecommendations(sessions, events);

  // ── Directory Analytics ──────────────────────────────────────
  const dirViewEvents = events.filter((e) => e.event_type === 'directory_view');

  function buildViewMap(itemType: string): { slug: string; name: string; sub: string; views: number; uniqueVisitors: number }[] {
    const map: Record<string, { name: string; sub: string; views: number; sessions: Set<string> }> = {};
    dirViewEvents
      .filter((e) => (e.event_data as { item_type?: string })?.item_type === itemType)
      .forEach((e) => {
        const d = e.event_data as { slug?: string; name?: string; company?: string; category?: string; device?: string };
        const key = d.slug || d.name || 'unknown';
        const sub = d.company || d.category || d.device || '';
        if (!map[key]) map[key] = { name: d.name || key, sub, views: 0, sessions: new Set() };
        map[key].views++;
        if (e.session_id) map[key].sessions.add(e.session_id);
      });
    return Object.entries(map).sort(([, a], [, b]) => b.views - a.views).slice(0, 10)
      .map(([slug, d]) => ({ slug, name: d.name, sub: d.sub, views: d.views, uniqueVisitors: d.sessions.size }));
  }

  const topProducts = buildViewMap('product');
  const topAgencies = buildViewMap('agency');
  const topCompanies = buildViewMap('company');
  const topUseCases = buildViewMap('use_case');

  const typeDistribution = (['product', 'agency', 'company', 'use_case'] as const).map((t) => ({
    name: t === 'use_case' ? 'Use Case' : t.charAt(0).toUpperCase() + t.slice(1),
    value: dirViewEvents.filter((e) => (e.event_data as { item_type?: string })?.item_type === t).length,
  })).filter((d) => d.value > 0);

  const categoryMap: Record<string, number> = {};
  dirViewEvents.filter((e) => (e.event_data as { item_type?: string })?.item_type === 'product').forEach((e) => {
    const cat = (e.event_data as { category?: string })?.category || 'Unknown';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));

  const tabViewMap: Record<string, number> = {};
  events.filter((e) => e.event_type === 'directory_tab_view').forEach((e) => {
    const tab = (e.event_data as { tab?: string })?.tab || 'products';
    tabViewMap[tab] = (tabViewMap[tab] || 0) + 1;
  });
  const tabData = Object.entries(tabViewMap).map(([name, value]) => ({ name, value }));

  const directorySessions = sessions.filter((s) =>
    events.some((e) => e.session_id === s.id && (e.event_type === 'directory_view' || e.event_type === 'directory_tab_view' || e.page_path.startsWith('/xr-directory')))
  );
  const directoryConversions = directorySessions.filter((s) => s.converted).length;
  const avgItemsPerSession = directorySessions.length
    ? (dirViewEvents.filter((e) => directorySessions.some((s) => s.id === e.session_id)).length / directorySessions.length).toFixed(1)
    : '0';
  const deepEngagementSessions = directorySessions.filter((s) => dirViewEvents.filter((e) => e.session_id === s.id).length >= 3).length;

  const convertedSessionIds = new Set(sessions.filter((s) => s.converted).map((s) => s.id));
  const conversionAssist: Record<string, { name: string; type: string; assists: number }> = {};
  dirViewEvents.filter((e) => e.session_id && convertedSessionIds.has(e.session_id)).forEach((e) => {
    const d = e.event_data as { slug?: string; name?: string; item_type?: string };
    const key = d.slug || d.name || 'unknown';
    if (!conversionAssist[key]) conversionAssist[key] = { name: d.name || key, type: d.item_type || '', assists: 0 };
    conversionAssist[key].assists++;
  });
  const topAssistingItems = Object.values(conversionAssist).sort((a, b) => b.assists - a.assists).slice(0, 8);

  const recentDirActivity = [...dirViewEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map((e) => {
      const d = e.event_data as { item_type?: string; name?: string; company?: string; slug?: string };
      const session = sessions.find((s) => s.id === e.session_id);
      return {
        time: e.created_at,
        itemType: d.item_type || 'unknown',
        name: d.name || d.slug || '—',
        sub: d.company || '',
        device: session?.device_type || 'unknown',
        source: (() => {
          try { return session?.utm_source || (session?.referrer ? new URL(session.referrer.startsWith('http') ? session.referrer : `http://${session.referrer}`).hostname.replace('www.', '') : 'Direct'); } catch { return 'Direct'; }
        })(),
      };
    });

  // ── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Visitor behaviour, engagement, and hire-intent signals</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((d) => (
            <button key={d} onClick={() => setRange(d)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${range === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="conversion">
        <TabsList className="mb-4">
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="directory">XR Directory</TabsTrigger>
          <TabsTrigger value="news">News Feed</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: CONVERSION ── */}
        <TabsContent value="conversion" className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard icon={Users} label="Sessions" value={fmt(totalSessions)} sub={`${uniqueVisitors} unique`} />
            <SummaryCard icon={Activity} label="Engaged" value={fmt(engagedSessions)} sub={pct(engagedSessions, totalSessions)} />
            <SummaryCard icon={MousePointerClick} label="CTA Clicks" value={fmt(ctaClicks)} sub={pct(ctaClicks, totalSessions)} />
            <SummaryCard icon={Mail} label="Email Clicks" value={fmt(emailClicks)} accent />
            <SummaryCard icon={FileText} label="Form Submits" value={fmt(formSubmits)} accent />
            <SummaryCard icon={TrendingUp} label="Conversion Rate" value={convRate} sub={`${conversions} converted`} accent />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Sessions Over Time</CardTitle></CardHeader>
              <CardContent>
                {dailyData.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Sessions" />
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
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
                      <Bar dataKey="conversions" fill="#e53935" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-8 text-center">No conversions in range</p>}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Traffic Sources</CardTitle></CardHeader>
              <CardContent>
                {sourceData.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sourceData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} /><Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="Sessions" />
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
                      <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
          </div>

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
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${width}%`, background: i === funnelSteps.length - 1 ? '#e53935' : 'hsl(var(--primary))' }}>
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

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Lead Intent Distribution</CardTitle></CardHeader>
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
                             s.trigger?.event_type === 'cta_click' ? `🖱️ CTA: "${(s.trigger.event_data as { label?: string })?.label || ''}"` : '✅ Converted'}
                          </p>
                          <p className="text-xs text-muted-foreground">{s.landing_page} · {s.device_type || 'unknown'} · score {s.intent_score}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No conversions tracked yet — conversions are recorded when visitors click email links or submit the contact form.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-amber-500 mt-0.5">→</span> {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: XR DIRECTORY ── */}
        <TabsContent value="directory" className="space-y-8">

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard icon={Users} label="Directory Sessions" value={fmt(directorySessions.length)} sub={`of ${fmt(totalSessions)} total`} />
            <SummaryCard icon={Package} label="Total Item Views" value={fmt(dirViewEvents.length)} sub={`${typeDistribution.length} content type${typeDistribution.length !== 1 ? 's' : ''}`} />
            <SummaryCard icon={Activity} label="Deep Engagements" value={fmt(deepEngagementSessions)} sub="viewed 3+ items" accent />
            <SummaryCard icon={TrendingUp} label="Dir. → Conversion" value={fmt(directoryConversions)} sub={pct(directoryConversions, directorySessions.length)} accent />
          </div>

          {/* Content type distribution + tab engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="w-4 h-4" /> Views by Content Type</CardTitle></CardHeader>
              <CardContent>
                {typeDistribution.length ? (
                  <div className="space-y-3">
                    {typeDistribution.map(({ name, value }) => {
                      const pctVal = Math.round((value / (dirViewEvents.length || 1)) * 100);
                      return (
                        <div key={name} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-20 shrink-0">{name}</span>
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                            <div className="h-full bg-primary/70 rounded-full" style={{ width: `${Math.max(pctVal, 2)}%` }} />
                          </div>
                          <span className="text-sm font-medium w-24 text-right shrink-0">{value} ({pctVal}%)</span>
                        </div>
                      );
                    })}
                    <p className="text-xs text-muted-foreground pt-2 border-t">Avg {avgItemsPerSession} items viewed per directory session</p>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No directory item views yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Directory Tab Engagement</CardTitle></CardHeader>
              <CardContent>
                {tabData.length ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={tabData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-muted-foreground py-8 text-center">No tab engagement data yet</p>}
              </CardContent>
            </Card>
          </div>

          {/* Products + Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> Top Viewed Products</CardTitle></CardHeader>
              <CardContent>
                {topProducts.length ? (
                  <div className="space-y-1">
                    {topProducts.map(({ slug, name, sub, views, uniqueVisitors: uv }, i) => (
                      <div key={slug} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                        <span className="text-xs text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{name}</p>
                          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">{views}</Badge>
                          <span className="text-xs text-muted-foreground">{uv}u</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No product views yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" /> Top Viewed Companies</CardTitle></CardHeader>
              <CardContent>
                {topCompanies.length ? (
                  <div className="space-y-1">
                    {topCompanies.map(({ slug, name, views, uniqueVisitors: uv }, i) => (
                      <div key={slug} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                        <span className="text-xs text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground truncate">{name}</p></div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">{views}</Badge>
                          <span className="text-xs text-muted-foreground">{uv}u</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No company page views yet.</p>}
              </CardContent>
            </Card>
          </div>

          {/* Agencies + Use Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> Top Viewed Agencies</CardTitle></CardHeader>
              <CardContent>
                {topAgencies.length ? (
                  <div className="space-y-1">
                    {topAgencies.map(({ slug, name, views, uniqueVisitors: uv }, i) => (
                      <div key={slug} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                        <span className="text-xs text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0 flex-1"><p className="text-sm font-medium text-foreground truncate">{name}</p></div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">{views}</Badge>
                          <span className="text-xs text-muted-foreground">{uv}u</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No agency page views yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layers className="w-4 h-4" /> Top Viewed Use Cases</CardTitle></CardHeader>
              <CardContent>
                {topUseCases.length ? (
                  <div className="space-y-1">
                    {topUseCases.map(({ slug, name, sub, views, uniqueVisitors: uv }, i) => (
                      <div key={slug} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                        <span className="text-xs text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{name}</p>
                          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">{views}</Badge>
                          <span className="text-xs text-muted-foreground">{uv}u</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No use case views yet.</p>}
              </CardContent>
            </Card>
          </div>

          {/* Product category breakdown */}
          {categoryData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Product Views by Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 16 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Views" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Items viewed before conversion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-green-600" /> Directory Items Viewed Before Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topAssistingItems.length ? (
                <div className="space-y-1.5">
                  {topAssistingItems.map(({ name, type, assists }) => (
                    <div key={name} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className="text-xs shrink-0 capitalize">{type.replace('_', ' ')}</Badge>
                        <span className="text-sm font-medium text-foreground truncate">{name}</span>
                      </div>
                      <Badge className="bg-green-500/10 text-green-700 border-green-200 shrink-0 ml-3">{assists} assist{assists !== 1 ? 's' : ''}</Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No conversion assists yet — appears when any directory page is viewed in a session that converts.</p>}
              <p className="text-xs text-muted-foreground mt-4 pt-3 border-t">"Assist" = item viewed in a session that ended with an email click, CTA click, or form submission.</p>
            </CardContent>
          </Card>

          {/* How directory visitors arrived */}
          <Card>
            <CardHeader><CardTitle className="text-base">How Directory Visitors Arrived</CardTitle></CardHeader>
            <CardContent>
              {(() => {
                const dirSrcMap: Record<string, number> = {};
                directorySessions.forEach((s) => {
                  let src = 'Direct';
                  try { src = s.utm_source || (s.referrer ? new URL(s.referrer.startsWith('http') ? s.referrer : `http://${s.referrer}`).hostname.replace('www.', '') : 'Direct'); } catch { /* ignore */ }
                  dirSrcMap[src] = (dirSrcMap[src] || 0) + 1;
                });
                const data = Object.entries(dirSrcMap).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));
                return data.length ? (
                  <div className="space-y-2">
                    {data.map(({ name, value }) => {
                      const pctVal = Math.round((value / (directorySessions.length || 1)) * 100);
                      return (
                        <div key={name} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-28 shrink-0 truncate">{name}</span>
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                            <div className="h-full bg-primary/70 rounded-full" style={{ width: `${Math.max(pctVal, 2)}%` }} />
                          </div>
                          <span className="text-sm font-medium w-20 text-right shrink-0">{value} ({pctVal}%)</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No directory visitor data yet</p>;
              })()}
            </CardContent>
          </Card>

          {/* Recent directory activity feed */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Directory Activity</CardTitle></CardHeader>
            <CardContent>
              {recentDirActivity.length ? (
                <div className="space-y-0">
                  {recentDirActivity.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <Badge variant="outline" className="text-xs shrink-0 w-20 justify-center capitalize">{ev.itemType.replace('_', ' ')}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{ev.name}</p>
                        {ev.sub && <p className="text-xs text-muted-foreground">{ev.sub}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{ev.device} · {ev.source}</p>
                        <p className="text-xs text-muted-foreground">{new Date(ev.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No directory activity recorded yet — visit some product, company, agency, or use case pages to see the feed populate.</p>}
            </CardContent>
          </Card>

          {/* Directory Insights */}
          <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500" /> Directory Insights</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(() => {
                  const insights: string[] = [];
                  const dirPct = totalSessions ? Math.round((directorySessions.length / totalSessions) * 100) : 0;
                  if (directorySessions.length === 0) {
                    insights.push('No directory visitors yet — share individual product pages on LinkedIn or in newsletters to start generating data.');
                  } else {
                    insights.push(`${dirPct}% of all sessions engaged with the XR Directory — ${dirPct > 30 ? 'strong indicator the directory is driving traffic.' : 'consider promoting specific product pages to increase this.'}`);
                    if (directoryConversions > 0) insights.push(`${directoryConversions} visitor${directoryConversions > 1 ? 's' : ''} converted after browsing the directory — the directory is contributing to hire-intent signals.`);
                    else insights.push('No directory visitors have converted yet — add a "Get expert advice on this product" CTA to product detail pages.');
                    if (topProducts.length > 0) insights.push(`"${topProducts[0].name}" is the most-viewed product — use it as a case study anchor or reference it in outreach.`);
                    if (deepEngagementSessions > 0) insights.push(`${deepEngagementSessions} session${deepEngagementSessions > 1 ? 's' : ''} viewed 3+ items — these are your most qualified directory visitors.`);
                    if (topAgencies.length > 0) insights.push(`Agency interest is active — "${topAgencies[0].name}" is the most-viewed agency, signalling visitors evaluating implementation partners.`);
                    if (tabData.length > 0) { const topTab = [...tabData].sort((a, b) => b.value - a.value)[0]; insights.push(`The "${topTab.name}" tab is the most browsed section — make sure it has a visible contact CTA.`); }
                  }
                  return insights.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-amber-500 mt-0.5">→</span> {r}</li>
                  ));
                })()}
              </ul>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}
