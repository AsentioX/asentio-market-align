import { useEffect, useState, useCallback } from 'react';

interface FloatingElement {
  id: number;
  type: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  drift: number;
  driftSpeed: number;
}

const icons: Record<string, JSX.Element> = {
  glasses: (
    <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="28" height="20" rx="4" />
      <rect x="48" y="8" width="28" height="20" rx="4" />
      <path d="M32 18 Q40 12 48 18" />
      <line x1="4" y1="18" x2="0" y2="14" />
      <line x1="76" y1="18" x2="80" y2="14" />
      <circle cx="18" cy="18" r="6" strokeDasharray="2 2" opacity="0.5" />
      <circle cx="62" cy="18" r="6" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  ),
  smartGlasses: (
    <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16 Q6 8 14 8 L34 8 Q38 8 40 12 Q42 8 46 8 L66 8 Q74 8 74 16 L74 24 Q74 32 66 32 L46 32 Q42 32 40 28 Q38 32 34 32 L14 32 Q6 32 6 24 Z" />
      <line x1="6" y1="20" x2="0" y2="16" />
      <line x1="74" y1="20" x2="80" y2="16" />
      <rect x="12" y="14" width="20" height="12" rx="2" opacity="0.3" />
      <rect x="48" y="14" width="20" height="12" rx="2" opacity="0.3" />
      <circle cx="30" cy="12" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  ),
  neuralNetwork: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <circle cx="12" cy="16" r="4" />
      <circle cx="12" cy="32" r="4" />
      <circle cx="12" cy="48" r="4" />
      <circle cx="32" cy="20" r="4" />
      <circle cx="32" cy="44" r="4" />
      <circle cx="52" cy="32" r="4" />
      <line x1="16" y1="16" x2="28" y2="20" opacity="0.5" />
      <line x1="16" y1="16" x2="28" y2="44" opacity="0.3" />
      <line x1="16" y1="32" x2="28" y2="20" opacity="0.5" />
      <line x1="16" y1="32" x2="28" y2="44" opacity="0.5" />
      <line x1="16" y1="48" x2="28" y2="44" opacity="0.5" />
      <line x1="16" y1="48" x2="28" y2="20" opacity="0.3" />
      <line x1="36" y1="20" x2="48" y2="32" opacity="0.5" />
      <line x1="36" y1="44" x2="48" y2="32" opacity="0.5" />
    </svg>
  ),
  chip: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="16" width="32" height="32" rx="4" />
      <rect x="24" y="24" width="16" height="16" rx="2" opacity="0.4" />
      <line x1="24" y1="12" x2="24" y2="16" />
      <line x1="32" y1="12" x2="32" y2="16" />
      <line x1="40" y1="12" x2="40" y2="16" />
      <line x1="24" y1="48" x2="24" y2="52" />
      <line x1="32" y1="48" x2="32" y2="52" />
      <line x1="40" y1="48" x2="40" y2="52" />
      <line x1="12" y1="24" x2="16" y2="24" />
      <line x1="12" y1="32" x2="16" y2="32" />
      <line x1="12" y1="40" x2="16" y2="40" />
      <line x1="48" y1="24" x2="52" y2="24" />
      <line x1="48" y1="32" x2="52" y2="32" />
      <line x1="48" y1="40" x2="52" y2="40" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 Q16 4 32 4 Q48 4 60 20 Q48 36 32 36 Q16 36 4 20 Z" />
      <circle cx="32" cy="20" r="10" />
      <circle cx="32" cy="20" r="4" fill="currentColor" opacity="0.4" />
      <path d="M22 20 Q27 14 32 14" opacity="0.3" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 56 L32 32" />
      <path d="M20 48 Q12 44 12 36 Q8 32 10 26 Q8 20 14 16 Q16 8 24 8 Q28 4 32 4 Q36 4 40 8 Q48 8 50 16 Q56 20 54 26 Q56 32 52 36 Q52 44 44 48" />
      <path d="M22 20 Q28 24 32 20 Q36 16 42 20" opacity="0.4" />
      <path d="M18 32 Q24 28 32 32 Q40 36 46 32" opacity="0.4" />
    </svg>
  ),
  vrHeadset: (
    <svg viewBox="0 0 80 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 16 Q8 8 20 8 L60 8 Q72 8 72 16 L72 32 Q72 40 60 40 L48 40 Q44 40 40 36 Q36 40 32 40 L20 40 Q8 40 8 32 Z" />
      <line x1="8" y1="24" x2="2" y2="20" />
      <line x1="72" y1="24" x2="78" y2="20" />
      <rect x="16" y="14" width="20" height="18" rx="4" opacity="0.3" />
      <rect x="44" y="14" width="20" height="18" rx="4" opacity="0.3" />
      <path d="M36 24 L44 24" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 48 48" fill="currentColor" stroke="none" opacity="0.6">
      <path d="M24 4 L26 20 L42 18 L28 24 L36 40 L24 28 L12 40 L20 24 L4 18 L22 20 Z" />
    </svg>
  ),
};

const elementTypes = Object.keys(icons);

const DirectoryFloatingElements = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  const createElements = useCallback(() => {
    const count = 12;
    const newElements: FloatingElement[] = [];
    for (let i = 0; i < count; i++) {
      newElements.push({
        id: i,
        type: elementTypes[i % elementTypes.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.3 + Math.random() * 0.8,
        size: 20 + Math.random() * 30,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        opacity: 0.08 + Math.random() * 0.12,
        drift: Math.random() * Math.PI * 2,
        driftSpeed: 0.2 + Math.random() * 0.5,
      });
    }
    setElements(newElements);
  }, []);

  useEffect(() => {
    createElements();
  }, [createElements]);

  useEffect(() => {
    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElements(prev =>
        prev.map(el => ({
          ...el,
          y: ((el.y - el.speed * 0.02 + 100) % 120) - 10,
          rotation: el.rotation + el.rotationSpeed,
          drift: el.drift + el.driftSpeed * 0.01,
        }))
      );
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map(el => (
        <div
          key={el.id}
          className="absolute text-white"
          style={{
            left: `${el.x + Math.sin(el.drift) * 3}%`,
            top: `${el.y}%`,
            width: el.size,
            height: el.size,
            opacity: el.opacity,
            transform: `rotate(${el.rotation}deg)`,
            transition: 'none',
            willChange: 'transform, top, left',
          }}
        >
          {icons[el.type]}
        </div>
      ))}
    </div>
  );
};

export default DirectoryFloatingElements;
