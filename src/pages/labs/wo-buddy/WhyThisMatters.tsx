import { useState, useEffect } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useActivityEnrichments } from '@/hooks/useWOBuddyGoals';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS } from './goalMappings';

interface WhyThisMattersProps {
  activityName: string;
  compact?: boolean;
}

const WhyThisMatters = ({ activityName, compact = false }: WhyThisMattersProps) => {
  const enrichments = useActivityEnrichments();
  const { goals } = useWOBuddyGoals();
  const [expanded, setExpanded] = useState(false);

  const activityEnrichments = enrichments.filter(e => e.activity_name === activityName);
  const drivers = ACTIVITY_DRIVER_MAP[activityName] || [];
  
  // Find connected goals (goals whose drivers overlap with this activity's drivers)
  const connectedGoals = goals.filter(g => 
    g.drivers.some(d => drivers.includes(d))
  );

  if (activityEnrichments.length === 0 && connectedGoals.length === 0) return null;

  const primary = activityEnrichments[0];

  return (
    <div className="bg-gradient-to-r from-amber-500/8 to-amber-600/3 rounded-xl border border-amber-500/10 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">Why This Matters</span>
          {primary && !expanded && (
            <p className="text-[11px] text-stone-900/70 truncate mt-0.5">{primary.training_purpose}</p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 text-stone-900/45" /> : <ChevronDown className="w-3 h-3 text-stone-900/45" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5">
          {primary && (
            <>
              <div>
                <span className="text-[9px] text-stone-900/55 uppercase tracking-wider">Purpose</span>
                <p className="text-xs text-stone-900/75 mt-0.5">{primary.training_purpose}</p>
              </div>
              <div>
                <span className="text-[9px] text-stone-900/55 uppercase tracking-wider">How it helps</span>
                <p className="text-xs text-stone-900/75 mt-0.5">{primary.explanation}</p>
              </div>
              {primary.target_suggestion && (
                <div>
                  <span className="text-[9px] text-stone-900/55 uppercase tracking-wider">Today's focus</span>
                  <p className="text-xs text-stone-900/75 mt-0.5">{primary.target_suggestion}</p>
                </div>
              )}
            </>
          )}

          {/* Performance drivers */}
          {drivers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {drivers.map(d => {
                const info = PERFORMANCE_DRIVERS.find(p => p.name === d);
                return (
                  <span key={d} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/5 text-[9px] text-stone-900/65 border border-stone-900/10">
                    {info?.icon} {d}
                  </span>
                );
              })}
            </div>
          )}

          {/* Connected goals */}
          {connectedGoals.length > 0 && (
            <div>
              <span className="text-[9px] text-stone-900/55 uppercase tracking-wider">Goal connection</span>
              {connectedGoals.map(g => (
                <div key={g.id} className="flex items-center gap-1.5 mt-1">
                  <Target className="w-3 h-3 text-emerald-400/60" />
                  <span className="text-[11px] text-emerald-400/80">{g.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhyThisMatters;
