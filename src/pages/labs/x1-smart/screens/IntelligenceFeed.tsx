import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ChevronDown, Check, X, Sparkles, ShieldAlert, UserCheck, Lightbulb, Zap, Eye,
  TrendingUp, TrendingDown, Activity, LayoutGrid, Shield, Zap as ZapIcon, Users,
  User as UserIcon, Cpu, Clock as ClockIcon
} from 'lucide-react';
import { RES_FEED, RES_INSIGHTS, type ResFeedEvent, type ResEventKind } from '../residentialData';
import { COM_FEED, COM_INSIGHTS, type ComFeedEvent, type ComEventKind } from '../commercialData';
import { PRIORITY_STYLES } from '../x1Theme';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { HERO_VOICE, HERO_VOICE_COMMERCIAL, ACTION_VOICE, type SystemMood } from '../systemVoice';
import { useAutonomy } from '../AutonomyContext';

type AnyEventKind = ResEventKind | ComEventKind;
type AnyEvent = ResFeedEvent | ComFeedEvent;
type Actor = 'ai' | 'user' | 'system';

const KIND_META: Record<AnyEventKind, { icon: any; label: string; gradient: string }> = {
  identity:   { icon: UserCheck,   label: 'Identity',    gradient: 'from-emerald-400 to-teal-500' },
  security:   { icon: ShieldAlert, label: 'Security',    gradient: 'from-amber-400 to-orange-500' },
  insight:    { icon: Lightbulb,   label: 'Insight',     gradient: 'from-cyan-400 to-blue-500' },
  suggestion: { icon: Sparkles,    label: 'Suggestion',  gradient: 'from-violet-400 to-fuchsia-500' },
  action:     { icon: Zap,         label: 'Auto-action', gradient: 'from-indigo-400 to-violet-500' },
  anomaly:    { icon: Eye,         label: 'Anomaly',     gradient: 'from-rose-400 to-red-500' },
};

const ACTOR_META: Record<Actor, { label: string; cls: string; icon: any }> = {
  ai:     { label: 'AI',      cls: 'bg-violet-50 text-violet-700 border-violet-200',  icon: Cpu },
  user:   { label: 'You',     cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',  icon: UserIcon },
  system: { label: 'Passive', cls: 'bg-stone-100 text-stone-600 border-stone-200',     icon: Eye },
};

type CategoryTab = 'all' | 'security' | 'identity' | 'automation';

const CATEGORY_META: Record<CategoryTab, { icon: any; label: string }> = {
  all: { icon: LayoutGrid, label: 'All' },
  security: { icon: Shield, label: 'Security' },
  identity: { icon: Users, label: 'Identity' },
  automation: { icon: ZapIcon, label: 'Automation' },
};

interface IntelligenceFeedProps {
  appMode: 'aihome' | 'aispaces';
}

const IntelligenceFeed = ({ appMode }: IntelligenceFeedProps) => {
  const events: AnyEvent[] = appMode === 'aihome' ? RES_FEED : COM_FEED;
  const insights = appMode === 'aihome' ? RES_INSIGHTS : COM_INSIGHTS;
  const [expanded, setExpanded] = useState<string | null>(events[0]?.id ?? null);
  const [resolved, setResolved] = useState<Record<string, 'approved' | 'dismissed'>>({});
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const { level } = useAutonomy();

  const filteredEvents = useMemo(() => {
    if (activeTab === 'all') return events;
    if (activeTab === 'security') return events.filter(e => e.kind === 'security' || e.kind === 'anomaly');
    if (activeTab === 'identity') return events.filter(e => e.kind === 'identity');
    if (activeTab === 'automation') return events.filter(e => e.kind === 'action' || e.kind === 'suggestion' || e.kind === 'insight');
    return events;
  }, [activeTab, events]);

  // Compute system mood from any visible critical/high events
  const mood: SystemMood = useMemo(() => {
    if (events.some((e) => e.priority === 'critical' && !resolved[e.id])) return 'urgent';
    if (events.some((e) => e.priority === 'high' && !resolved[e.id])) return 'watch';
    return 'calm';
  }, [events, resolved]);
  const voice = appMode === 'aihome' ? HERO_VOICE[mood] : HERO_VOICE_COMMERCIAL[mood];

  const handle = (id: string, action: 'approved' | 'dismissed', label: string) => {
    setResolved((r) => ({ ...r, [id]: action }));
    toast.success(action === 'approved' ? `Approved · ${label}` : 'Dismissed', {
      description: action === 'approved' ? 'System will learn from this confirmation.' : "X1 won't suggest this again.",
    });
  };

  const onPendingComplete = (label: string) => {
    toast.success(ACTION_VOICE.executed(label));
  };
  const onPendingCancel = (label: string) => {
    toast(ACTION_VOICE.confirmCancelled(label));
  };

  const hero = appMode === 'aihome'
    ? {
        eyebrow: 'Tonight · 7:42 PM',
        greeting: <>Good evening, Jon. <span className="text-stone-400">Everything looks calm at home.</span></>,
        sub: <><span className="text-amber-700 font-medium">1 thing needs your attention</span> at the back door · <span className="text-violet-600 font-medium">2 suggestions</span> ready to review · 3 auto-actions completed today.</>,
        stats: [
          { icon: Activity, label: 'Actions today', value: '3', gradient: 'from-emerald-400 to-teal-500' },
          { icon: TrendingUp, label: 'Energy saved', value: '18%', gradient: 'from-cyan-400 to-blue-500' },
          { icon: Sparkles, label: 'Patterns learned', value: '23', gradient: 'from-amber-400 to-orange-500' },
        ],
      }
    : {
        eyebrow: 'Today · 1:08 PM',
        greeting: <>Good afternoon. <span className="text-stone-400">3 sites operational, 1 needs attention.</span></>,
        sub: <><span className="text-rose-700 font-medium">1 critical event</span> at Warehouse · <span className="text-violet-600 font-medium">2 policy suggestions</span> ready · 17 people on-site across 3 sites.</>,
        stats: [
          { icon: Activity, label: 'Events today', value: '47', gradient: 'from-indigo-400 to-violet-500' },
          { icon: TrendingUp, label: 'HVAC saved', value: '22%', gradient: 'from-emerald-400 to-teal-500' },
          { icon: Sparkles, label: 'Patterns learned', value: '47', gradient: 'from-amber-400 to-orange-500' },
        ],
      };

  return (
    <div className="space-y-5">
      {/* Hero — calm greeting card */}
      <div className="rounded-xl bg-white border border-black/[0.06] p-5">
        <div className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium mb-1.5">{hero.eyebrow}</div>
        <h1 className="text-[22px] leading-[1.2] font-semibold tracking-tight text-stone-900">{hero.greeting}</h1>
        <p className="text-[13px] text-stone-600 mt-2 leading-relaxed">{hero.sub}</p>

        <div className={`mt-3 inline-flex items-center gap-2 text-[12px] ${voice.tone}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            mood === 'urgent' ? 'bg-rose-500 animate-pulse' :
            mood === 'watch' ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />
          <em className="not-italic">"{voice.line}"</em>
          <span className="text-stone-300">·</span>
          <span className="text-stone-500">Autonomy: {level}</span>
        </div>

        {/* Quick stats strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-black/[0.06]">
          {hero.stats.map((s) => (
            <StatChip key={s.label} icon={s.icon} label={s.label} value={s.value} gradient={s.gradient} />
          ))}
        </div>
      </div>

      {/* Pinned insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.slice(0, 2).map((ins) => {
            const Trend = ins.trend === 'down' ? TrendingDown : TrendingUp;
            const trendCls = ins.trend === 'up'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200';
            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl bg-white border border-violet-100 p-4 overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/40 to-fuchsia-100/30 rounded-full blur-2xl -translate-y-10 translate-x-8" />
                <div className="relative flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shrink-0">
                    <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-violet-700">Insight</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${trendCls}`}>
                        <Trend className="w-2.5 h-2.5" /> {ins.metric}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold text-stone-900 mt-1 leading-snug">{ins.headline}</h3>
                    <p className="text-[12px] text-stone-600 mt-1 leading-relaxed">{ins.detail}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryTab)} className="w-full">
        <TabsList className="w-full bg-stone-100/80 p-1 h-auto flex">
          {(Object.keys(CATEGORY_META) as CategoryTab[]).map((key) => {
            const { icon: Icon, label } = CATEGORY_META[key];
            const isActive = activeTab === key;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium rounded-lg transition-all
                  data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm
                  data-[state=inactive]:text-stone-500 data-[state=inactive]:hover:text-stone-700
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-stone-400'}`} />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Live feed header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">Decision engine</h2>
          <span className="text-[11px] text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">
            {filteredEvents.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-white border border-black/[0.06] rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Streaming</span>
        </div>
      </div>

      {/* Event cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${appMode}-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {filteredEvents.map((event) => {
            const isExpanded = expanded === event.id;
            const status = resolved[event.id];
            const p = PRIORITY_STYLES[event.priority];
            const kind = KIND_META[event.kind];
            const KindIcon = kind.icon;
            const actor = (event.actor ?? 'system') as Actor;
            const actorMeta = ACTOR_META[actor];
            const ActorIcon = actorMeta.icon;
            const isCritical = event.priority === 'critical';

            return (
              <motion.article
                key={event.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`relative rounded-2xl bg-white border overflow-hidden transition-all shadow-sm ${
                  isExpanded ? 'border-black/12 shadow-md' : 'border-black/[0.06] hover:border-black/12 hover:shadow-md'
                } ${status === 'approved' ? 'opacity-60' : ''} ${isCritical ? 'ring-1 ring-rose-200/60' : ''}`}
              >
                {/* Urgency rail */}
                <div className={`absolute left-0 top-0 bottom-0 ${isCritical ? 'w-1.5' : 'w-1'} ${p.dot}`}>
                  {isCritical && (
                    <span className="absolute inset-0 bg-rose-400 animate-pulse opacity-60" />
                  )}
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : event.id)}
                  className="w-full text-left p-4 pl-5 flex items-start gap-3.5"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kind.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <KindIcon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${p.text}`}>
                        {kind.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${actorMeta.cls}`}>
                        <ActorIcon className="w-2.5 h-2.5" />
                        {actorMeta.label}
                      </span>
                      <span className="text-[11px] text-stone-300">·</span>
                      <span className="text-[11px] text-stone-500">{event.timestamp}</span>
                      {event.confidence !== undefined && (
                        <>
                          <span className="text-[11px] text-stone-300">·</span>
                          <span className="text-[11px] text-stone-500 inline-flex items-center gap-1">
                            <ConfidenceMeter value={event.confidence} />
                            {Math.round(event.confidence * 100)}% confident
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-[15px] font-semibold text-stone-900 mt-1 leading-snug">{event.title}</h3>
                    {event.whyItMatters && (
                      <p className="text-[12.5px] text-violet-700 mt-1 leading-relaxed">
                        <span className="font-semibold">Why it matters · </span>
                        {event.whyItMatters}
                      </p>
                    )}
                    <p className="text-[13px] text-stone-600 mt-1 leading-relaxed">{event.detail}</p>
                  </div>

                  {(event.reasoning || event.suggestedAction || event.pendingAction || event.quickActions) && (
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 flex-shrink-0 mt-1 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Pending action countdown — always visible (not behind expand) for urgency */}
                {event.pendingAction && !status && (
                  <div className="px-5 pb-4">
                    <PendingActionBar
                      label={event.pendingAction.label}
                      seconds={event.pendingAction.countdownSec}
                      onComplete={() => onPendingComplete(event.pendingAction!.label)}
                      onCancel={() => {
                        onPendingCancel(event.pendingAction!.label);
                        setResolved((r) => ({ ...r, [event.id]: 'dismissed' }));
                      }}
                    />
                  </div>
                )}

                <AnimatePresence>
                  {isExpanded && (event.reasoning || event.suggestedAction || event.quickActions) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pl-[68px] space-y-4">
                        {event.reasoning && (
                          <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-100 p-4">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-violet-700 font-bold mb-2.5">
                              <Brain className="w-3 h-3" />
                              <span>Why X1 thinks this</span>
                            </div>
                            <ul className="space-y-2">
                              {event.reasoning.map((r, i) => (
                                <li key={i} className="text-[13px] text-stone-700 flex gap-2 leading-relaxed">
                                  <span className="text-violet-500 mt-1.5">›</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {event.quickActions && event.quickActions.length > 0 && !status && (
                          <div className="flex flex-wrap gap-2">
                            {event.quickActions.map((qa) => (
                              <button
                                key={qa.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`${qa.label}`, { description: 'Quick action sent.' });
                                }}
                                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
                              >
                                {qa.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {event.suggestedAction && !status && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handle(event.id, 'approved', event.suggestedAction!.label);
                              }}
                              className="flex-1 group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-4 py-3 text-[13px] font-semibold transition-all flex items-center justify-between shadow-md shadow-violet-500/30"
                            >
                              <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" strokeWidth={2.5} />
                                {event.suggestedAction.label}
                              </span>
                              <span className="text-[11px] font-medium opacity-90">{event.suggestedAction.impact}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handle(event.id, 'dismissed', '');
                              }}
                              className="w-11 h-11 rounded-xl border border-black/10 hover:border-black/20 hover:bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors bg-white"
                              aria-label="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {status && (
                          <div className={`text-[12px] flex items-center gap-1.5 font-medium ${
                            status === 'approved' ? 'text-emerald-600' : 'text-stone-400'
                          }`}>
                            {status === 'approved' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            {status === 'approved' ? 'Approved · X1 will run this automatically' : 'Dismissed'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PendingActionBar = ({
  label, seconds, onComplete, onCancel,
}: { label: string; seconds: number; onComplete: () => void; onCancel: () => void }) => {
  const [remaining, setRemaining] = useState(seconds);
  const [cancelled, setCancelled] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (cancelled) return;
    if (remaining <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, cancelled, onComplete]);

  if (cancelled) return null;
  if (remaining <= 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-[12px] font-semibold text-emerald-700 inline-flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5" /> {label} · done
      </div>
    );
  }
  const pct = ((seconds - remaining) / seconds) * 100;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12.5px] text-amber-900 font-semibold inline-flex items-center gap-1.5">
          <ClockIcon className="w-3.5 h-3.5" />
          {label} in {remaining}s
        </div>
        <button
          onClick={() => { setCancelled(true); onCancel(); }}
          className="text-[11px] font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
        >
          Cancel
        </button>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-amber-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatChip = ({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: string; gradient: string }) => (
  <div className="rounded-2xl bg-white border border-black/[0.06] p-3 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
      <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>
    <div>
      <div className="text-lg font-bold text-stone-900 leading-none tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-medium mt-1">{label}</div>
    </div>
  </div>
);

const ConfidenceMeter = ({ value }: { value: number }) => {
  const segments = 5;
  const filled = Math.round(value * segments);
  return (
    <span className="inline-flex items-center gap-[2px]">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] h-[7px] rounded-[1px] ${i < filled ? 'bg-violet-500' : 'bg-stone-200'}`}
        />
      ))}
    </span>
  );
};

export default IntelligenceFeed;
