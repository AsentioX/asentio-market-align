import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dumbbell, Wind, Accessibility, Camera, CameraOff, Info, Check, Share2, Sparkles, ListChecks, History, Plus, Target, TrendingUp, ChevronRight, Calendar, ArrowRight, AlertTriangle, CalendarDays, Play, Pause, Timer, ChevronDown, Hash, ImageIcon, SkipForward } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart, CartesianGrid } from 'recharts';
import { calculateScore } from './mockData';
import { shareContent, buildWorkoutShareText } from './shareUtils';
import CameraTrackingView from './CameraTrackingView';
import ExerciseWidget, { TrackedExercise } from './ExerciseWidget';
import WhyThisMatters from './WhyThisMatters';
import { useWOBuddyWorkouts } from '@/hooks/useWOBuddy';
import { useWOBuddyGoals } from '@/hooks/useWOBuddyGoals';
import { ACTIVITY_DRIVER_MAP, PERFORMANCE_DRIVERS, getGoalStatusColor, getCategoryConfig } from './goalMappings';
import { generatePlanFromGoals, getTodayIndex, EXERCISE_TYPE_ICONS, getAllExercisesForDay, getAllDriversForDay, adjustPlanForDuration, estimatePlanDuration, type PlanDay, type PlanExercise, type PlanSession } from './planEngine';
import { EXERCISE_LIBRARY, CATEGORY_CONFIG, findExercise } from './exerciseLibrary';
import { useWearableDevices, useWearableLiveData, getHRZone } from './useWearableDevices';

type Mode = 'strength' | 'cardio' | 'bodyweight';
type View = 'log' | 'history';
type WorkoutPath = 'choose' | 'plan' | 'new';
type ExerciseAction = 'pending' | 'completed' | 'dismissed' | 'deferred';

// Derive exercise lists from the library
const strengthExercises = EXERCISE_LIBRARY.filter(e => e.category === 'strength').map(e => e.name);
const cardioActivities = EXERCISE_LIBRARY.filter(e => e.category === 'endurance').map(e => e.name);
const bodyweightExercises = EXERCISE_LIBRARY.filter(e => ['bodyweight', 'power', 'agility'].includes(e.category)).map(e => e.name);
const allExerciseNames = EXERCISE_LIBRARY.map(e => e.name);

const modeConfig = {
  strength: { icon: <Dumbbell className="w-5 h-5" />, label: 'Strength', emoji: '🏋️', gradient: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', active: 'from-blue-500/30 to-blue-600/10', color: 'text-blue-400' },
  cardio: { icon: <Wind className="w-5 h-5" />, label: 'Cardio', emoji: '🏃', gradient: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', active: 'from-orange-500/30 to-orange-600/10', color: 'text-orange-400' },
  bodyweight: { icon: <Accessibility className="w-5 h-5" />, label: 'Bodyweight', emoji: '💪', gradient: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', active: 'from-purple-500/30 to-purple-600/10', color: 'text-purple-400' },
};

const exerciseRotation: Record<Mode, string[]> = {
  strength: strengthExercises.slice(0, 3),
  cardio: [],
  bodyweight: bodyweightExercises.slice(0, 5),
};

// Format seconds to mm:ss
function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface CompletedWorkoutDetail {
  id: string;
  date: string;
  duration: number; // seconds
  score: number;
  mode: string;
  exercises: Array<{ name: string; type: string; reps?: number; sets?: number; weight?: number; duration?: string }>;
}

const WorkoutPage = () => {
  const [view, setView] = useState<View>('log');
  const [mode, setMode] = useState<Mode>('strength');
  const [workoutPath, setWorkoutPath] = useState<WorkoutPath>('choose');
  const [cameraTracking, setCameraTracking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkoutDetail[]>([]);

  // Workout timer
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  const { goals, updateGoal } = useWOBuddyGoals();

  // Wearable device state
  const { connectedDevices } = useWearableDevices();
  const [selectedWearableId, setSelectedWearableId] = useState<string | null>(null);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const { data: wearableData, device: activeWearable, hasDevice: hasWearable } = useWearableLiveData(workoutStarted && !workoutPaused, selectedWearableId);

  // Auto-select first connected device
  useEffect(() => {
    if (!selectedWearableId && connectedDevices.length > 0) {
      setSelectedWearableId(connectedDevices[0].id);
    }
  }, [connectedDevices, selectedWearableId]);

  // Today's plan
  const plan = useMemo(() => generatePlanFromGoals(goals), [goals]);
  const todayIndex = getTodayIndex();
  const rawTodayPlan = plan.find(p => p.dayOfWeek === todayIndex) || null;
  const defaultDuration = rawTodayPlan ? estimatePlanDuration(rawTodayPlan) : 30;
  const [workoutDuration, setWorkoutDuration] = useState<number>(0); // 0 = not initialized yet
  
  // Initialize duration from plan estimate
  useEffect(() => {
    if (workoutDuration === 0 && defaultDuration > 0) {
      setWorkoutDuration(defaultDuration);
    }
  }, [defaultDuration, workoutDuration]);
  
  const [exerciseActions, setExerciseActions] = useState<Record<string, ExerciseAction>>({});
  const [addedExercises, setAddedExercises] = useState<PlanExercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExerciseSearch, setAddExerciseSearch] = useState('');

  const baseTodayPlan = useMemo(() => {
    if (!rawTodayPlan || workoutDuration === 0) return rawTodayPlan;
    return adjustPlanForDuration(rawTodayPlan, workoutDuration);
  }, [rawTodayPlan, workoutDuration]);

  // Merge added exercises into plan as an extra session
  const todayPlan = useMemo(() => {
    if (!baseTodayPlan) return baseTodayPlan;
    if (addedExercises.length === 0) return baseTodayPlan;
    const extraSession: PlanSession = {
      label: 'Added Exercises',
      workoutType: 'strength',
      exercises: addedExercises,
      focusDrivers: [],
      reason: 'Manually added',
    };
    return { ...baseTodayPlan, sessions: [...baseTodayPlan.sessions, extraSession] };
  }, [baseTodayPlan, addedExercises]);

  // Active exercise tracking for workout-in-progress
  const [activeExerciseKey, setActiveExerciseKey] = useState<string | null>(null);
  const [exerciseElapsed, setExerciseElapsed] = useState(0);
  const exerciseTimerActiveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showNextConfirm, setShowNextConfirm] = useState<string | null>(null);
  const [exerciseInputMode, setExerciseInputMode] = useState<Record<string, 'camera' | 'photo' | 'reps' | null>>({});
  const [manualReps, setManualReps] = useState<Record<string, number>>({});
  const [manualSets, setManualSets] = useState<Record<string, number>>({});
  const [manualWeight, setManualWeight] = useState<Record<string, number>>({});
  const [manualDistance, setManualDistance] = useState<Record<string, number>>({});
  const [manualTime, setManualTime] = useState<Record<string, number>>({});
  const [manualDuration, setManualDuration] = useState<Record<string, number>>({});

  // Rest between exercises
  const [isResting, setIsResting] = useState(false);
  const [restElapsed, setRestElapsed] = useState(0);
  const [nextExerciseAfterRest, setNextExerciseAfterRest] = useState<string | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Workout timer logic
  useEffect(() => {
    if (workoutStarted && !workoutPaused) {
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [workoutStarted, workoutPaused]);

  // Per-exercise timer
  useEffect(() => {
    if (activeExerciseKey && !isResting && workoutStarted && !workoutPaused) {
      exerciseTimerActiveRef.current = setInterval(() => setExerciseElapsed(s => s + 1), 1000);
    } else {
      if (exerciseTimerActiveRef.current) clearInterval(exerciseTimerActiveRef.current);
    }
    return () => { if (exerciseTimerActiveRef.current) clearInterval(exerciseTimerActiveRef.current); };
  }, [activeExerciseKey, isResting, workoutStarted, workoutPaused]);

  // Rest timer
  useEffect(() => {
    if (isResting && workoutStarted && !workoutPaused) {
      restTimerRef.current = setInterval(() => setRestElapsed(s => s + 1), 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [isResting, workoutStarted, workoutPaused]);

  const activateExercise = (key: string) => {
    setActiveExerciseKey(key);
    setExerciseElapsed(0);
    setIsResting(false);
    setRestElapsed(0);
    setNextExerciseAfterRest(null);
    setExerciseInputMode(prev => ({ ...prev, [key]: null }));
  };

  // Find next pending exercise key after a given key
  const findNextPendingKey = (afterKey: string): string | null => {
    if (!todayPlan) return null;
    for (const [ssi, session] of todayPlan.sessions.entries()) {
      for (const [eei] of session.exercises.entries()) {
        const nk = `${ssi}-${eei}`;
        if (nk > afterKey && (!exerciseActions[nk] || exerciseActions[nk] === 'pending')) {
          return nk;
        }
      }
    }
    return null;
  };

  const completeActiveExercise = (si: number, ei: number) => {
    const key = `${si}-${ei}`;
    handleExerciseAction(si, ei, 'completed');
    setExerciseInputMode(prev => ({ ...prev, [key]: null }));

    // Find next exercise
    const nextKey = findNextPendingKey(key);
    if (nextKey) {
      // Enter rest mode
      setActiveExerciseKey(null);
      setExerciseElapsed(0);
      setIsResting(true);
      setRestElapsed(0);
      setNextExerciseAfterRest(nextKey);
    } else {
      // No more exercises
      setActiveExerciseKey(null);
      setExerciseElapsed(0);
      setIsResting(false);
    }
  };

  const finishRest = () => {
    if (nextExerciseAfterRest) {
      activateExercise(nextExerciseAfterRest);
    }
    setIsResting(false);
    setRestElapsed(0);
    setNextExerciseAfterRest(null);
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setWorkoutPaused(false);
    setElapsedSeconds(0);
    setSessionStartTime(new Date());
    // Auto-activate first exercise
    if (todayPlan) {
      for (const [si, session] of todayPlan.sessions.entries()) {
        for (const [ei] of session.exercises.entries()) {
          const key = `${si}-${ei}`;
          if (!exerciseActions[key] || exerciseActions[key] === 'pending') {
            activateExercise(key);
            return;
          }
        }
      }
    }
  };

  const handlePauseWorkout = () => setWorkoutPaused(!workoutPaused);

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

      const durTimer = setInterval(() => { exerciseDurationRef.current += 1; }, 1000);
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

  const getSessionExerciseNames = (): string[] => {
    const names = new Set<string>();
    trackedExercises.forEach(ex => names.add(ex.name));
    if (mode === 'strength') names.add(exercise);
    else if (mode === 'cardio') names.add(cardioActivity);
    else names.add(bwExercise);
    return Array.from(names);
  };

  const getGoalImpact = () => {
    const exerciseNames = getSessionExerciseNames();
    const activatedDrivers = new Set<string>();
    exerciseNames.forEach(name => {
      const drivers = ACTIVITY_DRIVER_MAP[name] || [];
      drivers.forEach(d => activatedDrivers.add(d));
    });
    const impactedGoals = goals.filter(g => g.drivers.some(d => activatedDrivers.has(d)));
    return { drivers: Array.from(activatedDrivers), goals: impactedGoals };
  };

  const handleExerciseAction = (sessionIdx: number, exIdx: number, action: ExerciseAction) => {
    const key = `${sessionIdx}-${exIdx}`;
    setExerciseActions(prev => ({ ...prev, [key]: action }));

    // Auto-start workout timer on first "completed" action
    if (action === 'completed' && !workoutStarted) {
      handleStartWorkout();
    }

    if (action === 'completed') {
      const session = todayPlan!.sessions[sessionIdx];
      const ex = session.exercises[exIdx];
      const drivers = ACTIVITY_DRIVER_MAP[ex.name] || session.focusDrivers;
      const impactedGoals = goals.filter(g =>
        g.status !== 'achieved' && g.drivers.some(d => drivers.includes(d))
      );
      impactedGoals.forEach(g => {
        const increment = Math.max(1, Math.round(g.target_value * 0.02));
        const newVal = Math.min(g.current_value + increment, g.target_value);
        const newStatus = newVal >= g.target_value ? 'achieved' : newVal >= g.target_value * 0.6 ? 'on_track' : 'at_risk';
        updateGoal(g.id, { current_value: newVal, status: newStatus });
      });
    } else if (action === 'dismissed') {
      const session = todayPlan!.sessions[sessionIdx];
      const drivers = ACTIVITY_DRIVER_MAP[session.exercises[exIdx].name] || session.focusDrivers;
      const impactedGoals = goals.filter(g =>
        g.status === 'on_track' && g.drivers.some(d => drivers.includes(d))
      );
      impactedGoals.forEach(g => {
        if (g.current_value < g.target_value * 0.7) {
          updateGoal(g.id, { status: 'at_risk' });
        }
      });
    }
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
    setWorkoutStarted(false);
    setWorkoutPaused(false);

    // Collect completed plan exercises
    const planExercises: CompletedWorkoutDetail['exercises'] = [];
    if (todayPlan) {
      todayPlan.sessions.forEach((session, si) => {
        session.exercises.forEach((ex, ei) => {
          const key = `${si}-${ei}`;
          if (exerciseActions[key] === 'completed') {
            planExercises.push({
              name: ex.name, type: ex.type,
              reps: manualReps[key] || ex.reps,
              sets: manualSets[key] || ex.sets,
              weight: manualWeight[key] || undefined,
              duration: ex.duration,
            });
          }
        });
      });
    }

    const allExercises = [
      ...trackedExercises.map(ex => ({
        name: ex.name, type: ex.type, reps: ex.reps, sets: 1,
        weight: ex.type === 'strength' ? weight : undefined,
        duration: ex.duration, confidence: ex.confidence,
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

    // Save to local completed workouts list
    const completedDetail: CompletedWorkoutDetail = {
      id: `local-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: elapsedSeconds,
      score: totalScore,
      mode,
      exercises: planExercises.length > 0 ? planExercises : allExercises.map(e => ({
        name: e.name, type: e.type, reps: e.reps, sets: e.sets,
        weight: e.weight, duration: typeof e.duration === 'number' ? (e.duration > 0 ? `${Math.round(e.duration / 60)} min` : undefined) : undefined,
      })),
    };
    setCompletedWorkouts(prev => [completedDetail, ...prev]);

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
    setWorkoutStarted(false);
    setWorkoutPaused(false);
    setElapsedSeconds(0);
    setWorkoutPath('choose');
    setExerciseActions({});
    setActiveExerciseKey(null);
    setExerciseElapsed(0);
    setShowNextConfirm(null);
    setExerciseInputMode({});
    setManualReps({});
    setManualSets({});
    setManualWeight({});
    setIsResting(false);
    setRestElapsed(0);
    setNextExerciseAfterRest(null);
  };

  // ---- SUBMITTED: Post-workout summary ----
  if (submitted) {
    const cfg = modeConfig[mode];
    const impact = getGoalImpact();

    return (
      <div className="space-y-6">
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
            <p className="text-white/40 text-sm">
              {elapsedSeconds > 0 && <span className="text-white/60">{formatTimer(elapsedSeconds)} · </span>}
              Great effort on your {cfg.label.toLowerCase()} session.
            </p>
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
                          <p className="text-[10px] text-white/30">{g.drivers.join(', ')}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.text} font-medium`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
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

        {impact.goals.length === 0 && (
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/[0.02] rounded-2xl p-4 border border-amber-500/10 text-center">
            <Target className="w-6 h-6 text-amber-400/60 mx-auto mb-2" />
            <p className="text-xs text-white/50">No goals connected to this workout yet.</p>
            <p className="text-[11px] text-amber-400/60 mt-1">Set goals to see how each workout drives your progress.</p>
          </div>
        )}

        {trackedExercises.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Session Exercises</h3>
            <div className="space-y-2">
              {trackedExercises.map(ex => (
                <ExerciseWidget key={ex.id} exercise={ex} onUpdate={handleUpdateExercise} onRemove={handleRemoveExercise} allExercises={allExerciseNames} />
              ))}
            </div>
            <div className="mt-3 text-center text-xs text-white/30">
              {trackedExercises.length} exercises · {trackedExercises.reduce((sum, e) => sum + e.reps, 0)} total reps
            </div>
          </div>
        )}

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

  const hasSessions = todayPlan && todayPlan.sessions.length > 0 && !todayPlan.isRest;
  const allPlanExercises = todayPlan ? getAllExercisesForDay(todayPlan) : [];
  const totalPlanCount = allPlanExercises.length;
  const completedPlanCount = Object.entries(exerciseActions).filter(([, a]) => a === 'completed').length;


  // ---- WORKOUT IN PROGRESS MODE ----
  if (workoutStarted) {
    // Build flat list of exercise keys for ordering
    const allKeys: { key: string; si: number; ei: number }[] = [];
    if (todayPlan) {
      todayPlan.sessions.forEach((session, si) => {
        session.exercises.forEach((_, ei) => {
          allKeys.push({ key: `${si}-${ei}`, si, ei });
        });
      });
    }

    return (
      <div className="space-y-4">
        {/* Header with back button + total elapsed time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setWorkoutStarted(false); setWorkoutPaused(false); setElapsedSeconds(0); setActiveExerciseKey(null); setIsResting(false); }}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowRight className="w-4 h-4 text-white/60 rotate-180" />
            </button>
            <h2 className="text-sm font-semibold text-white">Workout in Progress</h2>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-white/40" />
            <span className="text-sm font-bold tabular-nums text-white/70">{formatTimer(elapsedSeconds)}</span>
            <button
              onClick={handlePauseWorkout}
              className={`ml-1 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                workoutPaused ? 'bg-emerald-500/20' : 'bg-red-500/15'
              }`}
            >
              {workoutPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-red-400" />}
            </button>
          </div>
        </div>

        {/* Wearable live data strip */}
        {hasWearable && activeWearable && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            {/* Device selector header */}
            <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5">
              <button
                onClick={() => setShowDevicePicker(!showDevicePicker)}
                className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/60 transition-colors"
              >
                <span className="text-sm">
                  {activeWearable.type === 'watch' ? '⌚' : activeWearable.type === 'ring' ? '💍' : '📱'}
                </span>
                <span className="font-medium">{activeWearable.name}</span>
                {connectedDevices.length > 1 && (
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDevicePicker ? 'rotate-180' : ''}`} />
                )}
              </button>
              <span className="text-[9px] text-emerald-400/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            {/* Device picker dropdown */}
            {showDevicePicker && connectedDevices.length > 1 && (
              <div className="px-3 pb-2 space-y-1">
                {connectedDevices.map(d => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedWearableId(d.id); setShowDevicePicker(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      d.id === selectedWearableId
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        : 'bg-white/[0.03] text-white/60 border border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{d.type === 'watch' ? '⌚' : d.type === 'ring' ? '💍' : '📱'}</span>
                    <span className="font-medium">{d.name}</span>
                    {d.battery && <span className="ml-auto text-[9px] text-white/30">🔋 {d.battery}%</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Live metrics */}
            <div className="grid grid-cols-4 gap-px bg-white/[0.04]">
              {(() => {
                const hrZone = getHRZone(wearableData.heartRate);
                return (
                  <div className="bg-[#0f1023] p-3 text-center">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">❤️ HR</p>
                    <p className={`text-lg font-bold tabular-nums ${hrZone.color}`}>{wearableData.heartRate}</p>
                    <p className={`text-[8px] font-medium mt-0.5 ${hrZone.color}`}>{hrZone.label}</p>
                  </div>
                );
              })()}
              <div className="bg-[#0f1023] p-3 text-center">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">🔥 Cal</p>
                <p className="text-lg font-bold tabular-nums text-orange-400">{wearableData.calories}</p>
                <p className="text-[8px] text-white/20 mt-0.5">active</p>
              </div>
              {activeWearable.type === 'watch' && wearableData.cadence ? (
                <div className="bg-[#0f1023] p-3 text-center">
                  <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">🦶 Cadence</p>
                  <p className="text-lg font-bold tabular-nums text-blue-400">{wearableData.cadence}</p>
                  <p className="text-[8px] text-white/20 mt-0.5">spm</p>
                </div>
              ) : (
                <div className="bg-[#0f1023] p-3 text-center">
                  <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">🫁 SpO₂</p>
                  <p className="text-lg font-bold tabular-nums text-cyan-400">{wearableData.bloodOxygen}%</p>
                  <p className="text-[8px] text-white/20 mt-0.5">oxygen</p>
                </div>
              )}
              <div className="bg-[#0f1023] p-3 text-center">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">😰 Stress</p>
                <p className="text-lg font-bold tabular-nums text-purple-400">{wearableData.stress}</p>
                <p className="text-[8px] text-white/20 mt-0.5">score</p>
              </div>
            </div>
          </div>
        )}

        {/* No wearable connected hint */}
        {!hasWearable && connectedDevices.length === 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-sm">⌚</span>
            <p className="text-[10px] text-white/30">Connect a wearable in Settings to see live biometrics here</p>
          </div>
        )}

        {/* Rest card is now rendered inline between exercises below */}

        {/* "Next Exercise?" confirmation overlay */}
        {showNextConfirm && (
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5 p-4">
            <p className="text-sm font-semibold text-white mb-1">Skip to next exercise?</p>
            <p className="text-xs text-white/40 mb-3">Your current exercise will be marked as done.</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Complete current active exercise first
                  if (activeExerciseKey) {
                    const [asi, aei] = activeExerciseKey.split('-').map(Number);
                    handleExerciseAction(asi, aei, 'completed');
                  }
                  // Activate the confirmed exercise
                  const [nsi, nei] = showNextConfirm.split('-').map(Number);
                  activateExercise(showNextConfirm);
                  setShowNextConfirm(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" /> Yes, Next Exercise
              </button>
              <button
                onClick={() => setShowNextConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active exercises from plan */}
        {hasSessions && (
          <div className="space-y-2">
            {todayPlan!.sessions.map((session, si) =>
              session.exercises.map((ex, ei) => {
                const key = `${si}-${ei}`;
                const action = exerciseActions[key] || 'pending';
                const isDone = action === 'completed' || action === 'dismissed';
                const exTypeIcon = EXERCISE_TYPE_ICONS[ex.type] || EXERCISE_TYPE_ICONS.strength;
                const isActive = activeExerciseKey === key;
                const inputMode = exerciseInputMode[key] || null;

                // Check if rest card should appear right after this exercise
                const showRestAfter = isResting && nextExerciseAfterRest && action === 'completed' && (() => {
                  // Find the key of the exercise just before nextExerciseAfterRest
                  let prevKey: string | null = null;
                  for (const [ssi, sess] of todayPlan!.sessions.entries()) {
                    for (const [eei] of sess.exercises.entries()) {
                      const nk = `${ssi}-${eei}`;
                      if (nk === nextExerciseAfterRest) return prevKey === key;
                      if (exerciseActions[nk] === 'completed') prevKey = nk;
                    }
                  }
                  return false;
                })();

                if (action === 'dismissed') return null;

                return (
                  <div key={key} className="space-y-2">
                    <div className={`rounded-2xl border overflow-hidden transition-all ${
                      isActive ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10' :
                      action === 'completed' ? 'border-emerald-500/15 opacity-50' : 'border-white/[0.08]'
                    }`}>
                      <div
                        className={`p-4 transition-all ${
                          isActive ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/5' :
                          isDone ? 'bg-white/[0.02]' : 'bg-white/[0.03]'
                        }`}
                        onClick={() => {
                          if (!isDone && !isActive) {
                            if (activeExerciseKey && activeExerciseKey !== key) {
                              setShowNextConfirm(key);
                            } else {
                              activateExercise(key);
                            }
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl w-8 text-center">
                            {action === 'completed' ? '✅' : exTypeIcon.emoji}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${isDone ? 'text-white/40 line-through' : isActive ? 'text-emerald-300' : 'text-white'}`}>{ex.name}</p>
                            <p className="text-xs text-white/40">
                              {ex.duration || (ex.sets && ex.reps ? `${ex.sets} × ${ex.reps} reps` : '10 min')}
                            </p>
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold tabular-nums text-emerald-400">{formatTimer(exerciseElapsed)}</span>
                            </div>
                          )}
                          {isDone && (
                            <span className="text-[10px] text-emerald-400/60 font-medium">Done</span>
                          )}
                        </div>

                        {isActive && ex.note && (
                          <p className="text-xs text-white/40 mt-3 ml-11 leading-relaxed">{ex.note}</p>
                        )}
                      </div>

                      {isActive && (
                        <div className="px-4 pb-4 bg-gradient-to-r from-emerald-500/5 to-transparent space-y-3">
                          {!inputMode && (
                            <div className="grid grid-cols-3 gap-2 pt-2">
                              <button
                                onClick={() => setExerciseInputMode(prev => ({ ...prev, [key]: 'camera' }))}
                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                              >
                                <Camera className="w-5 h-5 text-emerald-400" />
                                <span className="text-[10px] text-white/60 font-medium">Camera</span>
                              </button>
                              <button
                                onClick={() => setExerciseInputMode(prev => ({ ...prev, [key]: 'photo' }))}
                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                              >
                                <ImageIcon className="w-5 h-5 text-blue-400" />
                                <span className="text-[10px] text-white/60 font-medium">Photo</span>
                              </button>
                              <button
                                onClick={() => setExerciseInputMode(prev => ({ ...prev, [key]: 'reps' }))}
                                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-purple-500/10 hover:border-purple-500/20 transition-all"
                              >
                                <Hash className="w-5 h-5 text-purple-400" />
                                <span className="text-[10px] text-white/60 font-medium">Manual</span>
                              </button>
                            </div>
                          )}

                          {inputMode === 'camera' && (
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1"><Camera className="w-3 h-3" /> Camera Tracking</span>
                                <button onClick={() => setExerciseInputMode(prev => ({ ...prev, [key]: null }))} className="text-[10px] text-white/30 hover:text-white/50">Back</button>
                              </div>
                              <CameraTrackingView
                                exercise={ex.name}
                                repCount={manualReps[key] || 0}
                                onRepDetected={() => setManualReps(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))}
                                heartRate={heartRate}
                                intensity={intensity}
                              />
                            </div>
                          )}

                          {inputMode === 'photo' && (
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-blue-400 font-medium flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Take Photo</span>
                                <button onClick={() => setExerciseInputMode(prev => ({ ...prev, [key]: null }))} className="text-[10px] text-white/30 hover:text-white/50">Back</button>
                              </div>
                              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
                                <ImageIcon className="w-10 h-10 text-white/15 mx-auto mb-2" />
                                <p className="text-xs text-white/40">Take a photo of your exercise machine or setup</p>
                                <button className="mt-3 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors">
                                  📸 Open Camera
                                </button>
                              </div>
                            </div>
                          )}

                          {inputMode === 'reps' && (
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-purple-400 font-medium flex items-center gap-1"><Hash className="w-3 h-3" /> Manual Entry</span>
                                <button onClick={() => setExerciseInputMode(prev => ({ ...prev, [key]: null }))} className="text-[10px] text-white/30 hover:text-white/50">Back</button>
                              </div>
                              {(() => {
                                const libEx = findExercise(ex.name);
                                const entryType = libEx?.entryType || (ex.type === 'cardio' ? 'simple' : 'sets');
                                const metrics = libEx?.defaultMetrics || [];

                                if (entryType === 'sets') {
                                  // Strength / bodyweight sets: show sets, reps, weight
                                  const hasWeight = metrics.some(m => m.key === 'weight');
                                  const repsLabel = metrics.find(m => m.key === 'reps_per_leg') ? 'Reps/Leg' : 'Reps';
                                  return (
                                    <div className={`grid ${hasWeight ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Sets</label>
                                        <input type="number" value={manualSets[key] || ex.sets || 3}
                                          onChange={e => setManualSets(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">{repsLabel}</label>
                                        <input type="number" value={manualReps[key] || ex.reps || 10}
                                          onChange={e => setManualReps(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30" />
                                      </div>
                                      {hasWeight && (
                                        <div className="space-y-1">
                                          <label className="text-[10px] text-white/40 uppercase tracking-wider">Weight</label>
                                          <input type="number" value={manualWeight[key] || 0}
                                            onChange={e => setManualWeight(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                            className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30"
                                            placeholder="lbs" />
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                if (entryType === 'intervals') {
                                  // Endurance intervals: distance, time, rest
                                  return (
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Distance</label>
                                        <input type="number" value={manualDistance[key] || 0}
                                          onChange={e => setManualDistance(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30"
                                          placeholder={metrics.find(m => m.key === 'distance' || m.key === 'interval_distance')?.unit || 'm'} />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Time</label>
                                        <input type="number" value={manualTime[key] || 0}
                                          onChange={e => setManualTime(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30"
                                          placeholder="min" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Sets</label>
                                        <input type="number" value={manualSets[key] || 1}
                                          onChange={e => setManualSets(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30" />
                                      </div>
                                    </div>
                                  );
                                }

                                if (entryType === 'duration') {
                                  // Duration-based: duration + sets
                                  return (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Duration</label>
                                        <input type="number" value={manualDuration[key] || 60}
                                          onChange={e => setManualDuration(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30"
                                          placeholder="sec" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">Sets</label>
                                        <input type="number" value={manualSets[key] || 3}
                                          onChange={e => setManualSets(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30" />
                                      </div>
                                    </div>
                                  );
                                }

                                // Simple entry (running, cycling, etc.): distance + time
                                return (
                                  <div className="grid grid-cols-2 gap-2">
                                    {metrics.filter(m => m.required).map(m => (
                                      <div key={m.key} className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}{m.unit ? ` (${m.unit})` : ''}</label>
                                        <input type="number"
                                          value={
                                            m.key === 'distance' ? (manualDistance[key] || '') :
                                            m.key === 'time' ? (manualTime[key] || '') :
                                            m.key === 'duration' ? (manualDuration[key] || '') :
                                            (manualReps[key] || '')
                                          }
                                          onChange={e => {
                                            const val = parseFloat(e.target.value) || 0;
                                            if (m.key === 'distance') setManualDistance(prev => ({ ...prev, [key]: val }));
                                            else if (m.key === 'time') setManualTime(prev => ({ ...prev, [key]: val }));
                                            else if (m.key === 'duration') setManualDuration(prev => ({ ...prev, [key]: val }));
                                            else setManualReps(prev => ({ ...prev, [key]: val }));
                                          }}
                                          className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-purple-500/30"
                                          placeholder={m.unit || '0'} />
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          <button
                            onClick={() => completeActiveExercise(si, ei)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
                          >
                            <Check className="w-4 h-4" /> Mark as Done
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline rest card between exercises */}
                    {showRestAfter && (
                      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">😮‍💨</span>
                            <div>
                              <p className="text-sm font-semibold text-amber-300">Rest</p>
                              <p className="text-[10px] text-white/40">Recover before next exercise</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold tabular-nums text-amber-400">{formatTimer(restElapsed)}</span>
                        </div>
                        <button
                          onClick={finishRest}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-colors"
                        >
                          <Check className="w-4 h-4" /> Done Resting — Next Exercise
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Add Exercise inline */}
        {!showAddExercise ? (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06] p-3.5 transition-all"
          >
            <Plus className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium text-white/70">Add Exercise</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Add Exercise</span>
              <button onClick={() => { setShowAddExercise(false); setAddExerciseSearch(''); }} className="text-[10px] text-white/30 hover:text-white/50">Cancel</button>
            </div>
            <input
              type="text"
              value={addExerciseSearch}
              onChange={(e) => setAddExerciseSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-white/5 border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/30"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {(() => {
                const filtered = EXERCISE_LIBRARY.filter(e => !addExerciseSearch || e.name.toLowerCase().includes(addExerciseSearch.toLowerCase()) || e.category.toLowerCase().includes(addExerciseSearch.toLowerCase()));
                const grouped: Record<string, typeof filtered> = {};
                filtered.forEach(ex => {
                  const cat = CATEGORY_CONFIG[ex.category]?.label || ex.category;
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push(ex);
                });
                if (filtered.length === 0) return <p className="text-xs text-white/30 text-center py-3">No exercises found</p>;
                return Object.entries(grouped).map(([cat, exercises]) => (
                  <div key={cat}>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold px-1 pt-2 pb-1">{cat}</p>
                    {exercises.slice(0, 8).map(ex => {
                      const icon = EXERCISE_TYPE_ICONS[ex.category === 'endurance' ? 'cardio' : ex.category === 'strength' ? 'strength' : 'bodyweight'];
                      return (
                        <button
                          key={ex.id}
                          onClick={() => {
                            const planType: PlanExercise['type'] =
                              ex.category === 'endurance' ? 'cardio' :
                              ex.category === 'strength' ? 'strength' :
                              'bodyweight';
                            const newEx: PlanExercise = {
                              name: ex.name,
                              type: planType,
                              libraryId: ex.id,
                              icon: ex.icon,
                              sets: ex.entryType === 'sets' ? 3 : undefined,
                              reps: ex.entryType === 'sets' ? 10 : undefined,
                              duration: ex.entryType !== 'sets' ? '20 min' : undefined,
                            };
                            setAddedExercises(prev => [...prev, newEx]);
                            setShowAddExercise(false);
                            setAddExerciseSearch('');
                          }}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-all text-left"
                        >
                          <span className="text-lg w-7 text-center">{icon?.emoji || '⚡'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white/80 truncate">{ex.name}</p>
                            <p className="text-[10px] text-white/30 capitalize">{ex.category}</p>
                          </div>
                          <Plus className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Finish Workout */}
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-red-500/20"
        >
          <Check className="w-5 h-5" />
          <span>Finish Workout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
          {/* ===== CHOICE SCREEN: Plan card + Add Exercise + Start ===== */}
          {workoutPath === 'choose' && (
            <div className="space-y-4">
              {/* Today's Plan Card */}
              {hasSessions && (
                 <div className="rounded-2xl border border-emerald-500/20 overflow-hidden bg-emerald-950/40">
                  {/* Plan header */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-semibold text-white">Today's Plan</p>
                    </div>
                    <p className="text-xs text-white/50">
                      {todayPlan!.sessions.reduce((t, s) => t + s.exercises.length, 0)} exercises
                    </p>
                  </div>

                  {/* Duration picker */}
                  <div className="px-4 pt-3 pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <Timer className="w-3 h-3" /> Workout Duration
                      </label>
                      <span className="text-sm font-bold text-emerald-400 tabular-nums">{workoutDuration} min</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30">15</span>
                      <input
                        type="range"
                        min={15}
                        max={120}
                        step={5}
                        value={workoutDuration}
                        onChange={(e) => {
                          setWorkoutDuration(parseInt(e.target.value));
                          setExerciseActions({});
                        }}
                        className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-lg"
                      />
                      <span className="text-[10px] text-white/30">120</span>
                    </div>
                    {workoutDuration < defaultDuration && (
                      <p className="text-[10px] text-amber-400/60 mt-1.5">
                        ⚡ Plan adjusted — some exercises trimmed to fit {workoutDuration} min
                      </p>
                    )}
                  </div>

                  {/* Sessions and exercises */}
                  <div className="p-3 space-y-2">
                    <PlanSessionCards
                      todayPlan={todayPlan!}
                      exerciseActions={exerciseActions}
                      onExerciseAction={handleExerciseAction}
                      totalPlanCount={totalPlanCount}
                      completedPlanCount={completedPlanCount}
                    />
                  </div>

                  {/* Add Exercise — inside the plan card */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => setWorkoutPath('new')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06] p-3 transition-all"
                    >
                      <Plus className="w-4 h-4 text-white/50" />
                      <span className="text-sm font-medium text-white/70">Add Exercise</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Rest day */}
              {todayPlan?.isRest && todayPlan.sessions.length === 0 && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                  <span className="text-2xl">😴</span>
                  <p className="text-sm text-white/50 mt-2">Today is a rest day</p>
                  <p className="text-[11px] text-white/30 mt-1">{todayPlan.restReason}</p>
                </div>
              )}

              {/* Start Workout */}
              <button
                onClick={handleStartWorkout}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-5 h-5" />
                <span>Start Workout</span>
              </button>

              {/* Past Workouts */}
              <PastWorkoutsList completedWorkouts={completedWorkouts} workouts={workouts} />
            </div>
          )}

          {/* ===== NEW EXERCISE PATH ===== */}
          {workoutPath === 'new' && (
            <>
              <button onClick={() => setWorkoutPath('choose')} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors">
                <ArrowRight className="w-3 h-3 rotate-180" /> Back
              </button>

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
                    Camera Tracking
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cameraTracking ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                    {cameraTracking ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {cameraTracking && (
                <CameraTrackingView
                  exercise={currentDetectedExercise || (mode === 'strength' ? exercise : bwExercise)}
                  repCount={repAccumulatorRef.current + (mode === 'strength' ? reps : bwReps)}
                  onRepDetected={handleRepDetected}
                  heartRate={heartRate}
                  intensity={intensity}
                />
              )}

              {trackedExercises.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" /> Captured Exercises
                    </h3>
                    <span className="text-[10px] text-white/30">{trackedExercises.length} exercises</span>
                  </div>
                  <div className="space-y-2">
                    {trackedExercises.map(ex => (
                      <ExerciseWidget key={ex.id} exercise={ex} onUpdate={handleUpdateExercise} onRemove={handleRemoveExercise} allExercises={allExerciseNames} />
                    ))}
                  </div>
                </div>
              )}

              {/* Manual inputs */}
              {!cameraTracking && (
                <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08] space-y-4">
                  {mode === 'strength' && (
                    <>
                      <InputSelect label="Exercise" value={exercise} options={strengthExercises} onChange={setExercise} grouped />
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
                      <InputSelect label="Activity" value={cardioActivity} options={cardioActivities} onChange={setCardioActivity} grouped />
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
                      <InputSelect label="Exercise" value={bwExercise} options={bodyweightExercises} onChange={setBwExercise} grouped />
                      <NumberInput label="Total Reps" value={bwReps} onChange={setBwReps} />
                    </>
                  )}
                </div>
              )}

              <WhyThisMatters activityName={mode === 'strength' ? exercise : mode === 'cardio' ? cardioActivity : bwExercise} />


              <button
                onClick={() => {
                  // Build a PlanExercise from the current form state and append it
                  // to the user's plan, then return to the choose screen.
                  const name = mode === 'strength' ? exercise : mode === 'cardio' ? cardioActivity : bwExercise;
                  const newEx: PlanExercise = {
                    name,
                    type: mode,
                    sets: mode === 'strength' ? sets : undefined,
                    reps: mode === 'strength' ? reps : mode === 'bodyweight' ? bwReps : undefined,
                    // Encode weight in name when applicable (PlanExercise has no weight field)
                    duration: mode === 'cardio' ? `${time} min` : undefined,
                  };
                  setAddedExercises(prev => [...prev, newEx]);
                  setWorkoutPath('choose');
                }}
                className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent)]" />
                <span className="relative">Add to Workout</span>
              </button>
            </>
          )}
    </div>
  );
};

// ---- Plan Session Cards ----
const SESSION_TYPE_STYLES: Record<string, { emoji: string; color: string; gradient: string; border: string; activeGradient: string }> = {
  strength: { emoji: '🏋️', color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', activeGradient: 'from-blue-500/30 to-blue-600/10' },
  cardio: { emoji: '🏃', color: 'text-orange-400', gradient: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/20', activeGradient: 'from-orange-500/30 to-orange-600/10' },
  bodyweight: { emoji: '💪', color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', activeGradient: 'from-purple-500/30 to-purple-600/10' },
  active_recovery: { emoji: '🧘', color: 'text-teal-400', gradient: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/20', activeGradient: 'from-teal-500/30 to-teal-600/10' },
  rest: { emoji: '😴', color: 'text-white/40', gradient: 'from-white/5 to-white/[0.02]', border: 'border-white/[0.06]', activeGradient: 'from-white/10 to-white/5' },
};

interface PlanSessionCardsProps {
  todayPlan: PlanDay;
  exerciseActions: Record<string, ExerciseAction>;
  onExerciseAction: (sessionIdx: number, exIdx: number, action: ExerciseAction) => void;
  totalPlanCount: number;
  completedPlanCount: number;
}

const PlanSessionCards = ({ todayPlan, exerciseActions, onExerciseAction, totalPlanCount, completedPlanCount }: PlanSessionCardsProps) => {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* Progress count */}
      {totalPlanCount > 0 && (
        <div className="flex items-center justify-end">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
            {completedPlanCount}/{totalPlanCount}
          </span>
        </div>
      )}

      {/* Session cards — always expanded */}
      <div className="space-y-2.5">
        {todayPlan.sessions.map((session, si) => {
          const style = SESSION_TYPE_STYLES[session.workoutType] || SESSION_TYPE_STYLES.strength;
          const sessionExCount = session.exercises.length;
          const sessionCompleted = session.exercises.filter((_, ei) =>
            exerciseActions[`${si}-${ei}`] === 'completed'
          ).length;
          const sessionAllDone = sessionExCount > 0 && session.exercises.every((_, ei) =>
            exerciseActions[`${si}-${ei}`] && exerciseActions[`${si}-${ei}`] !== 'pending'
          );
          const exerciseTypes = [...new Set(session.exercises.map(e => e.type))];

          return (
            <div key={si} className={`rounded-2xl border overflow-hidden transition-all ${style.border} ${sessionAllDone ? 'opacity-60' : ''}`}>
              {/* Session header — no longer a button */}
              <div className={`flex items-center gap-3 p-3.5 bg-gradient-to-r ${style.gradient}`}>
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                  {style.emoji}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{session.label}</p>
                    {todayPlan.sessions.length > 1 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 shrink-0">Session {si + 1}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {exerciseTypes.map(t => (
                        <span key={t} className="text-xs" title={t}>{EXERCISE_TYPE_ICONS[t]?.emoji || '⚡'}</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-white/30">{sessionExCount} exercise{sessionExCount !== 1 ? 's' : ''}</span>
                    {sessionCompleted > 0 && (
                      <span className="text-[10px] text-emerald-400">{sessionCompleted}/{sessionExCount} done</span>
                    )}
                  </div>
                  {session.reason && (
                    <p className="text-[10px] text-emerald-400/60 mt-0.5 flex items-center gap-1 truncate">
                      <Sparkles className="w-2.5 h-2.5 shrink-0" /> {session.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Exercises — always visible */}
              <div className="px-3 pb-3 pt-1 space-y-1.5 bg-black/20">
                {session.exercises.map((ex, ei) => {
                  const key = `${si}-${ei}`;
                  const action = exerciseActions[key] || 'pending';
                  const isDone = action !== 'pending';
                  const isExExpanded = expandedExercise === key;
                  const exTypeIcon = EXERCISE_TYPE_ICONS[ex.type] || EXERCISE_TYPE_ICONS.strength;

                  // Show rest indicator between exercises
                  const showRestBefore = ei > 0;

                  return (
                    <div key={ei}>
                      {showRestBefore && (
                        <div className="flex items-center gap-2 py-1 px-2">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="text-[9px] text-white/20 flex items-center gap-1">😮‍💨 ~1.5 min rest</span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => { if (!isDone) setExpandedExercise(isExExpanded ? null : key); }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                            action === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/15'
                            : action === 'dismissed' ? 'bg-red-500/5 border border-red-500/10 opacity-50'
                            : action === 'deferred' ? 'bg-amber-500/5 border border-amber-500/10 opacity-60'
                            : 'bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="text-lg w-7 text-center">
                            {action === 'completed' ? '✅' : action === 'dismissed' ? '⛔' : action === 'deferred' ? '⏭️' : exTypeIcon.emoji}
                          </span>
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`text-xs font-medium ${isDone ? 'text-white/40' : 'text-white/80'}`}>{ex.name}</p>
                            <p className="text-[10px] text-white/30">
                              {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps} reps` : ex.duration || ''}
                            </p>
                          </div>
                          {!isDone && <ChevronRight className="w-3.5 h-3.5 text-white/15 shrink-0" />}
                        </button>

                        {isExExpanded && !isDone && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10">
                            <button
                              onClick={(e) => { e.stopPropagation(); onExerciseAction(si, ei, 'completed'); setExpandedExercise(null); }}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/30 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> Start
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onExerciseAction(si, ei, 'deferred'); setExpandedExercise(null); }}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-[11px] font-semibold hover:bg-amber-500/25 transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" /> Defer
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onExerciseAction(si, ei, 'dismissed'); setExpandedExercise(null); }}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 text-white/40 text-[11px] font-semibold hover:bg-red-500/15 hover:text-red-400 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rest between sessions */}
              {si < todayPlan.sessions.length - 1 && !sessionAllDone && (
                <div className="flex items-center gap-2 py-2 px-4 bg-amber-500/[0.04] border-t border-amber-500/10">
                  <span className="text-sm">😮‍💨</span>
                  <span className="text-[10px] text-amber-400/60 font-medium">~3 min rest between sessions</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All done summary */}
      {totalPlanCount > 0 && Object.keys(exerciseActions).length >= totalPlanCount &&
        Object.values(exerciseActions).every(a => a !== 'pending') && (
        <div className={`rounded-xl p-2.5 text-center text-[11px] font-medium ${
          completedPlanCount === totalPlanCount
            ? 'bg-emerald-500/10 text-emerald-400'
            : completedPlanCount >= totalPlanCount / 2
              ? 'bg-amber-500/10 text-amber-400'
              : 'bg-red-500/10 text-red-400'
        }`}>
          {completedPlanCount === totalPlanCount
            ? '🎉 Plan complete! Great discipline.'
            : completedPlanCount >= totalPlanCount / 2
              ? `⚠️ ${totalPlanCount - completedPlanCount} exercise${totalPlanCount - completedPlanCount > 1 ? 's' : ''} skipped/deferred`
              : `🔴 Most exercises skipped — this impacts your burndown`
          }
        </div>
      )}
    </div>
  );
};

// ---- Past Workouts List with expand/collapse ----
interface PastWorkoutsListProps {
  completedWorkouts: CompletedWorkoutDetail[];
  workouts: Array<{ id: string; type: 'strength' | 'cardio' | 'bodyweight'; exercise: string; score: number; date: string }>;
}

const PastWorkoutsList = ({ completedWorkouts, workouts }: PastWorkoutsListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge completed local workouts with DB workouts (avoid duplicates by date)
  const allItems: CompletedWorkoutDetail[] = [...completedWorkouts];
  const localDates = new Set(completedWorkouts.map(w => w.date));

  // Group DB workouts by date and add those not already covered
  const dbGrouped = workouts.reduce<Record<string, typeof workouts>>((acc, w) => {
    if (!acc[w.date]) acc[w.date] = [];
    acc[w.date].push(w);
    return acc;
  }, {});

  Object.entries(dbGrouped).forEach(([date, dayWorkouts]) => {
    if (!localDates.has(date)) {
      allItems.push({
        id: `db-${date}`,
        date,
        duration: dayWorkouts.length * 15 * 60,
        score: dayWorkouts.reduce((s, w) => s + w.score, 0),
        mode: dayWorkouts[0].type,
        exercises: dayWorkouts.map(w => ({ name: w.exercise, type: w.type })),
      });
    }
  });

  if (allItems.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-semibold text-white/50 text-center">Past Workouts</p>
      {allItems.slice(0, 10).map(item => {
        const isExpanded = expandedId === item.id;
        const durationMin = Math.round(item.duration / 60);
        const cfg = modeConfig[item.mode as Mode] || modeConfig.strength;

        return (
          <div key={item.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                  {cfg.emoji}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white/80">
                    {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''} · {durationMin > 0 ? `${durationMin} min` : '<1 min'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">+{item.score}</span>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isExpanded && (
              <div className="px-3.5 pb-3.5 space-y-1.5 border-t border-white/[0.06] pt-3">
                {item.exercises.map((ex, i) => {
                  const exIcon = EXERCISE_TYPE_ICONS[ex.type] || EXERCISE_TYPE_ICONS.strength;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <span className="text-base w-6 text-center">{exIcon.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/70">{ex.name}</p>
                        <p className="text-[10px] text-white/30">
                          {[
                            ex.sets && ex.reps ? `${ex.sets} × ${ex.reps} reps` : ex.reps ? `${ex.reps} reps` : null,
                            ex.weight ? `${ex.weight} lbs` : null,
                            ex.duration || null,
                          ].filter(Boolean).join(' · ') || ex.type}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {item.exercises.length === 0 && (
                  <p className="text-xs text-white/30 text-center py-2">No exercise details recorded</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---- Workout History Component with Goal Burndown ----
interface WorkoutHistoryProps {
  workouts: Array<{ id: string; type: 'strength' | 'cardio' | 'bodyweight'; exercise: string; score: number; date: string }>;
}

const WorkoutHistory = ({ workouts }: WorkoutHistoryProps) => {
  const { goals } = useWOBuddyGoals();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const selectedGoal = activeGoals.find(g => g.id === selectedGoalId) || activeGoals[0] || null;

  const burndownData = useMemo(() => {
    if (!selectedGoal) return [];
    const remaining = selectedGoal.target_value - selectedGoal.current_value;
    if (remaining <= 0) return [];
    const startDate = new Date(selectedGoal.created_at);
    const endDate = selectedGoal.deadline
      ? new Date(selectedGoal.deadline + 'T23:59:59')
      : new Date(startDate.getTime() + 30 * 86400000);
    const today = new Date();
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
    const data: { day: number; label: string; ideal: number; actual: number | null; skipped: boolean; date: string }[] = [];
    const workoutDates = new Set(workouts.map(w => w.date));
    const totalWorkoutDays = workoutDates.size;
    const pointsPerWorkoutDay = totalWorkoutDays > 0 ? selectedGoal.target_value / Math.max(totalDays, totalWorkoutDays) : 0;
    let cumulativeProgress = 0;
    const idealPerDay = selectedGoal.target_value / totalDays;

    for (let i = 0; i <= totalDays; i++) {
      const dayDate = new Date(startDate.getTime() + i * 86400000);
      const dateStr = dayDate.toISOString().split('T')[0];
      const isPast = dayDate <= today;
      const hadWorkout = workoutDates.has(dateStr);
      const idealRemaining = Math.max(0, selectedGoal.target_value - idealPerDay * i);
      if (hadWorkout) cumulativeProgress += pointsPerWorkoutDay;
      const actualRemaining = isPast ? Math.max(0, selectedGoal.target_value - cumulativeProgress) : null;
      const dayLabel = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data.push({
        day: i, label: i % Math.max(1, Math.floor(totalDays / 7)) === 0 ? dayLabel : '',
        ideal: Math.round(idealRemaining * 10) / 10,
        actual: actualRemaining !== null ? Math.round(actualRemaining * 10) / 10 : null,
        skipped: isPast && !hadWorkout && dayDate.getDay() !== 0, date: dateStr,
      });
    }
    return data;
  }, [selectedGoal, workouts]);

  const skippedDays = burndownData.filter(d => d.skipped && d.actual !== null).length;
  const pastData = burndownData.filter(d => d.actual !== null);
  const lastActual = pastData.length > 0 ? pastData[pastData.length - 1] : null;
  const drift = lastActual ? Math.round(lastActual.actual! - lastActual.ideal) : 0;

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

      {activeGoals.length > 0 && (
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Goal Burndown</span>
            </div>
            {activeGoals.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {activeGoals.map(g => (
                  <button key={g.id} onClick={() => setSelectedGoalId(g.id)}
                    className={`shrink-0 text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      (selectedGoal?.id === g.id) ? 'bg-blue-500/15 border-blue-500/20 text-blue-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:bg-white/[0.06]'
                    }`}>{g.name}</button>
                ))}
              </div>
            )}
            {selectedGoal && (
              <div className="mt-2 flex items-center gap-3 text-[10px] text-white/30">
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-white/20 rounded" /> Ideal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-400 rounded" /> Actual</span>
                {skippedDays > 0 && (
                  <span className="flex items-center gap-1 text-amber-400/60"><AlertTriangle className="w-2.5 h-2.5" /> {skippedDays} skipped</span>
                )}
              </div>
            )}
          </div>

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
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px', color: 'white' }} />
                  <Line type="monotone" dataKey="ideal" stroke="rgba(255,255,255,0.15)" strokeDasharray="6 3" strokeWidth={1.5} dot={false} connectNulls />
                  <Area type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} fill="url(#actualGrad)"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (!payload.skipped || payload.actual === null) return <circle key={props.key} cx={0} cy={0} r={0} />;
                      return <circle key={props.key} cx={cx} cy={cy} r={3} fill="#f59e0b" stroke="#f59e0b" strokeWidth={1} opacity={0.8} />;
                    }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

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
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">{cfg.emoji}</div>
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
    <div className="min-w-0">
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <div className="flex items-center gap-0.5">
        <button onClick={() => onChange(Math.max(0, value - step))} className="w-7 h-8 shrink-0 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-sm transition-colors">−</button>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="min-w-0 flex-1 bg-white/5 border border-white/5 rounded-lg px-1 py-1.5 text-center text-sm font-medium text-white focus:outline-none focus:border-emerald-500/30" />
        <button onClick={() => onChange(value + step)} className="w-7 h-8 shrink-0 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-sm transition-colors">+</button>
      </div>
    </div>
  );
}

function InputSelect({ label, value, options, onChange, grouped }: { label: string; value: string; options: string[]; onChange: (v: string) => void; grouped?: boolean }) {
  const groupedOptions = useMemo(() => {
    if (!grouped) return null;
    const groups: Record<string, string[]> = {};
    options.forEach(name => {
      const ex = EXERCISE_LIBRARY.find(e => e.name === name);
      const cat = ex ? CATEGORY_CONFIG[ex.category]?.label || ex.category : 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(name);
    });
    return groups;
  }, [options, grouped]);

  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 appearance-none">
        {groupedOptions ? (
          Object.entries(groupedOptions).map(([cat, names]) => (
            <optgroup key={cat} label={cat} className="bg-[#1a1a2e] text-white/60">
              {names.map(o => <option key={o} value={o} className="bg-[#1a1a2e]">{o}</option>)}
            </optgroup>
          ))
        ) : (
          options.map(o => <option key={o} value={o} className="bg-[#1a1a2e]">{o}</option>)
        )}
      </select>
    </div>
  );
}

export default WorkoutPage;
