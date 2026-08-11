// Raw sensor-data export helpers for RowWindow's Post-Row tab.
//
// A finished row keeps every captured sample (IMU, GPS, compass, heart rate,
// derived stroke rate) in memory; these helpers serialize that bundle to JSON
// or per-stream CSV so it can be analysed offline.

import type { RawSensorCapture } from './useRowSensors';

export type RawStreamId = 'imu' | 'gps' | 'heading' | 'heartRate' | 'spm';

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileStamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

const num = (v: number | null | undefined, digits = 6) =>
  v === null || v === undefined || Number.isNaN(v) ? '' : Number(v).toFixed(digits).replace(/\.?0+$/, '');

function toCsv(header: string[], rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
}

export function streamToCsv(raw: RawSensorCapture, stream: RawStreamId): string {
  switch (stream) {
    case 'imu':
      return toCsv(
        ['t_ms', 'iso', 'ax', 'ay', 'az', 'lin_ax', 'lin_ay', 'lin_az', 'rot_alpha', 'rot_beta', 'rot_gamma', 'interval_ms'],
        raw.imu.map((s) => [
          Math.round(s.t), new Date(s.t).toISOString(),
          num(s.ax, 5), num(s.ay, 5), num(s.az, 5),
          num(s.lax, 5), num(s.lay, 5), num(s.laz, 5),
          num(s.gx, 4), num(s.gy, 4), num(s.gz, 4),
          num(s.interval, 3),
        ]),
      );
    case 'gps':
      return toCsv(
        ['t_ms', 'iso', 'lat', 'lon', 'speed_ms', 'accuracy_m', 'altitude_m', 'altitude_accuracy_m', 'heading_deg'],
        raw.gps.map((s) => [
          Math.round(s.t), new Date(s.t).toISOString(),
          num(s.lat, 7), num(s.lon, 7), num(s.speedMs, 4),
          num(s.accuracy, 2), num(s.altitude, 2), num(s.altitudeAccuracy, 2), num(s.heading, 2),
        ]),
      );
    case 'heading':
      return toCsv(
        ['t_ms', 'iso', 'heading_deg', 'source'],
        raw.heading.map((s) => [Math.round(s.t), new Date(s.t).toISOString(), num(s.deg, 2), s.source]),
      );
    case 'heartRate':
      return toCsv(
        ['t_ms', 'iso', 'bpm'],
        raw.heartRate.map((s) => [Math.round(s.t), new Date(s.t).toISOString(), s.bpm]),
      );
    case 'spm':
      return toCsv(
        ['t_ms', 'iso', 'spm', 'confidence'],
        raw.spm.map((s) => [Math.round(s.t), new Date(s.t).toISOString(), num(s.spm, 2), num(s.confidence, 3)]),
      );
  }
}

export function rawToJson(raw: RawSensorCapture, meta: Record<string, unknown> = {}): string {
  return JSON.stringify({ version: 1, meta, ...raw });
}

export function rawSampleCounts(raw: RawSensorCapture) {
  return {
    imu: raw.imu.length,
    gps: raw.gps.length,
    heading: raw.heading.length,
    heartRate: raw.heartRate.length,
    spm: raw.spm.length,
  };
}

export function rawTotalSamples(raw: RawSensorCapture) {
  const c = rawSampleCounts(raw);
  return c.imu + c.gps + c.heading + c.heartRate + c.spm;
}
