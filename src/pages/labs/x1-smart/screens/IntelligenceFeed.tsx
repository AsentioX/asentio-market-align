import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Check, X, Sparkles, ShieldAlert, UserCheck, Lightbulb, Zap, Eye, TrendingUp, Activity, LayoutGrid, Shield, Zap as ZapIcon, Users } from 'lucide-react';
import { FEED_EVENTS, type EventKind } from '../x1Data';
import { PRIORITY_STYLES } from '../x1Theme';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const KIND_META: Record<EventKind, { icon: any; label: string; gradient: string }> = {
  identity: { icon: UserCheck, label: 'Identity', gradient: 'from-emerald-400 to-teal-500' },
  security: { icon: ShieldAlert, label: 'Security', gradient: 'from-amber-400 to-orange-500' },
  insight: { icon: Lightbulb, label: 'Insight', gradient: 'from-cyan-400 to-blue-500' },
  suggestion: { icon: Sparkles, label: 'Suggestion', gradient: 'from-violet-400 to-fuchsia-500' },
  action: { icon: Zap, label: 'Auto-action', gradient: 'from-indigo-400 to-violet-500' },
  anomaly: { icon: Eye, label: 'Anomaly', gradient: 'from-rose-400 to-red-500' },
};

type CategoryTab = 'all' | 'security' | 'identity' | 'automation';

const CATEGORY_META: Record<CategoryTab, { icon: any; label: string }> = {
  all: { icon: LayoutGrid, label: 'All' },
  security: { icon: Shield, label: 'Security' },
  identity: { icon: Users, label: 'Identity' },
  automation: { icon: ZapIcon, label: 'Automation' },
};

const IntelligenceFeed = () => {
  const [expanded, setExpanded] = useState<string | null>(FEED_EVENTS[0]?.id ?? null);
  const [resolved, setResolved] = useState<Record<string, 'approved' | 'dismissed'>>({});
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');

  const filteredEvents = useMemo(() => {
    if (activeTab === 'all') return FEED_EVENTS;
    if (activeTab === 'security') return FEED_EVENTS.filter(e => e.kind === 'security' || e.kind === 'anomaly');
    if (activeTab === 'identity') return FEED_EVENTS.filter(e => e.kind === 'identity');
    if (activeTab === 'automation') return FEED_EVENTS.filter(e => e.kind === 'action' || e.kind === 'suggestion' || e.kind === 'insight');
    return FEED_EVENTS;
  }, [activeTab]);

  const handle = (id: string, action: 'approved' | 'dismissed', label: string) => {
    setResolved((r) => ({ ...r, [id]: action }));
    toast.success(action === 'approved' ? `Approved · ${label}` : 'Dismissed', {
      description: action === 'approved' ? 'System will learn from this confirmation.' : 'X1 won\'t suggest this again.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero — graphical greeting card */}
      <div className="relative rounded-3xl bg-white border border-black/[0.06] p-6 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-violet-200/40 via-indigo-100/30 to-transparent rounded-full blur-2xl -translate-y-20 translate-x-20" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
            <Brain className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-violet-600 font-semibold mb-1.5">Tonight · 7:42 PM</div>
            <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-stone-900">
              Good evening, Jon. <span className="text-stone-400">Everything looks calm at home.</span>
            </h1>
            <p className="text-sm text-stone-600 mt-3 leading-relaxed">
              <span className="text-amber-700 font-medium">1 thing needs your attention</span> at Warehouse B ·
              <span className="text-violet-600 font-medium"> 2 suggestions</span> ready to review · 4 auto-actions completed today.
            </p>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          <StatChip icon={Activity} label="Actions today" value="4" gradient="from-indigo-400 to-violet-500" />
          <StatChip icon={TrendingUp} label="Energy saved" value="18%" gradient="from-emerald-400 to-teal-500" />
          <StatChip icon={Sparkles} label="Patterns learned" value="23" gradient="from-amber-400 to-orange-500" />
        </div>
      </div>

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
          <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">Live feed</h2>
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
          key={activeTab}
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

            return (
              <motion.article
                key={event.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`relative rounded-2xl bg-white border overflow-hidden transition-all shadow-sm ${
                  isExpanded ? 'border-black/12 shadow-md' : 'border-black/[0.06] hover:border-black/12 hover:shadow-md'
                } ${status === 'approved' ? 'opacity-60' : ''}`}
              >
                {/* Left priority accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.dot}`} />

                <button
                  onClick={() => setExpanded(isExpanded ? null : event.id)}
                  className="w-full text-left p-4 pl-5 flex items-start gap-3.5"
                >
                  {/* Gradient icon tile */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kind.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <KindIcon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${p.text}`}>
                        {kind.label}
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
                    <p className="text-[13px] text-stone-600 mt-1 leading-relaxed">{event.detail}</p>
                  </div>

                  {(event.reasoning || event.suggestedAction) && (
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 flex-shrink-0 mt-1 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (event.reasoning || event.suggestedAction) && (
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
