import type { RaceEvent } from '../data/schedule';

// Central Time offset. Race is in Texas. Use fixed -05:00 during DST (CDT).
const TZ_OFFSET = '-05:00';

export function eventStart(e: RaceEvent): Date {
  return new Date(`${e.date}T${e.start}:00${TZ_OFFSET}`);
}
export function eventEnd(e: RaceEvent): Date {
  const end = e.end ?? addMinutes(e.start, 30);
  return new Date(`${e.date}T${end}:00${TZ_OFFSET}`);
}

function addMinutes(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + mins;
  const h2 = Math.floor(total / 60) % 24;
  const m2 = total % 60;
  return `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`;
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export interface Countdown {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
}

export function computeCountdown(target: Date, now: Date = new Date()): Countdown {
  const totalMs = target.getTime() - now.getTime();
  const past = totalMs <= 0;
  const abs = Math.abs(totalMs);
  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);
  return { totalMs, days, hours, minutes, seconds, past };
}

export function formatCountdown(cd: Countdown, compact = false): string {
  if (cd.days > 0) return compact ? `${cd.days}d ${cd.hours}h` : `${cd.days}d ${cd.hours}h ${cd.minutes}m`;
  if (cd.hours > 0) return compact ? `${cd.hours}h ${cd.minutes}m` : `${cd.hours}h ${cd.minutes}m ${cd.seconds}s`;
  if (cd.minutes > 0) return `${cd.minutes}m ${cd.seconds}s`;
  return `${cd.seconds}s`;
}

export type EventStatus = 'past' | 'current' | 'upcoming';

export function eventStatus(e: RaceEvent, now: Date = new Date()): EventStatus {
  const s = eventStart(e).getTime();
  const en = eventEnd(e).getTime();
  const t = now.getTime();
  if (t < s) return 'upcoming';
  if (t >= s && t <= en) return 'current';
  return 'past';
}

export function findNextEvent(events: RaceEvent[], now: Date = new Date()): RaceEvent | null {
  const upcoming = events
    .filter(e => eventStart(e).getTime() > now.getTime())
    .sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());
  return upcoming[0] ?? null;
}

export function findCurrentEvent(events: RaceEvent[], now: Date = new Date()): RaceEvent | null {
  const current = events.filter(e => eventStatus(e, now) === 'current');
  // Prefer required current events
  return current.find(e => e.required) ?? current[0] ?? null;
}

// Today's active date within race window; otherwise clamped to race dates.
export function activeRaceDate(dates: string[], now: Date = new Date()): string {
  const today = now.toISOString().slice(0, 10);
  if (dates.includes(today)) return today;
  // Return the next race day if we're before the race, else the last day.
  const next = dates.find(d => d >= today);
  return next ?? dates[dates.length - 1];
}
