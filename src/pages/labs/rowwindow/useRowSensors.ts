import { useCallback, useEffect, useRef, useState } from 'react';

// =============================================================================
// useRowSensors — real device sensors for RowWindow's On-Water instruments.
//
// Wires:
//   - Compass heading      → DeviceOrientationEvent (webkitCompassHeading on iOS,
//                            absolute alpha on Android/Chrome)
//   - Position / distance  → navigator.geolocation.watchPosition
//   - Heart rate           → Web Bluetooth (GATT heart_rate service, 0x180D)
//
// Stroke rate from accelerometer is intentionally NOT included here — periodic-
// peak detection is noisy without calibration and is better left simulated so
// the UI stays meaningful indoors / on a desk demo. Same for lane offset (no
// reliable signal without channel polylines).
//
// All sensors gracefully degrade: when the API is unavailable or the user
// declines permission, the corresponding `*Status` flips to 'unavailable' and
// the consuming component can fall back to its existing simulation.
// =============================================================================

// Minimal Web Bluetooth typings (the DOM lib does not ship these by default).
type BluetoothServiceUUID = string | number;
interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
}
interface BluetoothRemoteGATTService {
  getCharacteristic(c: BluetoothServiceUUID): Promise<BluetoothRemoteGATTCharacteristic>;
}
interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(s: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
}
interface BluetoothDevice extends EventTarget {
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}
interface Bluetooth {
  requestDevice(opts: {
    filters?: Array<{ services?: BluetoothServiceUUID[] }>;
    optionalServices?: BluetoothServiceUUID[];
  }): Promise<BluetoothDevice>;
}

export type SensorStatus = 'idle' | 'requesting' | 'live' | 'denied' | 'unavailable' | 'error';

export interface RowSensorState {
  headingDeg: number | null;
  headingStatus: SensorStatus;

  speedMs: number | null;       // GPS-derived ground speed
  distanceMeters: number;       // accumulated while `tracking` is true
  positionStatus: SensorStatus;
  positionAccuracy: number | null;

  heartRate: number | null;
  heartRateStatus: SensorStatus;
  heartRateDeviceName: string | null;
}

interface UseRowSensorsOptions {
  // While true, GPS distance accumulates. Flip false to pause/stop.
  tracking: boolean;
}

// Web Bluetooth GATT identifiers for the standard Heart Rate Service.
const HR_SERVICE = 'heart_rate';
const HR_MEASUREMENT_CHAR = 'heart_rate_measurement';

export function useRowSensors({ tracking }: UseRowSensorsOptions) {
  const [state, setState] = useState<RowSensorState>({
    headingDeg: null,
    headingStatus: 'idle',
    speedMs: null,
    distanceMeters: 0,
    positionStatus: 'idle',
    positionAccuracy: null,
    heartRate: null,
    heartRateStatus: 'idle',
    heartRateDeviceName: null,
  });

  // Refs for cleanup / cross-callback access without re-subscribing
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lon: number; t: number } | null>(null);
  const orientationHandlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const hrDeviceRef = useRef<BluetoothDevice | null>(null);
  const hrCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const hrHandlerRef = useRef<((e: Event) => void) | null>(null);
  const trackingRef = useRef(tracking);

  useEffect(() => { trackingRef.current = tracking; }, [tracking]);

  // -------------------------------------------------------------------------
  // Compass heading
  // -------------------------------------------------------------------------
  const requestCompass = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setState(s => ({ ...s, headingStatus: 'unavailable' }));
      return;
    }

    setState(s => ({ ...s, headingStatus: 'requesting' }));

    // iOS 13+ requires explicit permission via a user-gesture-triggered call.
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result !== 'granted') {
          setState(s => ({ ...s, headingStatus: 'denied' }));
          return;
        }
      } catch {
        setState(s => ({ ...s, headingStatus: 'denied' }));
        return;
      }
    }

    const handler = (e: DeviceOrientationEvent) => {
      // iOS exposes a true compass heading directly.
      const iosHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
      let heading: number | null = null;
      if (typeof iosHeading === 'number' && !Number.isNaN(iosHeading)) {
        heading = iosHeading;
      } else if (e.absolute && typeof e.alpha === 'number') {
        // alpha is degrees counter-clockwise from north → convert to clockwise compass
        heading = (360 - e.alpha) % 360;
      } else if (typeof e.alpha === 'number') {
        // Best-effort fallback when `absolute` isn't reported (some Androids).
        heading = (360 - e.alpha) % 360;
      }
      if (heading !== null) {
        setState(s => ({
          ...s,
          headingDeg: Math.round(heading! * 10) / 10,
          headingStatus: 'live',
        }));
      }
    };
    orientationHandlerRef.current = handler;
    // Prefer the absolute event when available for true north reference.
    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventName, handler as EventListener, true);
  }, []);

  // -------------------------------------------------------------------------
  // Position / speed / distance
  // -------------------------------------------------------------------------
  const requestPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState(s => ({ ...s, positionStatus: 'unavailable' }));
      return;
    }
    setState(s => ({ ...s, positionStatus: 'requesting' }));

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, accuracy, heading } = pos.coords;
        const now = pos.timestamp || Date.now();
        let computedSpeed = typeof speed === 'number' && speed >= 0 ? speed : null;
        let added = 0;

        if (lastPosRef.current) {
          const dist = haversineMeters(
            lastPosRef.current.lat,
            lastPosRef.current.lon,
            latitude,
            longitude,
          );
          const dt = (now - lastPosRef.current.t) / 1000;
          // Filter out GPS jitter: ignore micro-jumps while stationary.
          if (dist > 1.5 && dt > 0.4 && accuracy < 25) {
            if (trackingRef.current) added = dist;
            if (computedSpeed === null && dt > 0) computedSpeed = dist / dt;
          }
        }
        lastPosRef.current = { lat: latitude, lon: longitude, t: now };

        setState(s => ({
          ...s,
          positionStatus: 'live',
          positionAccuracy: accuracy ?? null,
          speedMs: computedSpeed,
          distanceMeters: s.distanceMeters + added,
          // GPS heading is only reliable while moving; surface it when available
          // and we don't have a compass lock yet.
          headingDeg: typeof heading === 'number' && !Number.isNaN(heading) && (computedSpeed ?? 0) > 1
            ? heading
            : s.headingDeg,
        }));
      },
      (err) => {
        setState(s => ({
          ...s,
          positionStatus: err.code === err.PERMISSION_DENIED ? 'denied' : 'error',
        }));
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
  }, []);

  const resetDistance = useCallback(() => {
    lastPosRef.current = null;
    setState(s => ({ ...s, distanceMeters: 0 }));
  }, []);

  // -------------------------------------------------------------------------
  // Heart rate (Web Bluetooth)
  // -------------------------------------------------------------------------
  const connectHeartRate = useCallback(async () => {
    const bt = (navigator as unknown as { bluetooth?: Bluetooth }).bluetooth;
    if (!bt) {
      setState(s => ({ ...s, heartRateStatus: 'unavailable' }));
      return;
    }
    setState(s => ({ ...s, heartRateStatus: 'requesting' }));
    try {
      const device = await bt.requestDevice({
        filters: [{ services: [HR_SERVICE] }],
        optionalServices: [HR_SERVICE],
      });
      hrDeviceRef.current = device;
      device.addEventListener('gattserverdisconnected', () => {
        setState(s => ({ ...s, heartRateStatus: 'idle', heartRate: null }));
      });

      const server = await device.gatt!.connect();
      const service = await server.getPrimaryService(HR_SERVICE);
      const char = await service.getCharacteristic(HR_MEASUREMENT_CHAR);
      hrCharRef.current = char;

      const handler = (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        // Bluetooth HR Measurement format:
        //   byte 0 = flags; bit 0 indicates 16-bit (vs 8-bit) HR value.
        const flags = value.getUint8(0);
        const is16bit = (flags & 0x01) === 1;
        const bpm = is16bit ? value.getUint16(1, /* littleEndian */ true) : value.getUint8(1);
        setState(s => ({ ...s, heartRate: bpm, heartRateStatus: 'live' }));
      };
      hrHandlerRef.current = handler;
      char.addEventListener('characteristicvaluechanged', handler);
      await char.startNotifications();

      setState(s => ({
        ...s,
        heartRateStatus: 'live',
        heartRateDeviceName: device.name ?? 'Heart Rate Monitor',
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setState(s => ({
        ...s,
        heartRateStatus: /cancel|user/i.test(msg) ? 'denied' : 'error',
      }));
    }
  }, []);

  const disconnectHeartRate = useCallback(() => {
    try {
      if (hrCharRef.current && hrHandlerRef.current) {
        hrCharRef.current.removeEventListener('characteristicvaluechanged', hrHandlerRef.current);
        hrCharRef.current.stopNotifications().catch(() => {});
      }
      if (hrDeviceRef.current?.gatt?.connected) {
        hrDeviceRef.current.gatt.disconnect();
      }
    } catch { /* noop */ }
    hrCharRef.current = null;
    hrHandlerRef.current = null;
    hrDeviceRef.current = null;
    setState(s => ({ ...s, heartRateStatus: 'idle', heartRate: null, heartRateDeviceName: null }));
  }, []);

  // Convenience: request both motion-style sensors in one user gesture.
  const requestPermissions = useCallback(async () => {
    await requestCompass();
    requestPosition();
  }, [requestCompass, requestPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (orientationHandlerRef.current) {
        const eventName = typeof window !== 'undefined' && 'ondeviceorientationabsolute' in window
          ? 'deviceorientationabsolute'
          : 'deviceorientation';
        window.removeEventListener(eventName, orientationHandlerRef.current as EventListener, true);
      }
      try {
        if (hrCharRef.current && hrHandlerRef.current) {
          hrCharRef.current.removeEventListener('characteristicvaluechanged', hrHandlerRef.current);
          hrCharRef.current.stopNotifications().catch(() => {});
        }
        if (hrDeviceRef.current?.gatt?.connected) {
          hrDeviceRef.current.gatt.disconnect();
        }
      } catch { /* noop */ }
    };
  }, []);

  return {
    ...state,
    requestPermissions,
    requestCompass,
    requestPosition,
    connectHeartRate,
    disconnectHeartRate,
    resetDistance,
  };
}

// Great-circle distance in meters between two lat/lon coords.
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
