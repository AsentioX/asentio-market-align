import { useEffect, useState, useCallback, useRef } from 'react';
import glassesWayfarer from '@/assets/floating/glasses-wayfarer.png';
import glassesRoundThick from '@/assets/floating/glasses-round-thick.png';
import glassesClubmaster from '@/assets/floating/glasses-clubmaster.png';
import glassesRoundRed from '@/assets/floating/glasses-round-red.png';
import glassesSmartOutline from '@/assets/floating/glasses-smart-outline.png';
import glassesSmartFilled from '@/assets/floating/glasses-smart-filled.png';
import glassesVrGoggles from '@/assets/floating/glasses-vr-goggles.png';
import glassesVrHeadset from '@/assets/floating/glasses-vr-headset.png';
import iconRocket from '@/assets/floating/icon-rocket.png';
import iconUfo from '@/assets/floating/icon-ufo.png';
import iconExplosion from '@/assets/floating/icon-explosion.png';

const floatingImages = [glassesWayfarer, glassesRoundThick, glassesClubmaster, glassesRoundRed, glassesSmartOutline, glassesSmartFilled, glassesVrGoggles, glassesVrHeadset];
const streakImages = [iconRocket, iconUfo];

interface Particle {
  src: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface Streak {
  id: number;
  src: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  opacity: number;
  startTime: number;
  duration: number;
}

interface ExplosionConfig {
  id: number;
  x: number;
  y: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const initParticles = (): Particle[] =>
  floatingImages.map((src, i) => ({
    src,
    x: seededRandom(i * 7 + 1) * 90 + 5,
    y: seededRandom(i * 13 + 3) * 80 + 10,
    vx: (seededRandom(i * 19 + 2) - 0.5) * 0.04,
    vy: (seededRandom(i * 23 + 4) - 0.5) * 0.04,
    size: 32 + seededRandom(i * 17 + 5) * 40,
    opacity: 0.15 + seededRandom(i * 23 + 7) * 0.15,
    rotation: seededRandom(i * 29 + 9) * 360,
    rotationSpeed: (seededRandom(i * 31 + 11) - 0.5) * 0.3,
  }));

const createStreak = (): Streak => {
  const src = streakImages[Math.floor(Math.random() * streakImages.length)];
  const pattern = Math.floor(Math.random() * 4);
  let startX: number, startY: number, endX: number, endY: number;
  switch (pattern) {
    case 0: startX = -5; startY = 10 + Math.random() * 60; endX = 105; endY = startY + (Math.random() * 30 - 15); break;
    case 1: startX = 105; startY = 10 + Math.random() * 60; endX = -5; endY = startY + (Math.random() * 30 - 15); break;
    case 2: startX = -5; startY = -5; endX = 70 + Math.random() * 30; endY = 70 + Math.random() * 25; break;
    default: startX = 105; startY = -5; endX = Math.random() * 30; endY = 70 + Math.random() * 25; break;
  }
  const duration = 3000 + Math.random() * 2000;
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return {
    id: Date.now() + Math.random(),
    src,
    x: startX,
    y: startY,
    vx: dx / duration * 16, // per-frame velocity at ~60fps
    vy: dy / duration * 16,
    size: 50 + Math.random() * 30,
    rotation: angle - 45,
    opacity: 0,
    startTime: performance.now(),
    duration,
  };
};

const DirectoryFloatingElements = () => {
  const particlesRef = useRef<Particle[]>(initParticles());
  const streaksRef = useRef<Streak[]>([]);
  const [renderTick, setRenderTick] = useState(0);
  const [explosions, setExplosions] = useState<ExplosionConfig[]>([]);
  const [killCount, setKillCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics loop for both particles and streaks
  useEffect(() => {
    let animId: number;
    const step = () => {
      const ps = particlesRef.current;
      const now = performance.now();

      // Move particles
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > 95) { p.x = 95; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > 90) { p.y = 90; p.vy *= -1; }
      }

      // Collision detection
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i]; const b = ps[j];
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) / 2 * 0.08;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist; const ny = dy / dist;
            const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (dvn < 0) {
              a.vx -= dvn * nx; a.vy -= dvn * ny;
              b.vx += dvn * nx; b.vy += dvn * ny;
              a.rotationSpeed += (Math.random() - 0.5) * 0.4;
              b.rotationSpeed += (Math.random() - 0.5) * 0.4;
            }
            const overlap = minDist - dist;
            a.x += nx * overlap * 0.5; a.y += ny * overlap * 0.5;
            b.x -= nx * overlap * 0.5; b.y -= ny * overlap * 0.5;
          }
        }
      }

      // Dampen rotation
      for (const p of ps) { p.rotationSpeed *= 0.998; }

      // Move streaks
      const streaks = streaksRef.current;
      for (const s of streaks) {
        s.x += s.vx;
        s.y += s.vy;
        const elapsed = now - s.startTime;
        const progress = elapsed / s.duration;
        if (progress < 0.05) {
          s.opacity = progress / 0.05;
        } else if (progress > 0.9) {
          s.opacity = Math.max(0, (1 - progress) / 0.1);
        } else {
          s.opacity = 1;
        }
      }
      // Remove expired streaks
      streaksRef.current = streaks.filter(s => (now - s.startTime) < s.duration);

      setRenderTick(t => t + 1);
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  const spawnStreak = useCallback(() => {
    streaksRef.current = [...streaksRef.current, createStreak()];
  }, []);

  // Spacebar spawns a streak
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        spawnStreak();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spawnStreak]);

  // Auto-spawn streaks
  useEffect(() => {
    // Spawn one immediately
    spawnStreak();
    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 10000;
      return setTimeout(() => { spawnStreak(); timeoutId = scheduleNext(); }, delay);
    };
    let timeoutId = scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [spawnStreak]);

  const handleStreakClick = useCallback((streak: Streak, e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;
    const x = ((clickX - containerRect.left) / containerRect.width) * 100;
    const y = ((clickY - containerRect.top) / containerRect.height) * 100;
    streaksRef.current = streaksRef.current.filter(s => s.id !== streak.id);
    setKillCount(prev => prev + 1);
    const explosion: ExplosionConfig = { id: Date.now() + Math.random(), x, y };
    setExplosions(prev => [...prev, explosion]);
    setTimeout(() => setExplosions(prev => prev.filter(ex => ex.id !== explosion.id)), 600);
  }, []);

  const particles = particlesRef.current;
  const streaks = streaksRef.current;

  return (
    <>
      <style>{`
        @keyframes explosion-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(20deg); opacity: 0.8; }
          100% { transform: scale(0) rotate(45deg); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ cursor: 'crosshair' }}>
        {/* Physics-based floating glasses */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute will-change-transform"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              transform: `rotate(${p.rotation}deg)`,
              filter: 'brightness(2) invert(1) drop-shadow(0 0 2px rgba(255,255,255,0.3))',
            }}
          >
            <img src={p.src} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        ))}

        {/* Streaking rocket/UFO - JS driven */}
        {streaks.map(s => (
          <div
            key={s.id}
            className="absolute pointer-events-auto"
            onClick={(e) => handleStreakClick(s, e)}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              cursor: 'crosshair',
              zIndex: 20,
              transform: `rotate(${s.rotation}deg)`,
              filter: 'invert(1) drop-shadow(0 0 12px rgba(0,255,255,0.9)) drop-shadow(0 0 24px rgba(0,200,255,0.6))',
            }}
          >
            <img src={s.src} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        ))}

        {/* Explosions */}
        {explosions.map(ex => (
          <div
            key={ex.id}
            className="absolute"
            style={{
              left: `${ex.x}%`,
              top: `${ex.y}%`,
              width: 60,
              height: 60,
              marginLeft: -30,
              marginTop: -30,
              zIndex: 30,
              filter: 'brightness(2) invert(1) drop-shadow(0 0 6px rgba(255,255,255,0.7))',
              animation: 'explosion-pop 0.6s ease-out forwards',
            }}
          >
            <img src={iconExplosion} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-4 right-4 z-50"
        style={{ cursor: 'default', fontFamily: "'Share Tech Mono', monospace" }}
      >
        <span className="text-lg tracking-widest text-white/80">
          {String(killCount).padStart(3, '0')}
        </span>
      </div>
    </>
  );
};

export default DirectoryFloatingElements;
