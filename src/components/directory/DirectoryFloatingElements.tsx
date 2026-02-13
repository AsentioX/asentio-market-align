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

interface StreakConfig {
  id: number;
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
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

const DirectoryFloatingElements = () => {
  const particlesRef = useRef<Particle[]>(initParticles());
  const [renderTick, setRenderTick] = useState(0);
  const [streaks, setStreaks] = useState<StreakConfig[]>([]);
  const [explosions, setExplosions] = useState<ExplosionConfig[]>([]);
  const [killCount, setKillCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics loop
  useEffect(() => {
    let animId: number;
    const step = () => {
      const ps = particlesRef.current;
      // Move particles
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        // Bounce off walls (0-100 percent space)
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > 95) { p.x = 95; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > 90) { p.y = 90; p.vy *= -1; }
      }
      // Collision detection between particles
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i];
          const b = ps[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) / 2 * 0.08; // convert px size to approx % units
          if (dist < minDist && dist > 0) {
            // Normalize
            const nx = dx / dist;
            const ny = dy / dist;
            // Relative velocity
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dvn = dvx * nx + dvy * ny;
            // Only resolve if approaching
            if (dvn < 0) {
              a.vx -= dvn * nx;
              a.vy -= dvn * ny;
              b.vx += dvn * nx;
              b.vy += dvn * ny;
              // Add slight rotation kick
              a.rotationSpeed += (Math.random() - 0.5) * 0.4;
              b.rotationSpeed += (Math.random() - 0.5) * 0.4;
            }
            // Separate overlapping
            const overlap = minDist - dist;
            a.x += nx * overlap * 0.5;
            a.y += ny * overlap * 0.5;
            b.x -= nx * overlap * 0.5;
            b.y -= ny * overlap * 0.5;
          }
        }
      }
      // Dampen rotation
      for (const p of ps) {
        p.rotationSpeed *= 0.998;
      }
      setRenderTick(t => t + 1);
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Streak spawner
  const spawnStreak = useCallback(() => {
    const src = streakImages[Math.floor(Math.random() * streakImages.length)];
    const pattern = Math.floor(Math.random() * 4);
    let startX: number, startY: number, endX: number, endY: number;
    switch (pattern) {
      case 0: startX = -10; startY = 10 + Math.random() * 70; endX = 110; endY = startY + (Math.random() * 40 - 20); break;
      case 1: startX = 110; startY = 10 + Math.random() * 70; endX = -10; endY = startY + (Math.random() * 40 - 20); break;
      case 2: startX = -10; startY = -10; endX = 80 + Math.random() * 30; endY = 80 + Math.random() * 30; break;
      default: startX = 110; startY = -10; endX = -10 + Math.random() * 30; endY = 80 + Math.random() * 30; break;
    }
    const streak: StreakConfig = { id: Date.now() + Math.random(), src, startX, startY, endX, endY, size: 30 + Math.random() * 20, duration: 2 + Math.random() * 2 };
    setStreaks(prev => [...prev, streak]);
    setTimeout(() => setStreaks(prev => prev.filter(s => s.id !== streak.id)), streak.duration * 1000 + 500);
  }, []);

  const handleStreakClick = useCallback((streak: StreakConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const container = containerRef.current;
    const containerRect = container?.getBoundingClientRect() || rect;
    const x = ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100;
    const y = ((rect.top + rect.height / 2 - containerRect.top) / containerRect.height) * 100;
    setStreaks(prev => prev.filter(s => s.id !== streak.id));
    setKillCount(prev => prev + 1);
    const explosion: ExplosionConfig = { id: Date.now() + Math.random(), x, y };
    setExplosions(prev => [...prev, explosion]);
    setTimeout(() => setExplosions(prev => prev.filter(ex => ex.id !== explosion.id)), 600);
  }, []);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 14000;
      return setTimeout(() => { spawnStreak(); timeoutId = scheduleNext(); }, delay);
    };
    let timeoutId = setTimeout(() => { spawnStreak(); timeoutId = scheduleNext(); }, 5000);
    return () => clearTimeout(timeoutId);
  }, [spawnStreak]);

  const particles = particlesRef.current;

  return (
    <>
      <style>{`
        @keyframes explosion-pop {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(20deg); opacity: 0.8; }
          100% { transform: scale(0) rotate(45deg); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none streak-container" style={{ cursor: 'crosshair' }}>
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
              transition: 'none',
            }}
          >
            <img src={p.src} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        ))}

        {/* Streaking rocket/UFO */}
        {streaks.map(s => {
          const angle = Math.atan2(s.endY - s.startY, s.endX - s.startX) * (180 / Math.PI);
          return (
            <div
              key={s.id}
              className="absolute pointer-events-auto"
              onClick={(e) => handleStreakClick(s, e)}
              style={{
                left: `${s.startX}%`,
                top: `${s.startY}%`,
                width: s.size,
                height: s.size,
                cursor: 'crosshair',
                zIndex: 20,
                filter: 'brightness(2) invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.5))',
                transform: `rotate(${angle - 45}deg)`,
                animation: `streak-path-${s.id} ${s.duration}s ease-in-out forwards`,
              } as React.CSSProperties}
            >
              <img src={s.src} alt="" className="w-full h-full object-contain" draggable={false} />
              <style>{`
                @keyframes streak-path-${s.id} {
                  0% { left: ${s.startX}%; top: ${s.startY}%; opacity: 0; }
                  5% { opacity: 0.6; }
                  90% { opacity: 0.6; }
                  100% { left: ${s.endX}%; top: ${s.endY}%; opacity: 0; }
                }
              `}</style>
            </div>
          );
        })}

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

      {killCount > 0 && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20 shadow-lg"
          style={{ cursor: 'default' }}
        >
          <img src={iconExplosion} alt="" className="w-5 h-5 invert" draggable={false} />
          <span className="font-bold text-sm">{killCount}</span>
        </div>
      )}
    </>
  );
};

export default DirectoryFloatingElements;
