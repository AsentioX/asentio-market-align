import { useEffect, useState } from 'react';

export type UnitSystem = 'imperial' | 'metric';
const KEY = 'wob_units';

// Default to imperial (existing US-centric copy uses lbs/°F).
function read(): UnitSystem {
  if (typeof window === 'undefined') return 'imperial';
  return (localStorage.getItem(KEY) as UnitSystem) || 'imperial';
}

// Simple cross-component sync via window event.
const EVT = 'wob-units-change';

export function useUnits() {
  const [units, setUnitsState] = useState<UnitSystem>(read);

  useEffect(() => {
    const onChange = () => setUnitsState(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setUnits = (next: UnitSystem) => {
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVT));
    setUnitsState(next);
  };

  return { units, setUnits, isImperial: units === 'imperial', isMetric: units === 'metric' };
}

// --- Conversion helpers ---------------------------------------------------
export const kgToLbs = (kg: number) => kg * 2.20462;
export const lbsToKg = (lbs: number) => lbs / 2.20462;
export const cmToIn = (cm: number) => cm / 2.54;
export const inToCm = (i: number) => i * 2.54;
export const kmToMi = (km: number) => km * 0.621371;
export const miToKm = (mi: number) => mi / 0.621371;

export const fmtWeight = (kg: number, system: UnitSystem) =>
  system === 'imperial'
    ? `${Math.round(kgToLbs(kg))} lbs`
    : `${Math.round(kg)} kg`;

export const fmtHeight = (cm: number, system: UnitSystem) => {
  if (system === 'metric') return `${Math.round(cm)} cm`;
  const totalIn = cmToIn(cm);
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - ft * 12);
  return `${ft}'${inches}"`;
};
