import { createContext, useContext, useState, ReactNode } from 'react';

export type AutonomyLevel = 'assist' | 'semi' | 'full';

export const AUTONOMY_LEVELS: { value: AutonomyLevel; label: string; description: string; tone: string }[] = [
  { value: 'assist', label: 'Assist', description: 'I suggest. You decide every action.', tone: 'text-stone-600' },
  { value: 'semi',   label: 'Semi-Autonomous', description: 'I act on high confidence — but ask first.', tone: 'text-indigo-700' },
  { value: 'full',   label: 'Full Autonomy', description: 'I act on high confidence. You review after.', tone: 'text-violet-700' },
];

interface Ctx {
  level: AutonomyLevel;
  setLevel: (l: AutonomyLevel) => void;
}

const AutonomyCtx = createContext<Ctx | null>(null);

export const AutonomyProvider = ({ children }: { children: ReactNode }) => {
  const [level, setLevel] = useState<AutonomyLevel>('semi');
  return <AutonomyCtx.Provider value={{ level, setLevel }}>{children}</AutonomyCtx.Provider>;
};

export const useAutonomy = () => {
  const ctx = useContext(AutonomyCtx);
  if (!ctx) throw new Error('useAutonomy must be used within AutonomyProvider');
  return ctx;
};
