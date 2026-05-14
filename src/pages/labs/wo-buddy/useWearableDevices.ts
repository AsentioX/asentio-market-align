// Real wearable integration for W.O.Buddy
// Uses the Web Bluetooth API + BLE Heart Rate Service (0x180D) to stream
// live data from any standards-compliant strap or watch (Polar, Wahoo,
// Garmin HRM, Coospo, Scosche, etc.).
//
// Browser support: Chrome / Edge / Opera on desktop + Android.
// iOS Safari and Apple Watch are NOT supported (Apple restriction).

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
  rrIntervals?: number[]; // ms, for HRV
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

// BLE GATT UUIDs
const HR_SERVICE = 0x180d;
const HR_MEASUREMENT_CHAR = 0x2a37;
const BATTERY_SERVICE = 0x180f;
const BATTERY_LEVEL_CHAR = 0x2a19;

// ---------------------------------------------------------------------------
// Singleton store: device list + the currently-streaming HR sample.
// ---------------------------------------------------------------------------

interface ConnectedHandle {
  device: BluetoothDevice;
  hrChar?: BluetoothRemoteGATTCharacteristic;
  onHr?: (e: Event) => void;
  onDisconnect?: () => void;
}

let _devices: WearableDevice[] = [];
const _handles = new Map<string, ConnectedHandle>();
let _listeners: Array<() => void> = [];

// Latest HR sample keyed by device id (so multiple components share it)
const _liveByDevice = new Map<string, { hr: number; rr: number[]; ts: number }>();

function notify() {
  _listeners.forEach(fn => fn());
}

function parseHrMeasurement(value: DataView): { hr: number; rr: number[] } {
  // BLE HR Measurement format (Bluetooth SIG GATT 0x2A37)
  const flags = value.getUint8(0);
  const hr16 = (flags & 0x01) !== 0;
  const energyExpended = (flags & 0x08) !== 0;
  const rrPresent = (flags & 0x10) !== 0;

  let offset = 1;
  let hr: number;
  if (hr16) {
    hr = value.getUint16(offset, true);
    offset += 2;
  } else {
    hr = value.getUint8(offset);
    offset += 1;
  }
  if (energyExpended) offset += 2;

  const rr: number[] = [];
  if (rrPresent) {
    while (offset + 1 < value.byteLength) {
      const raw = value.getUint16(offset, true);
      rr.push((raw / 1024) * 1000); // 1/1024 s units → ms
      offset += 2;
    }
  }
  return { hr, rr };
}

function updateDevice(id: string, patch: Partial<WearableDevice>) {
  _devices = _devices.map(d => (d.id === id ? { ...d, ...patch } : d));
  notify();
}

export function isWebBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

async function readBattery(server: BluetoothRemoteGATTServer): Promise<number | undefined> {
  try {
    const svc = await server.getPrimaryService(BATTERY_SERVICE);
    const ch = await svc.getCharacteristic(BATTERY_LEVEL_CHAR);
    const v = await ch.readValue();
    return v.getUint8(0);
  } catch {
    return undefined;
  }
}

async function attachHandlers(handle: ConnectedHandle, deviceId: string) {
  const { device } = handle;
  const server = await device.gatt!.connect();

  const battery = await readBattery(server);
  if (battery !== undefined) updateDevice(deviceId, { battery });

  const svc = await server.getPrimaryService(HR_SERVICE);
  const ch = await svc.getCharacteristic(HR_MEASUREMENT_CHAR);
  handle.hrChar = ch;

  const onHr = (e: Event) => {
    const target = e.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;
    const sample = parseHrMeasurement(target.value);
    _liveByDevice.set(deviceId, { ...sample, ts: Date.now() });
    updateDevice(deviceId, { lastSync: 'Just now' });
  };
  handle.onHr = onHr;
  ch.addEventListener('characteristicvaluechanged', onHr);
  await ch.startNotifications();
}

export async function connectHeartRateDevice(): Promise<WearableDevice | null> {
  if (!isWebBluetoothSupported()) {
    throw new Error(
      'Web Bluetooth is not available in this browser. Use Chrome or Edge on desktop or Android. (Apple Watch and iOS Safari are not supported.)'
    );
  }

  const device = await (navigator as any).bluetooth.requestDevice({
    filters: [{ services: [HR_SERVICE] }],
    optionalServices: [BATTERY_SERVICE],
  }) as BluetoothDevice;

  const id = device.id;
  const name = device.name || 'Heart Rate Monitor';
  const lower = name.toLowerCase();
  const type: WearableDevice['type'] =
    /watch|fenix|forerunner|venu|vivoactive|epix/.test(lower) ? 'watch' :
    /ring/.test(lower) ? 'ring' : 'band';
  const brand =
    /polar/.test(lower) ? 'Polar' :
    /wahoo|tickr/.test(lower) ? 'Wahoo' :
    /garmin/.test(lower) ? 'Garmin' :
    /coospo/.test(lower) ? 'Coospo' :
    /scosche/.test(lower) ? 'Scosche' :
    /whoop/.test(lower) ? 'Whoop' :
    name.split(' ')[0];

  const handle: ConnectedHandle = { device };
  _handles.set(id, handle);

  const onDisconnect = () => {
    handle.hrChar?.removeEventListener('characteristicvaluechanged', handle.onHr!);
    _liveByDevice.delete(id);
    updateDevice(id, { connected: false });
  };
  handle.onDisconnect = onDisconnect;
  device.addEventListener('gattserverdisconnected', onDisconnect);

  const wd: WearableDevice = { id, name, type, brand, connected: true, lastSync: 'Just now' };
  if (!_devices.find(d => d.id === id)) {
    _devices = [..._devices, wd];
  } else {
    updateDevice(id, { connected: true, lastSync: 'Just now' });
  }
  notify();

  await attachHandlers(handle, id);
  notify();
  return wd;
}

export async function disconnectDevice(id: string) {
  const h = _handles.get(id);
  if (h) {
    try {
      h.hrChar?.removeEventListener('characteristicvaluechanged', h.onHr!);
      await h.hrChar?.stopNotifications().catch(() => {});
      h.device.removeEventListener('gattserverdisconnected', h.onDisconnect!);
      h.device.gatt?.disconnect();
    } catch { /* noop */ }
    _handles.delete(id);
  }
  _liveByDevice.delete(id);
  updateDevice(id, { connected: false });
}

export function removeDevice(id: string) {
  disconnectDevice(id);
  _devices = _devices.filter(d => d.id !== id);
  notify();
}

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

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

  const connect = useCallback(async () => {
    return connectHeartRateDevice();
  }, []);

  const disconnect = useCallback(async (id: string) => {
    await disconnectDevice(id);
  }, []);

  const remove = useCallback((id: string) => {
    removeDevice(id);
  }, []);

  return {
    devices: _devices,
    connectedDevices,
    connect,
    disconnect,
    remove,
    supported: isWebBluetoothSupported(),
  };
}

// Live biometric stream from a real BLE HR device.
// Calories are estimated from HR (Keytel et al. simplified formula) over time
// since standard HR profile only carries beats per minute + RR intervals.
export function useWearableLiveData(isActive: boolean, selectedDeviceId: string | null) {
  const [data, setData] = useState<WearableLiveData>({
    heartRate: 0,
    heartRateZone: 'rest',
    calories: 0,
    steps: 0,
  });

  const caloriesRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  const device = _devices.find(d => d.id === selectedDeviceId && d.connected);

  useEffect(() => {
    if (!isActive || !device) return;

    // Poll the singleton store so all subscribers see the latest BLE sample.
    const id = window.setInterval(() => {
      const live = _liveByDevice.get(device.id);
      if (!live || live.hr <= 0) return;

      const now = Date.now();
      if (lastTickRef.current != null) {
        const dtMin = (now - lastTickRef.current) / 60000;
        // Simplified calorie estimate: kcal/min ≈ (HR - 60) * 0.08 (adult avg)
        const kcalPerMin = Math.max(0, (live.hr - 60) * 0.08);
        caloriesRef.current += kcalPerMin * dtMin;
      }
      lastTickRef.current = now;

      const zone = getHRZone(live.hr);
      setData({
        heartRate: live.hr,
        heartRateZone: zone.name,
        calories: Math.round(caloriesRef.current),
        steps: 0, // not available on standard HR profile
        rrIntervals: live.rr.length ? live.rr : undefined,
      });
    }, 500);

    return () => window.clearInterval(id);
  }, [isActive, device]);

  useEffect(() => {
    if (!isActive) {
      caloriesRef.current = 0;
      lastTickRef.current = null;
      setData({ heartRate: 0, heartRateZone: 'rest', calories: 0, steps: 0 });
    }
  }, [isActive]);

  return { data, device, hasDevice: !!device };
}
