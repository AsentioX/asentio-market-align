import { useState, useEffect, useRef } from 'react';
import { Dumbbell, Wind, Accessibility, Camera, CameraOff, Info, Heart, Check } from 'lucide-react';
import { calculateScore } from './mockData';

type Mode = 'strength' | 'cardio' | 'bodyweight';

const strengthExercises = ['Bench Press', 'Squats', 'Deadlift', 'Overhead Press', 'Barbell Row', 'Curls'];
const cardioActivities = ['Run', 'Row', 'Bike'];
const bodyweightExercises = ['Push-ups', 'Burpees', 'Squats', 'Pull-ups', 'Sit-ups'];

const WorkoutPage = () => {
  const [mode, setMode] = useState<Mode>('strength');
  const [cameraTracking, setCameraTracking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Strength
  const [exercise, setExercise] = useState(strengthExercises[0]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(135);

  // Cardio
  const [cardioActivity, setCardioActivity] = useState(cardioActivities[0]);
  const [distance, setDistance] = useState(5);
  const [time, setTime] = useState(25);

  // Bodyweight
  const [bwExercise, setBwExercise] = useState(bodyweightExercises[0]);
  const [bwReps, setBwReps] = useState(20);

  // Camera tracking auto-increment
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (cameraTracking) {
      intervalRef.current = setInterval(() => {
        if (mode === 'strength') setReps(r => r + 1);
        else if (mode === 'bodyweight') setBwReps(r => r + 1);
      }, 800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [cameraTracking, mode]);

  // Mock heart rate
  const [heartRate, setHeartRate] = useState(72);
  useEffect(() => {
    if (cameraTracking) {
      const hr = setInterval(() => setHeartRate(h => Math.min(180, Math.max(100, h + Math.floor(Math.random() * 11) - 5))), 1500);
      return () => clearInterval(hr);
    } else {
      setHeartRate(72);
    }
  }, [cameraTracking]);

  const getIntensity = () => {
    if (heartRate < 110) return { label: 'Light Intensity', color: 'text-green-400', msg: 'Warm up zone — ease into it' };
    if (heartRate < 145) return { label: 'Moderate Intensity', color: 'text-yellow-400', msg: 'Great pace — keep going!' };
    return { label: 'High Intensity', color: 'text-red-400', msg: 'You\'re pushing hard — stay strong!' };
  };

  const handleSubmit = () => {
    let details: Record<string, number> = {};
    if (mode === 'strength') details = { sets, reps, weight };
    else if (mode === 'cardio') details = { distance, time };
    else details = { reps: bwReps };
    const s = calculateScore(mode, details);
    setScore(s);
    setSubmitted(true);
    setCameraTracking(false);
  };

  const handleReset = () => {
    setSubmitted(false);
    setScore(0);
    setReps(10);
    setBwReps(20);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Workout Complete!</h2>
          <p className="text-white/40 text-sm">Great effort. Here's your score.</p>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5 w-full max-w-xs">
          <p className="text-4xl font-bold text-emerald-400">+{score}</p>
          <p className="text-xs text-white/40 mt-1">points earned</p>
          <div className="mt-3 flex items-start gap-1.5 text-[11px] text-white/30">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Score = effort across reps, weight, distance, and time.</span>
          </div>
        </div>
        <button onClick={handleReset} className="text-sm text-emerald-400 font-medium">Log Another Workout</button>
      </div>
    );
  }

  const intensity = getIntensity();

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Log Workout</h2>

      {/* Mode selector */}
      <div className="flex gap-2">
        {([
          { id: 'strength' as Mode, label: 'Strength', icon: <Dumbbell className="w-4 h-4" /> },
          { id: 'cardio' as Mode, label: 'Cardio', icon: <Wind className="w-4 h-4" /> },
          { id: 'bodyweight' as Mode, label: 'Bodyweight', icon: <Accessibility className="w-4 h-4" /> },
        ]).map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setCameraTracking(false); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              mode === m.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/60'
            }`}
          >
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      {/* Camera tracking toggle */}
      {mode !== 'cardio' && (
        <button
          onClick={() => setCameraTracking(!cameraTracking)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
            cameraTracking
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
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

      {/* Live feedback */}
      {cameraTracking && (
        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider">Live Feedback</span>
            <span className="flex items-center gap-1 text-xs">
              <Heart className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="font-mono text-red-400">{heartRate} bpm</span>
            </span>
          </div>
          <p className={`text-sm font-medium ${intensity.color}`}>{intensity.label}</p>
          <p className="text-xs text-white/40">{intensity.msg}</p>
        </div>
      )}

      {/* Inputs */}
      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 space-y-4">
        {mode === 'strength' && (
          <>
            <InputSelect label="Exercise" value={exercise} options={strengthExercises} onChange={setExercise} />
            <div className="grid grid-cols-3 gap-3">
              <NumberInput label="Sets" value={sets} onChange={setSets} />
              <NumberInput label="Reps" value={reps} onChange={setReps} />
              <NumberInput label="Weight (lbs)" value={weight} onChange={setWeight} step={5} />
            </div>
            <div className="text-xs text-white/30">Volume: {sets * reps * weight} lbs</div>
          </>
        )}
        {mode === 'cardio' && (
          <>
            <InputSelect label="Activity" value={cardioActivity} options={cardioActivities} onChange={setCardioActivity} />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Distance (km)" value={distance} onChange={setDistance} step={0.5} />
              <NumberInput label="Time (min)" value={time} onChange={setTime} />
            </div>
            <div className="text-xs text-white/30">Pace: {distance > 0 ? (time / distance).toFixed(1) : '0'} min/km</div>
          </>
        )}
        {mode === 'bodyweight' && (
          <>
            <InputSelect label="Exercise" value={bwExercise} options={bodyweightExercises} onChange={setBwExercise} />
            <NumberInput label="Total Reps" value={bwReps} onChange={setBwReps} />
          </>
        )}
      </div>

      {/* Score preview */}
      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/40">Estimated Score</span>
        <span className="text-lg font-bold text-emerald-400">
          +{calculateScore(mode, mode === 'strength' ? { sets, reps, weight } : mode === 'cardio' ? { distance, time } : { reps: bwReps })}
        </span>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
      >
        Complete Workout
      </button>
    </div>
  );
};

// --- Reusable form components ---

function NumberInput({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(Math.max(0, value - step))} className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-lg">−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-center text-sm font-medium text-white focus:outline-none focus:border-emerald-500/30"
        />
        <button onClick={() => onChange(value + step)} className="w-8 h-8 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 flex items-center justify-center text-lg">+</button>
      </div>
    </div>
  );
}

function InputSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 appearance-none"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#1a1a2e]">{o}</option>)}
      </select>
    </div>
  );
}

export default WorkoutPage;
