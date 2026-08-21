import type { TdzCard, TdzEvent, TdzTask } from './types';

export interface Nudge {
  id: string;
  tone: 'urgent' | 'warn' | 'info';
  title: string;
  detail: string;
  cardId?: string;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const buildNudges = (cards: TdzCard[], tasks: TdzTask[], events: TdzEvent[]): Nudge[] => {
  const nudges: Nudge[] = [];
  const now = new Date();
  const today = startOfToday();
  const endOfToday = new Date(today.getTime() + 86400000);

  const overdue = tasks.filter((t) => !t.done && t.due_date && new Date(t.due_date) < today);
  if (overdue.length) {
    nudges.push({
      id: 'overdue',
      tone: 'urgent',
      title: `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'}`,
      detail: overdue
        .slice(0, 3)
        .map((t) => t.title)
        .join(' · '),
      cardId: overdue[0].project_id,
    });
  }

  const dueToday = tasks.filter(
    (t) => !t.done && t.due_date && new Date(t.due_date) >= today && new Date(t.due_date) < endOfToday,
  );
  if (dueToday.length) {
    nudges.push({
      id: 'due-today',
      tone: 'warn',
      title: `${dueToday.length} due today`,
      detail: dueToday
        .slice(0, 3)
        .map((t) => t.title)
        .join(' · '),
      cardId: dueToday[0].project_id,
    });
  }

  const todays = events
    .filter((e) => new Date(e.starts_at) >= today && new Date(e.starts_at) < endOfToday)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  for (let i = 1; i < todays.length; i++) {
    const prev = todays[i - 1];
    const cur = todays[i];
    if (new Date(cur.starts_at) < new Date(prev.ends_at)) {
      nudges.push({
        id: `conflict-${cur.id}`,
        tone: 'urgent',
        title: 'Calendar conflict',
        detail: `${prev.title} overlaps ${cur.title}`,
      });
      break;
    }
    if (new Date(cur.starts_at).getTime() - new Date(prev.ends_at).getTime() <= 0) continue;
    if (new Date(cur.starts_at).getTime() - new Date(prev.ends_at).getTime() < 5 * 60000) {
      nudges.push({
        id: `b2b-${cur.id}`,
        tone: 'warn',
        title: 'Back-to-back meetings',
        detail: `${prev.title} → ${cur.title} with no gap`,
      });
      break;
    }
  }

  const stale = cards.filter(
    (c) =>
      c.status === 'active' &&
      c.time_bucket !== 'backlog' &&
      now.getTime() - new Date(c.last_activity_at).getTime() > 7 * 86400000,
  );
  if (stale.length) {
    nudges.push({
      id: 'stale',
      tone: 'info',
      title: `${stale.length} project${stale.length === 1 ? '' : 's'} going quiet`,
      detail: `No activity for a week on ${stale
        .slice(0, 2)
        .map((c) => c.title)
        .join(' · ')}`,
      cardId: stale[0].id,
    });
  }

  const next = todays.find((e) => new Date(e.starts_at) > now);
  if (next) {
    const mins = Math.round((new Date(next.starts_at).getTime() - now.getTime()) / 60000);
    nudges.push({
      id: 'next-up',
      tone: 'info',
      title: 'Next up',
      detail: `${next.title} in ${mins < 60 ? `${mins} min` : `${Math.round(mins / 60)} h`}`,
    });
  }

  if (!nudges.length) {
    nudges.push({ id: 'clear', tone: 'info', title: 'All clear', detail: 'Nothing is overdue or colliding today.' });
  }
  return nudges;
};

export const completionRing = (tasks: TdzTask[]) => {
  const today = startOfToday();
  const relevant = tasks.filter((t) => !t.due_date || new Date(t.due_date) < new Date(today.getTime() + 86400000));
  const done = relevant.filter((t) => t.done).length;
  return { done, total: relevant.length, pct: relevant.length ? Math.round((done / relevant.length) * 100) : 0 };
};
