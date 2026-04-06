import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dumbbell, Wind, Accessibility, Camera, CameraOff, Info, Check, Share2, Sparkles, ListChecks, History, Plus, Target, TrendingUp, ChevronRight, Calendar, ArrowRight, AlertTriangle, CalendarDays } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart, CartesianGrid } from 'recharts';
import { calculateScore } from './mockData';
import { shareContent, buildWorkoutShareText } from './shareUtils';
import CameraTrackingView from './CameraTrackingView';
import ExerciseWidget, { TrackedExercise } from './ExerciseWidget';
import WhyThisMatters from './WhyThisMatters';
import { useWOBuddyWorkouts } from '@/hooks/useWOBuddy';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS, getGoalStatusColor, getCategoryConfig } from './goalMappings';
import { generatePlanFromGoals, getTodayIndex, type PlanDay, type PlanExercise } from './planEngine';

type Mode = 'strength' | 'cardio' | 'bodyweight';
type View = 'log' | 'history';

type ExerciseAction = 'pending' | 'completed' | 'dismissed' | 'deferred';

const strengthExercises = ['Bench Press', 'Squats', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Curls'];
const cardioActivities = ['Run', 'Row', 'Bike'];
const bodyweightExercises = ['Push-ups', 'Burpees', 'Squats', 'Pull-ups', 'Sit-ups'];

const allExerciseNames = [...strengthExercises, ...bodyweightExercises, ...cardioActivities];

const modeConfig = {
  strength: { icon: <Dumbbell className="w-5 h-5" />, label: 'Strength', emoji: '🏋️', gradient: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', active: 'from-blue-500/30 to-blue-600/10', color: 'text-blue-400' },
  cardio: { icon: <Wind className="w-5 h-5" />, label: 'Cardio', emoji: '🏃', gradient: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', active: 'from-orange-500/30 to-orange-600/10', color: 'text-orange-400' },
  bodyweight: { icon: <Accessibility className="w-5 h-5" />, label: 'Bodyweight', emoji: '💪', gradient: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', active: 'from-purple-500/30 to-purple-600/10', color: 'text-purple-400' },
};

const exerciseRotation: Record<Mode, string[]> = {
  strength: ['Bench Press', 'Curls', 'Barbell Row'],
  cardio: [],
  bodyweight: ['Push-ups', 'Squats', 'Burpees', 'Sit-ups', 'Pull-ups'],
};

const WorkoutPage = () => {
  const [view, setView] = useState<View>('log');
  const [mode, setMode] = useState<Mode>('strength');
  const [cameraTracking, setCameraTracking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [exercise, setExercise] = useState(strengthExercises[0]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(135);
  const [cardioActivity, setCardioActivity] = useState(cardioActivities[0]);
  const [distance, setDistance] = useState(5);
  const [time, setTime] = useState(25);
  const [bwExercise, setBwExercise] = useState(bodyweightExercises[0]);
  const [bwReps, setBwReps] = useState(20);

  const [trackedExercises, setTrackedExercises] = useState<TrackedExercise[]>([]);
  const [currentDetectedExercise, setCurrentDetectedExercise] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const exerciseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotationIndexRef = useRef(0);
  const repAccumulatorRef = useRef(0);
  const exerciseDurationRef = useRef(0);

  const { workouts, saveWorkout } = useWOBuddyWorkouts();
  const { goals } = useWOBuddyGoals();

  const [heartRate, setHeartRate] = useState(72);
  useEffect(() => {
    if (cameraTracking) {
      const hr = setInterval(() => setHeartRate(h => Math.min(180, Math.max(100, h + Math.floor(Math.random() * 11) - 5))), 1500);
      return () => clearInterval(hr);
    } else {
      setHeartRate(72);
    }
  }, [cameraTracking]);

  useEffect(() => {
    if (cameraTracking) {
      setSessionStartTime(new Date());
      const rotation = exerciseRotation[mode];
      if (rotation.length === 0) return;

      rotationIndexRef.current = 0;
      repAccumulatorRef.current = 0;
      exerciseDurationRef.current = 0;
      setCurrentDetectedExercise(rotation[0]);

      exerciseTimerRef.current = setInterval(() => {
        const rot = exerciseRotation[mode];
        if (rot.length === 0) return;

        if (repAccumulatorRef.current > 0) {
          const exerciseName = rot[rotationIndexRef.current % rot.length];
          const newTracked: TrackedExercise = {
            id: `${Date.now()}-${Math.random()}`,
            name: exerciseName,
            type: mode,
            reps: repAccumulatorRef.current,
            duration: exerciseDurationRef.current,
            timestamp: new Date(),
            confidence: Math.round(88 + Math.random() * 10),
          };
          setTrackedExercises(prev => [...prev, newTracked]);
        }

        rotationIndexRef.current += 1;
        repAccumulatorRef.current = 0;
        exerciseDurationRef.current = 0;
        const nextExercise = rot[rotationIndexRef.current % rot.length];
        setCurrentDetectedExercise(nextExercise);
      }, 8000 + Math.random() * 7000);

      const durTimer = setInterval(() => {
        exerciseDurationRef.current += 1;
      }, 1000);

      return () => {
        if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
        clearInterval(durTimer);
      };
    } else {
      if (repAccumulatorRef.current > 0 && currentDetectedExercise) {
        const newTracked: TrackedExercise = {
          id: `${Date.now()}-${Math.random()}`,
          name: currentDetectedExercise,
          type: mode,
          reps: repAccumulatorRef.current,
          duration: exerciseDurationRef.current,
          timestamp: new Date(),
          confidence: Math.round(88 + Math.random() * 10),
        };
        setTrackedExercises(prev => [...prev, newTracked]);
      }
      repAccumulatorRef.current = 0;
      exerciseDurationRef.current = 0;
    }
  }, [cameraTracking, mode]);

  const handleRepDetected = useCallback(() => {
    repAccumulatorRef.current += 1;
    if (mode === 'strength') setReps(r => r + 1);
    else if (mode === 'bodyweight') setBwReps(r => r + 1);
  }, [mode]);

  const handleUpdateExercise = (id: string, updates: Partial<TrackedExercise>) => {
    setTrackedExercises(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleRemoveExercise = (id: string) => {
    setTrackedExercises(prev => prev.filter(e => e.id !== id));
  };

  const getIntensity = () => {
    if (heartRate < 110) return { label: 'Light Intensity', color: 'text-green-400', msg: 'Warm up zone — ease into it', bg: 'from-green-500/10 to-green-600/5' };
    if (heartRate < 145) return { label: 'Moderate Intensity', color: 'text-yellow-400', msg: 'Great pace — keep going!', bg: 'from-yellow-500/10 to-yellow-600/5' };
    return { label: 'High Intensity', color: 'text-red-400', msg: 'You\'re pushing hard — stay strong!', bg: 'from-red-500/10 to-red-600/5' };
  };

  // Gather all exercise names used in this session for goal impact
  const getSessionExerciseNames = (): string[] => {
    const names = new Set<string>();
    trackedExercises.forEach(ex => names.add(ex.name));
    if (mode === 'strength') names.add(exercise);
    else if (mode === 'cardio') names.add(cardioActivity);
    else names.add(bwExercise);
    return Array.from(names);
  };

  // Compute goal impact from session exercises
  const getGoalImpact = () => {
    const exerciseNames = getSessionExerciseNames();
    const activatedDrivers = new Set<string>();
    exerciseNames.forEach(name => {
      const drivers = ACTIVITY_DRIVER_MAP[name] || [];
      drivers.forEach(d => activatedDrivers.add(d));
    });

    const impactedGoals = goals.filter(g =>
      g.drivers.some(d => activatedDrivers.has(d))
    );

    return {
      drivers: Array.from(activatedDrivers),
      goals: impactedGoals,
    };
  };

  const handleSubmit = async () => {
    let totalScore = 0;
    trackedExercises.forEach(ex => {
      totalScore += calculateScore(ex.type, { reps: ex.reps, sets: 1, weight: ex.type === 'strength' ? weight : 0 });
    });
    let details: Record<string, number> = {};
    if (mode === 'strength') details = { sets, reps, weight };
    else if (mode === 'cardio') details = { distance, time };
    else details = { reps: bwReps };
    totalScore += calculateScore(mode, details);

    setScore(totalScore);
    setSubmitted(true);
    setCameraTracking(false);

    // Save to DB
    const allExercises = [
      ...trackedExercises.map(ex => ({
        name: ex.name,
        type: ex.type,
        reps: ex.reps,
        sets: 1,
        weight: ex.type === 'strength' ? weight : undefined,
        duration: ex.duration,
        confidence: ex.confidence,
      })),
      {
        name: mode === 'strength' ? exercise : mode === 'cardio' ? cardioActivity : bwExercise,
        type: mode,
        reps: mode === 'cardio' ? 0 : (mode === 'strength' ? reps : bwReps),
        sets: mode === 'strength' ? sets : 1,
        weight: mode === 'strength' ? weight : undefined,
        distance: mode === 'cardio' ? distance : undefined,
        duration: mode === 'cardio' ? time * 60 : 0,
      }
    ];
    await saveWorkout(mode, totalScore, allExercises);
  };

  const handleReset = () => {
    setSubmitted(false);
    setScore(0);
    setReps(10);
    setBwReps(20);
    setTrackedExercises([]);
    setCurrentDetectedExercise('');
    setSessionStartTime(null);
  };

  // ---- SUBMITTED: Post-workout summary with goal impact ----
  if (submitted) {
    const cfg = modeConfig[mode];
    const impact = getGoalImpact();

    return (
      <div className="space-y-6">
        {/* Completion header */}
        <div className="flex flex-col items-center justify-center text-center space-y-5 pt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
              <Check className="w-12 h-12 text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-sm shadow-lg shadow-amber-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Workout Complete!</h2>
            <p className="text-white/40 text-sm">Great effort on your {cfg.label.toLowerCase()} session.</p>
          </div>
          <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl p-6 border border-white/[0.08] w-full max-w-xs">
            <p className="text-5xl font-bold text-emerald-400">+{score}</p>
            <p className="text-xs text-white/40 mt-1">points earned</p>
            <div className="mt-4 flex items-start gap-1.5 text-[11px] text-white/30 bg-white/[0.03] rounded-xl p-3">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Score = effort across reps, weight, distance, and time.</span>
            </div>
          </div>
        </div>

        {/* Performance Drivers Activated */}
        {impact.drivers.length > 0 && (
          <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Drivers Activated</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {impact.drivers.map(d => {
                const info = PERFORMANCE_DRIVERS.find(p => p.name === d);
                return (
                  <div key={d} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.08]">
                    <span className="text-base">{info?.icon || '⚡'}</span>
                    <div>
                      <p className="text-xs font-medium text-white/80">{d}</p>
                      <p className="text-[9px] text-white/30">{info?.description || ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Goal Impact */}
        {impact.goals.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/[0.02] rounded-2xl p-4 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Goal Impact</span>
            </div>
            <div className="space-y-3">
              {impact.goals.map(g => {
                const pct = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0;
                const statusCfg = getGoalStatusColor(g.status);
                const catCfg = getCategoryConfig(g.category);
                return (
                  <div key={g.id} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{catCfg.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{g.name}</p>
                          <p className="text-[10px] text-white/30">
                            {g.drivers.join(', ')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text} font-medium`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-white/50 font-medium tabular-nums">{pct}%</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/70 mt-2">
                      ✅ This workout contributed to your {g.drivers.filter(d => impact.drivers.includes(d)).join(' & ')} development
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No connected goals prompt */}
        {impact.goals.length === 0 && (
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/[0.02] rounded-2xl p-4 border border-amber-500/10 text-center">
            <Target className="w-6 h-6 text-amber-400/60 mx-auto mb-2" />
            <p className="text-xs text-white/50">No goals connected to this workout yet.</p>
            <p className="text-[11px] text-amber-400/60 mt-1">Set goals to see how each workout drives your progress.</p>
          </div>
        )}

        {/* Exercise summary */}
        {trackedExercises.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Session Exercises</h3>
            <div className="space-y-2">
              {trackedExercises.map(ex => (
                <ExerciseWidget
                  key={ex.id}
                  exercise={ex}
                  onUpdate={handleUpdateExercise}
                  onRemove={handleRemoveExercise}
                  allExercises={allExerciseNames}
                />
              ))}
            </div>
            <div className="mt-3 text-center text-xs text-white/30">
              {trackedExercises.length} exercises · {trackedExercises.reduce((sum, e) => sum + e.reps, 0)} total reps
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 justify-center pb-4">
          <button onClick={handleReset} className="text-sm text-emerald-400 font-medium bg-emerald-500/10 px-5 py-2.5 rounded-xl hover:bg-emerald-500/20 transition-colors">
            Log Another Workout
          </button>
          <button
            onClick={() => shareContent(buildWorkoutShareText(
              mode === 'strength' ? exercise : mode === 'cardio' ? cardioActivity : bwExercise,
              score, mode
            ))}
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    );
  }

  const intensity = getIntensity();
  const currentScore = calculateScore(mode, mode === 'strength' ? { sets, reps, weight } : mode === 'cardio' ? { distance, time } : { reps: bwReps });

  return (
    <div className="space-y-5">
      {/* View toggle: Log vs History vs Plan */}
      <div className="flex items-center gap-1.5">
        {([
          { id: 'log' as View, icon: <Plus className="w-3.5 h-3.5" />, label: 'Log' },
          { id: 'history' as View, icon: <History className="w-3.5 h-3.5" />, label: 'History' },
          { id: 'plan' as View, icon: <CalendarDays className="w-3.5 h-3.5" />, label: 'Plan' },
        ]).map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all border ${
              view === v.id
                ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400'
                : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.06]'
            }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {view === 'history' ? (
        <WorkoutHistory workouts={workouts} />
      ) : view === 'plan' ? (
        <WorkoutPlanPage />
      ) : (
        <>
          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(modeConfig) as [Mode, typeof modeConfig.strength][]).map(([id, cfg]) => (
              <button
                key={id}
                onClick={() => { setMode(id); setCameraTracking(false); }}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl text-xs font-medium transition-all border ${
                  mode === id
                    ? `bg-gradient-to-b ${cfg.active} ${cfg.border} ${cfg.color} shadow-lg`
                    : 'bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/[0.06]'
                }`}
              >
                <span className="text-2xl">{cfg.emoji}</span>
                <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
              </button>
            ))}
          </div>

          {/* Camera tracking toggle */}
          {mode !== 'cardio' && (
            <button
              onClick={() => setCameraTracking(!cameraTracking)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${
                cameraTracking
                  ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/[0.03] border-white/5 text-white/40'
              }`}
            >
              <span className="flex items-center gap-2">
                {cameraTracking ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                Camera Tracking (Demo)
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cameraTracking ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                {cameraTracking ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {/* Camera tracking view */}
          {cameraTracking && (
            <CameraTrackingView
              exercise={currentDetectedExercise || (mode === 'strength' ? exercise : bwExercise)}
              repCount={repAccumulatorRef.current + (mode === 'strength' ? reps : bwReps)}
              onRepDetected={handleRepDetected}
              heartRate={heartRate}
              intensity={intensity}
            />
          )}

          {/* Tracked exercises widgets */}
          {trackedExercises.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5" />
                  Captured Exercises
                </h3>
                <span className="text-[10px] text-white/30">{trackedExercises.length} exercises</span>
              </div>
              <div className="space-y-2">
                {trackedExercises.map(ex => (
                  <ExerciseWidget
                    key={ex.id}
                    exercise={ex}
                    onUpdate={handleUpdateExercise}
                    onRemove={handleRemoveExercise}
                    allExercises={allExerciseNames}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Manual inputs */}
          {!cameraTracking && (
            <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] space-y-4">
              {mode === 'strength' && (
                <>
                  <InputSelect label="Exercise" value={exercise} options={strengthExercises} onChange={setExercise} />
                  <div className="grid grid-cols-3 gap-3">
                    <NumberInput label="Sets" value={sets} onChange={setSets} />
                    <NumberInput label="Reps" value={reps} onChange={setReps} />
                    <NumberInput label="Weight (lbs)" value={weight} onChange={setWeight} step={5} />
                  </div>
                  <div className="text-xs text-white/30 bg-white/[0.03] rounded-lg px-3 py-2">
                    📊 Volume: <span className="text-white/60 font-medium">{(sets * reps * weight).toLocaleString()} lbs</span>
                  </div>
                </>
              )}
              {mode === 'cardio' && (
                <>
                  <InputSelect label="Activity" value={cardioActivity} options={cardioActivities} onChange={setCardioActivity} />
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput label="Distance (km)" value={distance} onChange={setDistance} step={0.5} />
                    <NumberInput label="Time (min)" value={time} onChange={setTime} />
                  </div>
                  <div className="text-xs text-white/30 bg-white/[0.03] rounded-lg px-3 py-2">
                    📊 Pace: <span className="text-white/60 font-medium">{distance > 0 ? (time / distance).toFixed(1) : '0'} min/km</span>
                  </div>
                </>
              )}
              {mode === 'bodyweight' && (
                <>
                  <InputSelect label="Exercise" value={bwExercise} options={bodyweightExercises} onChange={setBwExercise} />
                  <NumberInput label="Total Reps" value={bwReps} onChange={setBwReps} />
                </>
              )}
            </div>
          )}

          {/* Why This Matters */}
          <WhyThisMatters activityName={mode === 'strength' ? exercise : mode === 'cardio' ? cardioActivity : bwExercise} />

          {/* Score preview */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 rounded-2xl p-4 border border-emerald-500/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Estimated Score</span>
              <p className="text-xs text-white/50 mt-0.5">Based on your current inputs</p>
            </div>
            <span className="text-2xl font-bold text-emerald-400">+{currentScore}</span>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent)]" />
            <span className="relative">Complete Workout</span>
          </button>
        </>
      )}
    </div>
  );
};

// ---- Workout History Component with Goal Burndown ----
interface WorkoutHistoryProps {
  workouts: Array<{
    id: string;
    type: 'strength' | 'cardio' | 'bodyweight';
    exercise: string;
    score: number;
    date: string;
  }>;
}

const WorkoutHistory = ({ workouts }: WorkoutHistoryProps) => {
  const { goals } = useWOBuddyGoals();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const selectedGoal = activeGoals.find(g => g.id === selectedGoalId) || activeGoals[0] || null;

  // Build burndown data
  const burndownData = useMemo(() => {
    if (!selectedGoal) return [];

    const remaining = selectedGoal.target_value - selectedGoal.current_value;
    if (remaining <= 0) return [];

    // Determine timeframe: use deadline or default 30 days
    const startDate = new Date(selectedGoal.created_at);
    const endDate = selectedGoal.deadline
      ? new Date(selectedGoal.deadline + 'T23:59:59')
      : new Date(startDate.getTime() + 30 * 86400000);
    const today = new Date();

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));

    // Build day-by-day data
    const data: { day: number; label: string; ideal: number; actual: number | null; skipped: boolean; date: string }[] = [];

    // Count workouts per date
    const workoutDates = new Set(workouts.map(w => w.date));

    // Calculate points contributed per workout day (simplified: even distribution)
    const totalWorkoutDays = workoutDates.size;
    const pointsPerWorkoutDay = totalWorkoutDays > 0 ? selectedGoal.target_value / Math.max(totalDays, totalWorkoutDays) : 0;

    let cumulativeProgress = 0;
    const idealPerDay = selectedGoal.target_value / totalDays;

    for (let i = 0; i <= totalDays; i++) {
      const dayDate = new Date(startDate.getTime() + i * 86400000);
      const dateStr = dayDate.toISOString().split('T')[0];
      const isPast = dayDate <= today;
      const hadWorkout = workoutDates.has(dateStr);

      // Ideal burndown: remaining work decreases linearly
      const idealRemaining = Math.max(0, selectedGoal.target_value - idealPerDay * i);

      if (hadWorkout) {
        cumulativeProgress += pointsPerWorkoutDay;
      }

      const actualRemaining = isPast
        ? Math.max(0, selectedGoal.target_value - cumulativeProgress)
        : null;

      const dayLabel = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      data.push({
        day: i,
        label: i % Math.max(1, Math.floor(totalDays / 7)) === 0 ? dayLabel : '',
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: actualRemaining !== null ? Math.round(actualRemaining * 10) / 10 : null,
        skipped: isPast && !hadWorkout && dayDate.getDay() !== 0, // Sun = planned rest
        date: dateStr,
      });
    }

    return data;
  }, [selectedGoal, workouts]);

  // Stats
  const skippedDays = burndownData.filter(d => d.skipped && d.actual !== null).length;
  const pastData = burndownData.filter(d => d.actual !== null);
  const lastActual = pastData.length > 0 ? pastData[pastData.length - 1] : null;
  const lastIdeal = lastActual;
  const drift = lastActual && lastIdeal ? Math.round(lastActual.actual! - lastIdeal.ideal) : 0;

  if (workouts.length === 0 && activeGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-sm text-white/40">No workouts logged yet</p>
        <p className="text-xs text-white/25 mt-1">Complete a workout to see your history here.</p>
      </div>
    );
  }

  // Group workouts by date
  const grouped = workouts.reduce<Record<string, typeof workouts>>((acc, w) => {
    if (!acc[w.date]) acc[w.date] = [];
    acc[w.date].push(w);
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-xl font-bold">{workouts.length}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Total</p>
        </div>
        <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-xl font-bold text-emerald-400">{workouts.reduce((s, w) => s + w.score, 0).toLocaleString()}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Points</p>
        </div>
        <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] rounded-xl p-3 border border-white/[0.06] text-center">
          <p className="text-xl font-bold">{Object.keys(grouped).length}</p>
          <p className="text-[10px] text-white/40 mt-0.5">Days</p>
        </div>
      </div>

      {/* Goal Burndown Section */}
      {activeGoals.length > 0 && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Goal Burndown</span>
            </div>

            {/* Goal selector */}
            {activeGoals.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {activeGoals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className={`shrink-0 text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      (selectedGoal?.id === g.id)
                        ? 'bg-blue-500/15 border-blue-500/20 text-blue-400'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            {selectedGoal && (
              <div className="mt-2 flex items-center gap-3 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-white/20 rounded" /> Ideal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-emerald-400 rounded" /> Actual
                </span>
                {skippedDays > 0 && (
                  <span className="flex items-center gap-1 text-amber-400/60">
                    <AlertTriangle className="w-2.5 h-2.5" /> {skippedDays} skipped
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Chart */}
          {selectedGoal && burndownData.length > 0 && (
            <div className="h-44 px-2 pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burndownData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,15,25,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: 'white',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} remaining`,
                      name === 'ideal' ? 'Ideal' : 'Actual',
                    ]}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload;
                      if (!item) return '';
                      return `${item.date}${item.skipped ? ' ⚠️ Skipped' : ''}`;
                    }}
                  />
                  {/* Ideal line (dashed) */}
                  <Line
                    type="monotone"
                    dataKey="ideal"
                    stroke="rgba(255,255,255,0.15)"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls
                  />
                  {/* Actual progress area */}
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#34d399"
                    strokeWidth={2}
                    fill="url(#actualGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (!payload.skipped || payload.actual === null) return <circle key={props.key} cx={0} cy={0} r={0} />;
                      return (
                        <circle
                          key={props.key}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill="#f59e0b"
                          stroke="#f59e0b"
                          strokeWidth={1}
                          opacity={0.8}
                        />
                      );
                    }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Drift alert */}
          {drift > 0 && selectedGoal && (
            <div className="mx-4 mb-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/10 p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-400">Behind schedule</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  You have <span className="text-amber-400 font-medium">{drift} {selectedGoal.metric}</span> more remaining than planned.
                  {skippedDays > 0 && ` ${skippedDays} skipped day${skippedDays > 1 ? 's' : ''} contributed to this drift.`}
                </p>
              </div>
            </div>
          )}
          {drift <= 0 && selectedGoal && burndownData.length > 0 && (
            <div className="mx-4 mb-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/10 p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-emerald-400">On track or ahead</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  You're {drift === 0 ? 'right on' : `${Math.abs(drift)} ${selectedGoal.metric} ahead of`} schedule. Keep it up!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grouped workouts */}
      {Object.entries(grouped).map(([date, dayWorkouts]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3 h-3 text-white/30" />
            <span className="text-xs font-semibold text-white/50">{formatDate(date)}</span>
            <span className="text-[10px] text-white/25">· {dayWorkouts.reduce((s, w) => s + w.score, 0)} pts</span>
          </div>
          <div className="space-y-2">
            {dayWorkouts.map(w => {
              const cfg = modeConfig[w.type] || modeConfig.strength;
              return (
                <div key={w.id} className={`flex items-center gap-3 bg-gradient-to-r ${cfg.gradient} rounded-2xl p-3.5 border ${cfg.border}`}>
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{w.exercise}</p>
                    <p className="text-[10px] text-white/40 capitalize">{w.type}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">+{w.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(0, value - step))} className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-lg transition-colors">−</button>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-center text-sm font-medium text-white focus:outline-none focus:border-emerald-500/30" />
        <button onClick={() => onChange(value + step)} className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-lg transition-colors">+</button>
      </div>
    </div>
  );
}

function InputSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 appearance-none">
        {options.map(o => <option key={o} value={o} className="bg-[#1a1a2e]">{o}</option>)}
      </select>
    </div>
  );
}

export default WorkoutPage;
