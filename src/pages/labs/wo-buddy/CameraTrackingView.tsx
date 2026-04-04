import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, Eye, Zap, Activity } from 'lucide-react';

interface CameraTrackingViewProps {
  exercise: string;
  repCount: number;
  onRepDetected: () => void;
  heartRate: number;
  intensity: { label: string; color: string; msg: string };
}

// Simulated skeleton keypoints for different exercise phases
const poseKeypoints = {
  pushup: {
    up: [
      { x: 50, y: 30, label: 'head' },
      { x: 50, y: 40, label: 'shoulder_l' },
      { x: 50, y: 40, label: 'shoulder_r' },
      { x: 35, y: 55, label: 'elbow_l' },
      { x: 65, y: 55, label: 'elbow_r' },
      { x: 25, y: 65, label: 'wrist_l' },
      { x: 75, y: 65, label: 'wrist_r' },
      { x: 45, y: 60, label: 'hip_l' },
      { x: 55, y: 60, label: 'hip_r' },
      { x: 40, y: 78, label: 'knee_l' },
      { x: 60, y: 78, label: 'knee_r' },
      { x: 38, y: 92, label: 'ankle_l' },
      { x: 62, y: 92, label: 'ankle_r' },
    ],
    down: [
      { x: 50, y: 45, label: 'head' },
      { x: 50, y: 52, label: 'shoulder_l' },
      { x: 50, y: 52, label: 'shoulder_r' },
      { x: 35, y: 58, label: 'elbow_l' },
      { x: 65, y: 58, label: 'elbow_r' },
      { x: 25, y: 68, label: 'wrist_l' },
      { x: 75, y: 68, label: 'wrist_r' },
      { x: 45, y: 65, label: 'hip_l' },
      { x: 55, y: 65, label: 'hip_r' },
      { x: 40, y: 80, label: 'knee_l' },
      { x: 60, y: 80, label: 'knee_r' },
      { x: 38, y: 92, label: 'ankle_l' },
      { x: 62, y: 92, label: 'ankle_r' },
    ],
  },
  squat: {
    up: [
      { x: 50, y: 15, label: 'head' },
      { x: 42, y: 28, label: 'shoulder_l' },
      { x: 58, y: 28, label: 'shoulder_r' },
      { x: 38, y: 40, label: 'elbow_l' },
      { x: 62, y: 40, label: 'elbow_r' },
      { x: 40, y: 48, label: 'wrist_l' },
      { x: 60, y: 48, label: 'wrist_r' },
      { x: 44, y: 52, label: 'hip_l' },
      { x: 56, y: 52, label: 'hip_r' },
      { x: 43, y: 72, label: 'knee_l' },
      { x: 57, y: 72, label: 'knee_r' },
      { x: 42, y: 92, label: 'ankle_l' },
      { x: 58, y: 92, label: 'ankle_r' },
    ],
    down: [
      { x: 50, y: 30, label: 'head' },
      { x: 42, y: 42, label: 'shoulder_l' },
      { x: 58, y: 42, label: 'shoulder_r' },
      { x: 32, y: 48, label: 'elbow_l' },
      { x: 68, y: 48, label: 'elbow_r' },
      { x: 34, y: 58, label: 'wrist_l' },
      { x: 66, y: 58, label: 'wrist_r' },
      { x: 44, y: 62, label: 'hip_l' },
      { x: 56, y: 62, label: 'hip_r' },
      { x: 38, y: 76, label: 'knee_l' },
      { x: 62, y: 76, label: 'knee_r' },
      { x: 42, y: 92, label: 'ankle_l' },
      { x: 58, y: 92, label: 'ankle_r' },
    ],
  },
};

const boneConnections = [
  ['head', 'shoulder_l'],
  ['head', 'shoulder_r'],
  ['shoulder_l', 'elbow_l'],
  ['shoulder_r', 'elbow_r'],
  ['elbow_l', 'wrist_l'],
  ['elbow_r', 'wrist_r'],
  ['shoulder_l', 'hip_l'],
  ['shoulder_r', 'hip_r'],
  ['hip_l', 'hip_r'],
  ['hip_l', 'knee_l'],
  ['hip_r', 'knee_r'],
  ['knee_l', 'ankle_l'],
  ['knee_r', 'ankle_r'],
];

const detectionLabels: Record<string, string> = {
  'Push-ups': 'PUSH-UP',
  'Burpees': 'BURPEE',
  'Squats': 'SQUAT',
  'Pull-ups': 'PULL-UP',
  'Sit-ups': 'SIT-UP',
  'Bench Press': 'BENCH PRESS',
  'Deadlift': 'DEADLIFT',
  'Overhead Press': 'OH PRESS',
  'Barbell Row': 'BARBELL ROW',
  'Curls': 'BICEP CURL',
};

const CameraTrackingView = ({ exercise, repCount, onRepDetected, heartRate, intensity }: CameraTrackingViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [posePhase, setPosePhase] = useState<'up' | 'down'>('up');
  const [confidence, setConfidence] = useState(94);
  const [formScore, setFormScore] = useState('Good');
  const [repFlash, setRepFlash] = useState(false);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Try to access camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch {
        setCameraError(true);
        setCameraActive(false);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Simulate pose phase changes and rep detection
  useEffect(() => {
    const repInterval = 1800 + Math.random() * 1200; // 1.8-3s per rep
    phaseTimerRef.current = setInterval(() => {
      setPosePhase(prev => {
        if (prev === 'down') {
          // Completed a rep
          onRepDetected();
          setRepFlash(true);
          setTimeout(() => setRepFlash(false), 400);
          return 'up';
        }
        return 'down';
      });
      // Vary confidence
      setConfidence(Math.round(88 + Math.random() * 10));
      // Vary form
      const forms = ['Excellent', 'Good', 'Good', 'Great', 'Adjust depth'];
      setFormScore(forms[Math.floor(Math.random() * forms.length)]);
    }, repInterval);

    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, [onRepDetected]);

  // Draw skeleton overlay on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const exerciseLower = exercise.toLowerCase();
    const poseType = exerciseLower.includes('squat') || exerciseLower.includes('deadlift') ? 'squat' : 'pushup';
    const points = poseKeypoints[poseType][posePhase];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bones
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 6;
      boneConnections.forEach(([from, to]) => {
        const p1 = points.find(p => p.label === from);
        const p2 = points.find(p => p.label === to);
        if (p1 && p2) {
          const jitter = () => (Math.random() - 0.5) * 1.5;
          ctx.beginPath();
          ctx.moveTo((p1.x + jitter()) * canvas.width / 100, (p1.y + jitter()) * canvas.height / 100);
          ctx.lineTo((p2.x + jitter()) * canvas.width / 100, (p2.y + jitter()) * canvas.height / 100);
          ctx.stroke();
        }
      });

      // Draw joints
      ctx.shadowBlur = 8;
      points.forEach(p => {
        const jitter = () => (Math.random() - 0.5) * 1;
        const x = (p.x + jitter()) * canvas.width / 100;
        const y = (p.y + jitter()) * canvas.height / 100;

        // Outer glow
        ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Inner dot
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    draw();
    const animFrame = setInterval(draw, 150);
    return () => clearInterval(animFrame);
  }, [posePhase, exercise]);

  const detectedLabel = detectionLabels[exercise] || exercise.toUpperCase();

  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black">
      {/* Camera view */}
      <div className="relative aspect-[4/3] bg-black overflow-hidden">
        {/* Video or placeholder */}
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center space-y-2">
              <Camera className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-xs text-white/30">
                {cameraError ? 'Camera unavailable — showing demo mode' : 'Initializing camera...'}
              </p>
            </div>
          </div>
        )}

        {/* Skeleton overlay canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Rep flash overlay */}
        {repFlash && (
          <div className="absolute inset-0 bg-emerald-400/10 pointer-events-none animate-pulse" />
        )}

        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between">
          {/* Detection label */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-medium">Detected</span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">{detectedLabel}</p>
            <p className="text-[10px] text-white/40">{confidence}% confidence</p>
          </div>

          {/* Heart rate */}
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border border-red-500/20">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-red-400 animate-pulse" />
              <span className="font-mono text-lg font-bold text-red-400">{heartRate}</span>
              <span className="text-[10px] text-red-400/60">bpm</span>
            </div>
            <p className={`text-[10px] mt-0.5 font-medium ${intensity.color}`}>{intensity.label}</p>
          </div>
        </div>

        {/* Center rep counter — large */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className={`bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-3 border transition-all ${
            repFlash ? 'border-emerald-400/60 shadow-lg shadow-emerald-500/30 scale-110' : 'border-white/10'
          }`}>
            <div className="text-center">
              <p className="text-4xl font-black text-white tabular-nums">{repCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">reps</p>
            </div>
          </div>
        </div>

        {/* Phase indicator */}
        <div className="absolute bottom-4 right-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
            posePhase === 'down'
              ? 'bg-amber-500/20 border border-amber-500/30'
              : 'bg-emerald-500/20 border border-emerald-500/30'
          }`}>
            {posePhase === 'down' ? '⬇️' : '⬆️'}
          </div>
        </div>

        {/* Form feedback */}
        <div className="absolute bottom-4 left-3">
          <div className={`bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1.5 border text-[10px] font-medium ${
            formScore === 'Excellent' ? 'border-emerald-500/20 text-emerald-400' :
            formScore === 'Great' ? 'border-blue-500/20 text-blue-400' :
            formScore === 'Adjust depth' ? 'border-amber-500/20 text-amber-400' :
            'border-white/10 text-white/60'
          }`}>
            <Zap className="w-3 h-3 inline mr-1" />
            Form: {formScore}
          </div>
        </div>

        {/* Recording indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-red-500/20 backdrop-blur-md rounded-full px-3 py-1 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Tracking</span>
          </div>
        </div>
      </div>

      {/* Bottom bar with intensity message */}
      <div className="px-4 py-3 bg-white/[0.03] border-t border-white/[0.06]">
        <p className="text-xs text-white/50 text-center">{intensity.msg}</p>
      </div>
    </div>
  );
};

export default CameraTrackingView;
