import { useMemo, useState } from 'react';
import { Target, TrendingUp, Sparkles, ChevronDown, ChevronUp, Dumbbell, Wind, Flame, RotateCcw, CalendarDays, Zap, Clock, ArrowRight } from 'lucide-react';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import { PERFORMANCE_DRIVERS, GOAL_CATEGORIES, getGoalStatusColor, getCategoryConfig } from './goalMappings';
import { generatePlanFromGoals } from './planEngine';

interface TrainingPhase {
  name: string;
  weeks: string;
  focus: string;
  description: string;
  drivers: string[];
  intensity: 'low' | 'moderate' | 'high';
}

function generatePhases(goals: ReturnType<typeof useWOBuddyGoals>['goals']): TrainingPhase[] {
  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const allDrivers = [...new Set(activeGoals.flatMap(g => g.drivers))];

  if (activeGoals.length === 0) {
    return [
      { name: 'Foundation', weeks: 'Weeks 1–3', focus: 'Build habits & baseline', description: 'Establish consistent training routine with moderate intensity across all movement patterns.', drivers: ['Strength', 'Endurance'], intensity: 'low' },
      { name: 'Development', weeks: 'Weeks 4–8', focus: 'Progressive overload', description: 'Gradually increase volume and intensity. Introduce more complex movements.', drivers: ['Strength', 'Power'], intensity: 'moderate' },
      { name: 'Peak', weeks: 'Weeks 9–12', focus: 'Performance push', description: 'High intensity training blocks with planned deloads. Test new personal records.', drivers: ['Power', 'Efficiency'], intensity: 'high' },
    ];
  }

  const hasStrength = allDrivers.includes('Strength') || allDrivers.includes('Power');
  const hasEndurance = allDrivers.includes('Endurance') || allDrivers.includes('Efficiency');
  const hasMobility = allDrivers.includes('Mobility') || allDrivers.includes('Stability');

  const phases: TrainingPhase[] = [
    {
      name: 'Adaptation',
      weeks: 'Weeks 1–2',
      focus: 'Movement quality & habit building',
      description: 'Learn proper form, establish training frequency, and build a movement foundation.',
      drivers: hasMobility ? ['Mobility', 'Stability', ...allDrivers.slice(0, 1)] : ['Technique', ...allDrivers.slice(0, 1)],
      intensity: 'low',
    },
    {
      name: 'Base Building',
      weeks: 'Weeks 3–6',
      focus: hasEndurance ? 'Aerobic base & volume' : 'Strength foundation',
      description: hasEndurance
        ? 'Build aerobic capacity with steady-state work. Increase training volume gradually.'
        : 'Progressive overload on compound lifts. Build work capacity and muscle endurance.',
      drivers: allDrivers.slice(0, 3),
      intensity: 'moderate',
    },
    {
      name: 'Intensification',
      weeks: 'Weeks 7–10',
      focus: hasStrength ? 'Heavy loading & power' : 'Tempo & threshold work',
      description: hasStrength
        ? 'Increase intensity with heavier loads and explosive movements. Reduce volume slightly.'
        : 'Push pace thresholds and improve efficiency. Include interval training.',
      drivers: allDrivers.filter(d => ['Strength', 'Power', 'Efficiency', 'Endurance'].includes(d)),
      intensity: 'high',
    },
    {
      name: 'Realization',
      weeks: 'Weeks 11–12',
      focus: 'Test & celebrate progress',
      description: 'Taper volume, maintain intensity. Test progress against your goals and set new targets.',
      drivers: allDrivers,
      intensity: 'moderate',
    },
  ];

  return phases;
}

const INTENSITY_CONFIG = {
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15', bar: 'w-1/3 bg-emerald-400' },
  moderate: { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/15', bar: 'w-2/3 bg-amber-400' },
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/15', bar: 'w-full bg-red-400' },
};

const TrainingPlanPage = () => {
  const { goals, loading, isAuthenticated } = useWOBuddyGoals();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(0);

  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const allDrivers = [...new Set(activeGoals.flatMap(g => g.drivers))];
  const phases = useMemo(() => generatePhases(goals), [goals]);
  const plan = useMemo(() => generatePlanFromGoals(goals), [goals]);

  const trainingDaysPerWeek = plan.filter(d => !d.isRest).length;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Target className="w-12 h-12 text-white/20" />
        <h2 className="text-lg font-bold">Sign in to see your plan</h2>
        <p className="text-sm text-white/40">Create an account to get a personalized training plan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white">Training Plan</h2>
        <p className="text-xs text-white/40 mt-0.5">Your roadmap to achieving your goals</p>
      </div>

      {/* Overview strip */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-white">{phases.length}</p>
          <p className="text-[10px] text-white/40">Phases</p>
        </div>
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-white">12</p>
          <p className="text-[10px] text-white/40">Weeks</p>
        </div>
        <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">{trainingDaysPerWeek}</p>
          <p className="text-[10px] text-white/40">Days/Week</p>
        </div>
      </div>

      {/* Active goals driving the plan */}
      {activeGoals.length > 0 ? (
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/10 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white/80">Plan built around:</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {activeGoals.map(g => {
                  const cat = getCategoryConfig(g.category);
                  return (
                    <span key={g.id} className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 ${cat?.color || 'text-white/60'}`}>
                      {g.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
          <Zap className="w-5 h-5 text-white/20 mx-auto mb-2" />
          <p className="text-xs text-white/40">Add goals to get a personalized training plan</p>
          <p className="text-[10px] text-white/30 mt-1">Showing a balanced default plan</p>
        </div>
      )}

      {/* Performance drivers focus */}
      {allDrivers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/50">Key Performance Drivers</p>
          <div className="flex flex-wrap gap-1.5">
            {allDrivers.map(d => {
              const driver = PERFORMANCE_DRIVERS.find(pd => pd.name === d);
              return (
                <div key={d} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <span className="text-sm">{driver?.icon || '🎯'}</span>
                  <span className="text-[11px] text-white/70 font-medium">{d}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase timeline */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-white/50">Training Phases</p>
        <div className="space-y-2">
          {phases.map((phase, i) => {
            const isExpanded = expandedPhase === i;
            const intensity = INTENSITY_CONFIG[phase.intensity];
            
            return (
              <button
                key={i}
                onClick={() => setExpandedPhase(isExpanded ? null : i)}
                className="w-full text-left rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Phase number */}
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-emerald-400">{i + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{phase.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{phase.weeks}</span>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5">{phase.focus}</p>
                  </div>

                  <div className="text-white/20">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-white/[0.04] pt-2 space-y-3">
                    <p className="text-[11px] text-white/60 leading-relaxed">{phase.description}</p>

                    {/* Intensity bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">Intensity</span>
                        <span className={`text-[10px] font-medium ${intensity.color}`}>{intensity.label}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full ${intensity.bar} transition-all`} />
                      </div>
                    </div>

                    {/* Focus drivers for this phase */}
                    {phase.drivers.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/40">Focus Areas</span>
                        <div className="flex flex-wrap gap-1">
                          {phase.drivers.map(d => {
                            const driver = PERFORMANCE_DRIVERS.find(pd => pd.name === d);
                            return (
                              <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/60 flex items-center gap-1">
                                <span>{driver?.icon || '🎯'}</span>
                                {d}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Connector arrow between phases */}
                {i < phases.length - 1 && !isExpanded && null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase flow visualization */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
        <p className="text-[10px] text-white/40 mb-2">Progression Flow</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {phases.map((phase, i) => {
            const intensity = INTENSITY_CONFIG[phase.intensity];
            return (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <div className={`px-2.5 py-1.5 rounded-lg ${intensity.bg} border border-white/[0.06]`}>
                  <p className={`text-[10px] font-medium ${intensity.color}`}>{phase.name}</p>
                </div>
                {i < phases.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-white/20 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanPage;
