import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, Check, X, Sparkles, ShieldAlert, UserCheck, Lightbulb, Zap, Eye } from 'lucide-react';
import { FEED_EVENTS, type FeedEvent, type EventKind } from '../x1Data';
import { PRIORITY_STYLES } from '../x1Theme';
import { toast } from 'sonner';

const KIND_META: Record<EventKind, { icon: any; label: string }> = {
  identity: { icon: UserCheck, label: 'Identity' },
  security: { icon: ShieldAlert, label: 'Security' },
  insight: { icon: Lightbulb, label: 'Insight' },
  suggestion: { icon: Sparkles, label: 'Suggestion' },
  action: { icon: Zap, label: 'Auto-action' },
  anomaly: { icon: Eye, label: 'Anomaly' },
};

const IntelligenceFeed = () => {
  const [expanded, setExpanded] = useState<string | null>(FEED_EVENTS[0]?.id ?? null);
  const [resolved, setResolved] = useState<Record<string, 'approved' | 'dismissed'>>({});

  const handle = (id: string, action: 'approved' | 'dismissed', label: string) => {
    setResolved((r) => ({ ...r, [id]: action }));
    toast.success(action === 'approved' ? `Approved · ${label}` : 'Dismissed', {
      description: action === 'approved' ? 'System will learn from this confirmation.' : 'X1 won\'t suggest this again.',
    });
  };

  return (
    <div className="space-y-5">
      {/* Hero summary */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] leading-tight font-semibold tracking-tight">
              Good evening, Jon. Everything looks calm at home.
            </h1>
            <p className="text-sm text-white/55 mt-1.5 leading-relaxed">
              <span className="text-amber-300">1 thing needs your attention</span> at Warehouse B ·
              <span className="text-cyan-300"> 2 suggestions</span> ready to review · 4 auto-actions completed today.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.18em] text-white/40 font-medium">Live feed</h2>
        <div className="flex items-center gap-1 text-[11px] text-white/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Streaming</span>
        </div>
      </div>

      {/* Event cards */}
      <div className="space-y-2.5">
        {FEED_EVENTS.map((event) => {
          const isExpanded = expanded === event.id;
          const status = resolved[event.id];
          const p = PRIORITY_STYLES[event.priority];
          const KindIcon = KIND_META[event.kind].icon;

          return (
            <motion.article
              key={event.id}
              layout
              className={`relative rounded-2xl border bg-white/[0.025] backdrop-blur-sm overflow-hidden transition-all ${
                isExpanded ? 'border-white/15' : 'border-white/[0.06] hover:border-white/10'
              } ${status === 'approved' ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : event.id)}
                className="w-full text-left p-4 flex items-start gap-3.5"
              >
                {/* Priority dot + icon */}
                <div className="flex flex-col items-center gap-1.5 pt-0.5">
                  <span className={`w-2 h-2 rounded-full ${p.dot} ${p.glow}`} />
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <KindIcon className="w-3.5 h-3.5 text-white/60" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${p.text}`}>
                      {KIND_META[event.kind].label}
                    </span>
                    <span className="text-[11px] text-white/30">·</span>
                    <span className="text-[11px] text-white/40">{event.timestamp}</span>
                    {event.confidence !== undefined && (
                      <>
                        <span className="text-[11px] text-white/30">·</span>
                        <span className="text-[11px] text-white/40 inline-flex items-center gap-1">
                          <ConfidenceMeter value={event.confidence} />
                          {Math.round(event.confidence * 100)}% confident
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-[15px] font-medium text-white mt-1 leading-snug">{event.title}</h3>
                  <p className="text-[13px] text-white/55 mt-1 leading-relaxed">{event.detail}</p>
                </div>

                {(event.reasoning || event.suggestedAction) && (
                  <ChevronDown
                    className={`w-4 h-4 text-white/30 flex-shrink-0 mt-1 transition-transform ${
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
                    <div className="px-4 pb-4 pl-[60px] space-y-4">
                      {event.reasoning && (
                        <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-300/80 font-semibold mb-2">
                            <Brain className="w-3 h-3" />
                            <span>Why X1 thinks this</span>
                          </div>
                          <ul className="space-y-1.5">
                            {event.reasoning.map((r, i) => (
                              <li key={i} className="text-[13px] text-white/70 flex gap-2 leading-relaxed">
                                <span className="text-cyan-300/60 mt-1.5">›</span>
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
                            className="flex-1 group relative overflow-hidden rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#0a0e14] px-4 py-3 text-[13px] font-semibold transition-colors flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <Check className="w-4 h-4" strokeWidth={2.5} />
                              {event.suggestedAction.label}
                            </span>
                            <span className="text-[11px] font-medium opacity-70">{event.suggestedAction.impact}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handle(event.id, 'dismissed', '');
                            }}
                            className="w-11 h-11 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            aria-label="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {status && (
                        <div className={`text-[12px] flex items-center gap-1.5 ${
                          status === 'approved' ? 'text-emerald-300' : 'text-white/40'
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
      </div>
    </div>
  );
};

const ConfidenceMeter = ({ value }: { value: number }) => {
  const segments = 5;
  const filled = Math.round(value * segments);
  return (
    <span className="inline-flex items-center gap-[2px]">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] h-[7px] rounded-[1px] ${i < filled ? 'bg-cyan-300' : 'bg-white/15'}`}
        />
      ))}
    </span>
  );
};

export default IntelligenceFeed;
