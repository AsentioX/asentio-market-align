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

export interface TrackPoint {
  t: number;        // unix ms
  lat: number;
  lon: number;
  speedMs: number;  // ground speed at this fix
  accuracy: number; // meters
}

export interface RowSensorState {
  headingDeg: number | null;
  headingStatus: SensorStatus;

  speedMs: number | null;       // GPS-derived ground speed
  distanceMeters: number;       // accumulated while `tracking` is true
  positionStatus: SensorStatus;
  positionAccuracy: number | null;
  track: TrackPoint[];          // accumulated GPS fixes while tracking

  heartRate: number | null;
  heartRateStatus: SensorStatus;
  heartRateDeviceName: string | null;

  // Stroke rate derived from device accelerometer (peak-detection on the
  // dominant rocking axis of the boat). null until enough peaks are seen.
  spm: number | null;
  motionStatus: SensorStatus;
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
    track: [],
    heartRate: null,
    heartRateStatus: 'idle',
    heartRateDeviceName: null,
    spm: null,
    motionStatus: 'idle',
  });

  // Refs for cleanup / cross-callback access without re-subscribing
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ lat: number; lon: number; t: number } | null>(null);
  const orientationHandlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const hrDeviceRef = useRef<BluetoothDevice | null>(null);
  const hrCharRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const hrHandlerRef = useRef<((e: Event) => void) | null>(null);
  const trackingRef = useRef(tracking);
  const motionHandlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  // Stroke-detection state — kept in refs so the listener doesn't re-subscribe.
  const strokeStateRef = useRef<{
    // Low-pass filtered vertical acceleration (gravity removed).
    lpAccel: number;
    // High-pass (signal − slow baseline) used for peak detection.
    baseline: number;
    lastPeakT: number;
    // Sliding window of recent stroke intervals (ms) for SPM smoothing.
    intervals: number[];
  }>({ lpAccel: 0, baseline: 0, lastPeakT: 0, intervals: [] });

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

        setState(s => {
          const trackPush = trackingRef.current && (accuracy ?? 100) < 30
            ? [...s.track, { t: now, lat: latitude, lon: longitude, speedMs: computedSpeed ?? 0, accuracy: accuracy ?? 0 }]
            : s.track;
          return {
            ...s,
            positionStatus: 'live',
            positionAccuracy: accuracy ?? null,
            speedMs: computedSpeed,
            distanceMeters: s.distanceMeters + added,
            track: trackPush,
            // GPS heading is only reliable while moving; surface it when available
            // and we don't have a compass lock yet.
            headingDeg: typeof heading === 'number' && !Number.isNaN(heading) && (computedSpeed ?? 0) > 1
              ? heading
              : s.headingDeg,
          };
        });
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
    setState(s => ({ ...s, distanceMeters: 0, track: [] }));
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

  // -------------------------------------------------------------------------
  // Stroke rate (DeviceMotion accelerometer — peak detection on the
  // dominant rocking axis of the boat). Each rowing stroke produces one
  // characteristic accel peak as the rower drives + recovers; we measure the
  // interval between successive peaks and convert to strokes-per-minute.
  // -------------------------------------------------------------------------
  const requestMotion = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setState(s => ({ ...s, motionStatus: 'unavailable' }));
      return;
    }
    setState(s => ({ ...s, motionStatus: 'requesting' }));

    // iOS 13+ requires explicit permission.
    const DME = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DME.requestPermission === 'function') {
      try {
        const result = await DME.requestPermission();
        if (result !== 'granted') {
          setState(s => ({ ...s, motionStatus: 'denied' }));
          return;
        }
      } catch {
        setState(s => ({ ...s, motionStatus: 'denied' }));
        return;
      }
    }

    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity ?? e.acceleration;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      // Magnitude is orientation-independent — the boat may be in any pose.
      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      const st = strokeStateRef.current;

      // Two cascaded one-pole filters:
      //   lpAccel  ≈ smoothed signal (cuts high-frequency noise)
      //   baseline ≈ very slow average (acts as DC / gravity removal)
      st.lpAccel = st.lpAccel * 0.8 + mag * 0.2;
      st.baseline = st.baseline * 0.985 + st.lpAccel * 0.015;
      const dynamic = st.lpAccel - st.baseline;

      const now = e.timeStamp ? performance.timeOrigin + e.timeStamp : Date.now();
      // Threshold tuned for typical rowing rocking (≈0.4 m/s² above baseline);
      // refractory period prevents double-counting within one stroke (max ~60 spm).
      const THRESHOLD = 0.4;
      const MIN_INTERVAL_MS = 1000; // ≥ 60 spm cap
      const MAX_INTERVAL_MS = 6000; // ≤ 10 spm floor (otherwise treat as stopped)

      if (dynamic > THRESHOLD && now - st.lastPeakT > MIN_INTERVAL_MS) {
        if (st.lastPeakT !== 0) {
          const interval = now - st.lastPeakT;
          if (interval < MAX_INTERVAL_MS) {
            st.intervals.push(interval);
            if (st.intervals.length > 6) st.intervals.shift();
            const avg = st.intervals.reduce((a, b) => a + b, 0) / st.intervals.length;
            const spm = Math.round(60000 / avg);
            setState(s => ({ ...s, spm, motionStatus: 'live' }));
          } else {
            // Long gap — restart cadence tracking.
            st.intervals = [];
            setState(s => ({ ...s, spm: null, motionStatus: 'live' }));
          }
        } else {
          setState(s => ({ ...s, motionStatus: 'live' }));
        }
        st.lastPeakT = now;
      } else if (now - st.lastPeakT > MAX_INTERVAL_MS && st.lastPeakT !== 0) {
        // Idle — clear stale SPM so the UI doesn't lie.
        st.intervals = [];
        st.lastPeakT = 0;
        setState(s => ({ ...s, spm: null }));
      }
    };
    motionHandlerRef.current = handler;
    window.addEventListener('devicemotion', handler);
  }, []);

  // Convenience: request all motion-style sensors in one user gesture.
  const requestPermissions = useCallback(async () => {
    await requestCompass();
    await requestMotion();
    requestPosition();
  }, [requestCompass, requestMotion, requestPosition]);

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
      if (motionHandlerRef.current && typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', motionHandlerRef.current);
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
    requestMotion,
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
