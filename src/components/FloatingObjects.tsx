import { useEffect, useState, useCallback } from 'react';

interface FloatingObject {
  id: number;
  type: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  size: number;
  rotation: number;
}

const icons: Record<string, JSX.Element> = {
  satellite: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="24" y="24" width="16" height="16" rx="2" />
      <line x1="20" y1="32" x2="8" y2="32" />
      <line x1="44" y1="32" x2="56" y2="32" />
      <line x1="8" y1="28" x2="8" y2="36" />
      <line x1="56" y1="28" x2="56" y2="36" />
      <line x1="32" y1="24" x2="32" y2="16" />
      <circle cx="32" cy="12" r="3" />
      <line x1="40" y1="40" x2="48" y2="48" />
      <line x1="24" y1="40" x2="16" y2="48" />
    </svg>
  ),
  shuttle: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 8 L40 24 L40 48 L36 56 L28 56 L24 48 L24 24 Z" />
      <path d="M24 36 L16 44 L16 52 L24 48" />
      <path d="M40 36 L48 44 L48 52 L40 48" />
      <circle cx="32" cy="20" r="3" />
      <line x1="28" y1="48" x2="36" y2="48" />
    </svg>
  ),
  saucer: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="32" cy="36" rx="24" ry="8" />
      <path d="M16 36 Q16 28 32 24 Q48 28 48 36" />
      <path d="M24 32 Q24 26 32 24 Q40 26 40 32" />
      <circle cx="20" cy="40" r="2" />
      <circle cx="32" cy="42" r="2" />
      <circle cx="44" cy="40" r="2" />
    </svg>
  ),
  comet: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="48" cy="16" r="8" />
      <path d="M42 22 Q24 32 8 56" />
      <path d="M40 20 Q20 28 4 48" />
      <path d="M44 24 Q28 36 12 58" />
    </svg>
  ),
  robot: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="20" width="24" height="20" rx="2" />
      <rect x="22" y="40" width="20" height="16" rx="2" />
      <circle cx="28" cy="28" r="3" />
      <circle cx="36" cy="28" r="3" />
      <line x1="26" y1="36" x2="38" y2="36" />
      <line x1="32" y1="12" x2="32" y2="20" />
      <circle cx="32" cy="10" r="3" />
      <line x1="20" y1="28" x2="12" y2="24" />
      <line x1="44" y1="28" x2="52" y2="24" />
      <line x1="26" y1="56" x2="26" y2="60" />
      <line x1="38" y1="56" x2="38" y2="60" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 36 L12 24 L20 20 L44 20 L52 24 L56 36 L56 44 L8 44 L8 36" />
      <line x1="20" y1="20" x2="20" y2="36" />
      <line x1="44" y1="20" x2="44" y2="36" />
      <circle cx="16" cy="44" r="5" />
      <circle cx="48" cy="44" r="5" />
      <line x1="8" y1="36" x2="56" y2="36" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="8" width="24" height="48" rx="4" />
      <line x1="20" y1="16" x2="44" y2="16" />
      <line x1="20" y1="48" x2="44" y2="48" />
      <circle cx="32" cy="52" r="2" />
      <line x1="28" y1="12" x2="36" y2="12" />
    </svg>
  ),
};

const objectTypes = ['satellite', 'shuttle', 'saucer', 'comet', 'robot', 'car', 'phone'];

const getRandomEdgePosition = (side: 'left' | 'right' | 'top' | 'bottom') => {
  switch (side) {
    case 'left':
      return { x: -10, y: Math.random() * 100 };
    case 'right':
      return { x: 110, y: Math.random() * 100 };
    case 'top':
      return { x: Math.random() * 100, y: -10 };
    case 'bottom':
      return { x: Math.random() * 100, y: 110 };
  }
};

const sides: ('left' | 'right' | 'top' | 'bottom')[] = ['left', 'right', 'top', 'bottom'];

const getOppositeSide = (side: 'left' | 'right' | 'top' | 'bottom') => {
  const opposites = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' } as const;
  return opposites[side];
};

const MAX_OBJECTS = 3;

const FloatingObjects = () => {
  const [objects, setObjects] = useState<FloatingObject[]>([]);
  const [idCounter, setIdCounter] = useState(0);

  const createObject = useCallback((specificType?: string) => {
    setObjects(prev => {
      // Don't add if we're at max capacity
      if (prev.length >= MAX_OBJECTS) return prev;
      
      const type = specificType || objectTypes[Math.floor(Math.random() * objectTypes.length)];
      const startSide = sides[Math.floor(Math.random() * sides.length)];
      const endSide = getOppositeSide(startSide);
      const start = getRandomEdgePosition(startSide);
      const end = getRandomEdgePosition(endSide);

      const newObject: FloatingObject = {
        id: Date.now() + Math.random(),
        type,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
        duration: 15 + Math.random() * 20, // 15-35 seconds
        size: 24 + Math.random() * 24, // 24-48px
        rotation: Math.random() * 360,
      };

      // Schedule removal after animation completes
      setTimeout(() => {
        setObjects(current => current.filter(obj => obj.id !== newObject.id));
      }, newObject.duration * 1000);

      return [...prev, newObject];
    });
    
    setIdCounter(prev => prev + 1);
  }, []);

  // Handle keyboard input for spawning specific objects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const keyNumber = parseInt(e.key);
      if (keyNumber >= 1 && keyNumber <= 7) {
        createObject(objectTypes[keyNumber - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createObject]);

  // Random interval spawning
  useEffect(() => {
    const scheduleNext = () => {
      // Random interval between 3-12 seconds
      const nextInterval = 3000 + Math.random() * 9000;
      
      return setTimeout(() => {
        createObject();
        timeoutId = scheduleNext();
      }, nextInterval);
    };

    // Initial spawn after 2 seconds
    let timeoutId = setTimeout(() => {
      createObject();
      timeoutId = scheduleNext();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [createObject]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {objects.map(obj => (
        <div
          key={obj.id}
          className="absolute text-asentio-blue/40"
          style={{
            width: obj.size,
            height: obj.size,
            left: `${obj.startX}%`,
            top: `${obj.startY}%`,
            transform: `rotate(${obj.rotation}deg)`,
            animation: `float-across-${obj.id} ${obj.duration}s linear forwards`,
          }}
        >
          {icons[obj.type]}
          <style>
            {`
              @keyframes float-across-${obj.id} {
                0% {
                  left: ${obj.startX}%;
                  top: ${obj.startY}%;
                  opacity: 0;
                }
                5% {
                  opacity: 1;
                }
                95% {
                  opacity: 1;
                }
                100% {
                  left: ${obj.endX}%;
                  top: ${obj.endY}%;
                  opacity: 0;
                }
              }
            `}
          </style>
        </div>
      ))}
    </div>
  );
};

export default FloatingObjects;
