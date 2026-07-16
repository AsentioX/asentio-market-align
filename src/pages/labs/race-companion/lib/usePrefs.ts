import { useEffect, useState } from 'react';
import type { Role } from '../data/schedule';

const KEY = 'race-companion:prefs:v1';

export interface Prefs {
  roles: Role[];
  reminderMinutes: number; // default lead time
  demoNow?: string | null; // ISO override for demo/debug
}

const defaultPrefs: Prefs = {
  roles: ['all'],
  reminderMinutes: 15,
  demoNow: null,
};

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultPrefs;
    return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    return defaultPrefs;
  }
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);
  const update = (patch: Partial<Prefs>) => setPrefs(p => ({ ...p, ...patch }));
  return { prefs, setPrefs, update };
}

const COMPLETED_KEY = 'race-companion:completed:v1';

export function useCompleted() {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_KEY);
      if (!raw) return new Set();
      return new Set(JSON.parse(raw));
    } catch { return new Set(); }
  });
  useEffect(() => {
    try { localStorage.setItem(COMPLETED_KEY, JSON.stringify([...completed])); } catch {}
  }, [completed]);
  const toggle = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  return { completed, toggle };
}
