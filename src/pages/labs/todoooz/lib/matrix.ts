import type { TdzBucket, TdzCard, TdzPriority } from './types';

export const BUCKETS: { key: TdzBucket; label: string; hint: string }[] = [
  { key: 'today', label: 'Today', hint: 'Needs to move in the next few hours' },
  { key: 'this_week', label: 'This Week', hint: 'Landing within seven days' },
  { key: 'this_month', label: 'This Month', hint: 'Ongoing work with room to breathe' },
  { key: 'backlog', label: 'Backlog', hint: 'Parked until capacity opens up' },
];

export const PRIORITIES: { key: TdzPriority; label: string; hsl: string }[] = [
  { key: 'critical', label: 'Critical', hsl: '0 84% 60%' },
  { key: 'high', label: 'High', hsl: '38 92% 55%' },
  { key: 'core', label: 'MEDIUM', hsl: '217 91% 60%' },
  { key: 'low', label: 'LOW', hsl: '215 16% 55%' },
];

export type DepthTier = 'hot' | 'warm' | 'flat';

export const depthTier = (card: TdzCard): DepthTier => {
  const age = Date.now() - new Date(card.last_activity_at).getTime();
  if (age < 60 * 60 * 1000) return 'hot';
  if (age < 24 * 60 * 60 * 1000) return 'warm';
  return 'flat';
};

export const depthStyle = (tier: DepthTier): React.CSSProperties => {
  if (tier === 'hot') return { transform: 'translateZ(46px)' };
  if (tier === 'warm') return { transform: 'translateZ(20px)' };
  return { transform: 'translateZ(0px)' };
};

/** Plain-language reason for a card's placement — used by the drawer. */
export const explainPlacement = (card: TdzCard): string[] => {
  const bucket = BUCKETS.find((b) => b.key === card.time_bucket);
  const priority = PRIORITIES.find((p) => p.key === card.priority);
  const tier = depthTier(card);
  const lines = [
    `Column — ${bucket?.label}: ${bucket?.hint.toLowerCase()}.`,
    `Row — ${priority?.label}: you set this card's urgency to ${priority?.label.toLowerCase()}.`,
    tier === 'hot'
      ? 'Depth — pulled forward because it was touched in the last hour.'
      : tier === 'warm'
        ? 'Depth — mid-plane because it was active in the last 24 hours.'
        : 'Depth — pushed flat because nothing has happened here for over a day.',
  ];
  if (card.due_date) {
    const days = Math.round((new Date(card.due_date).getTime() - Date.now()) / 86400000);
    lines.push(
      days < 0
        ? `Due date — overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}.`
        : `Due date — ${days === 0 ? 'due today' : `due in ${days} day${days === 1 ? '' : 's'}`}.`,
    );
  }
  return lines;
};

export const sortCards = (cards: TdzCard[]) =>
  [...cards].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
