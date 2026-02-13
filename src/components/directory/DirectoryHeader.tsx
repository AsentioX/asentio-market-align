import { useState, useCallback, useRef } from 'react';
import DirectoryFloatingElements from './DirectoryFloatingElements';

interface ShotDot {
  id: number;
  x: number;
  y: number;
}

interface Orb {
  top: number;
  left: number;
  size: string;
  color: string;
  blur: string;
  animation: string;
}

const orbConfigs = [
  { size: 'w-32 h-32', color: 'bg-cyan-400/30', blur: 'blur-3xl', animation: 'orb-pulse-1_6s_ease-in-out_infinite' },
  { size: 'w-20 h-20', color: 'bg-blue-300/35', blur: 'blur-2xl', animation: 'orb-pulse-2_8s_ease-in-out_infinite' },
  { size: 'w-48 h-48', color: 'bg-indigo-400/25', blur: 'blur-3xl', animation: 'orb-pulse-3_7s_ease-in-out_infinite' },
  { size: 'w-24 h-24', color: 'bg-cyan-300/30', blur: 'blur-2xl', animation: 'orb-pulse-1_9s_ease-in-out_1s_infinite' },
  { size: 'w-40 h-40', color: 'bg-blue-400/25', blur: 'blur-3xl', animation: 'orb-pulse-2_10s_ease-in-out_2s_infinite' },
  { size: 'w-16 h-16', color: 'bg-purple-400/30', blur: 'blur-2xl', animation: 'orb-pulse-3_5s_ease-in-out_0.5s_infinite' },
  { size: 'w-36 h-36', color: 'bg-cyan-500/25', blur: 'blur-3xl', animation: 'orb-pulse-1_11s_ease-in-out_3s_infinite' },
  { size: 'w-12 h-12', color: 'bg-blue-200/35', blur: 'blur-xl', animation: 'orb-pulse-2_6s_ease-in-out_1.5s_infinite' },
];

const randomPos = () => ({ top: Math.random() * 80 + 5, left: Math.random() * 85 + 5 });

const initOrbs = (): Orb[] => orbConfigs.map(c => ({ ...c, ...randomPos() }));

const playShootSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
};

const DirectoryHeader = () => {
  const [dots, setDots] = useState<ShotDot[]>([]);
  const [orbs, setOrbs] = useState<Orb[]>(initOrbs);
  const sectionRef = useRef<HTMLElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dot: ShotDot = { id: Date.now() + Math.random(), x, y };
    setDots(prev => [...prev, dot]);
    playShootSound();
    setTimeout(() => setDots(prev => prev.filter(d => d.id !== dot.id)), 400);
  }, []);

  const handleOrbIteration = useCallback((index: number) => {
    setOrbs(prev => prev.map((orb, i) => i === index ? { ...orb, ...randomPos() } : orb));
  }, []);

  return (
    <section
      ref={sectionRef}
      onClick={handleClick}
      className="relative bg-gradient-to-br from-asentio-blue via-asentio-blue/95 to-asentio-blue/90 text-white pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden"
      style={{ cursor: 'crosshair' }}
    >
      {/* Floating XR & AI Elements */}
      <DirectoryFloatingElements />
      
      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbs.map((orb, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${orb.size} ${orb.color} ${orb.blur}`}
            style={{
              top: `${orb.top}%`,
              left: `${orb.left}%`,
              animation: orb.animation.split('_').join(' '),
              transition: 'top 8s ease-in-out, left 8s ease-in-out',
            }}
            onAnimationIteration={() => handleOrbIteration(i)}
          />
        ))}
      </div>

      {/* Shot dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
        {dots.map(d => (
          <div
            key={d.id}
            className="absolute"
            style={{
              left: d.x,
              top: d.y,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              borderRadius: '50%',
              background: 'radial-gradient(circle, white 30%, rgba(255,255,255,0) 70%)',
              boxShadow: '0 0 8px 2px rgba(255,255,255,0.6)',
              animation: 'shot-dot 0.4s ease-out forwards',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes orb-pulse-1 {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes orb-pulse-2 {
          0%, 100% { opacity: 0.7; transform: scale(1.2); }
          50% { opacity: 0.2; transform: scale(0.8); }
        }
        @keyframes orb-pulse-3 {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          40% { opacity: 0.7; transform: scale(1.15); }
          70% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes shot-dot {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Global{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              XR & AI
            </span>{' '}
            Smartglasses
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            This directory tracks the leading-edge of XR and AI-powered experiences, the agencies creating these experiences, and XR enabled use cases.
          </p>
          
        </div>
      </div>
    </section>
  );
};

export default DirectoryHeader;
