// Shared wearable device state for W.O.Buddy
// Simulates real-time biometric data from connected devices

import { useState, useEffect, useCallback, useRef } from 'react';

export interface WearableDevice {
  id: string;
  name: string;
  type: 'watch' | 'ring' | 'band' | 'phone';
  brand: string;
  connected: boolean;
  battery?: number;
  lastSync?: string;
}

export interface WearableLiveData {
  heartRate: number;
  heartRateZone: 'rest' | 'warm_up' | 'fat_burn' | 'cardio' | 'peak';
  calories: number;
  steps: number;
  bloodOxygen?: number;
  skinTemp?: number;
  stress?: number;
  cadence?: number;
}

const HR_ZONES = [
  { name: 'rest' as const, min: 0, max: 99, color: 'text-stone-900/70', bg: 'bg-stone-900/10', label: 'Resting' },
  { name: 'warm_up' as const, min: 100, max: 119, color: 'text-blue-400', bg: 'bg-blue-500/15', label: 'Warm Up' },
  { name: 'fat_burn' as const, min: 120, max: 139, color: 'text-green-400', bg: 'bg-green-500/15', label: 'Fat Burn' },
  { name: 'cardio' as const, min: 140, max: 159, color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'Cardio' },
  { name: 'peak' as const, min: 160, max: 220, color: 'text-red-400', bg: 'bg-red-500/15', label: 'Peak' },
];

export function getHRZone(hr: number) {
  return HR_ZONES.find(z => hr >= z.min && hr <= z.max) || HR_ZONES[0];
}

export function getHRZones() {
  return HR_ZONES;
}

// Simulated default connected devices (matches WearableSettings mock)
const DEFAULT_DEVICES: WearableDevice[] = [
  { id: '1', name: 'Apple Watch Series 10', type: 'watch', brand: 'Apple', connected: true, battery: 72, lastSync: '2 min ago' },
  { id: '2', name: 'Oura Ring Gen 4', type: 'ring', brand: 'Oura', connected: false, lastSync: undefined },
  { id: '3', name: 'Whoop 5.0', type: 'band', brand: 'Whoop', connected: false, lastSync: undefined },
];

// Singleton state so devices persist across components in the same session
let _devices: WearableDevice[] = [...DEFAULT_DEVICES];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach(fn => fn());
}

export function useWearableDevices() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender(n => n + 1);
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter(l => l !== listener);
    };
  }, []);

  const connectedDevices = _devices.filter(d => d.connected);

  const toggleDevice = useCallback((id: string) => {
    _devices = _devices.map(d =>
      d.id === id
        ? { ...d, connected: !d.connected, lastSync: !d.connected ? 'Just now' : d.lastSync, battery: !d.connected ? Math.round(50 + Math.random() * 45) : d.battery }
        : d
    );
    notify();
  }, []);

  return { devices: _devices, connectedDevices, toggleDevice };
}

// Hook for live biometric data simulation during a workout
export function useWearableLiveData(isActive: boolean, selectedDeviceId: string | null) {
  const [data, setData] = useState<WearableLiveData>({
    heartRate: 72,
    heartRateZone: 'rest',
    calories: 0,
    steps: 0,
    bloodOxygen: 98,
    skinTemp: 97.6,
    stress: 25,
  });

  const caloriesRef = useRef(0);
  const stepsRef = useRef(0);

  // Find if the selected device is actually connected
  const device = _devices.find(d => d.id === selectedDeviceId && d.connected);

  useEffect(() => {
    if (!isActive || !device) return;

    const interval = setInterval(() => {
      setData(prev => {
        // Simulate HR that ramps up during activity
        const hrDelta = Math.floor(Math.random() * 7) - 2; // -2 to +4 bias up
        const newHR = Math.min(185, Math.max(90, prev.heartRate + hrDelta));
        const zone = getHRZone(newHR);

        // Accumulate calories and steps
        caloriesRef.current += 0.15 + Math.random() * 0.1;
        stepsRef.current += Math.floor(Math.random() * 3);

        return {
          heartRate: newHR,
          heartRateZone: zone.name,
          calories: Math.round(caloriesRef.current),
          steps: stepsRef.current,
          bloodOxygen: Math.round(95 + Math.random() * 4),
          skinTemp: +(97 + Math.random() * 1.5).toFixed(1),
          stress: Math.min(100, Math.max(10, (prev.stress || 25) + Math.floor(Math.random() * 7) - 3)),
          cadence: device.type === 'watch' ? Math.round(70 + Math.random() * 30) : undefined,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive, device]);

  // Reset accumulators when workout stops
  useEffect(() => {
    if (!isActive) {
      caloriesRef.current = 0;
      stepsRef.current = 0;
      setData({
        heartRate: 72,
        heartRateZone: 'rest',
        calories: 0,
        steps: 0,
        bloodOxygen: 98,
        skinTemp: 97.6,
        stress: 25,
      });
    }
  }, [isActive]);

  return { data, device, hasDevice: !!device };
}
