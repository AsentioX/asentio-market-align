export const fmtPrice = (p: number | null, max?: number | null) => {
  if (p == null) return '—';
  if (max && max > p) return `$${p.toFixed(0)}–$${max.toFixed(0)}`;
  return `$${p.toFixed(0)}`;
};

export const setupLabel: Record<string, string> = {
  easy: 'Easy setup',
  moderate: 'Moderate setup',
  professional: 'Pro setup recommended',
};

export const privacyLabel: Record<string, string> = {
  high: 'Privacy-first',
  medium: 'Standard privacy',
  low: 'Camera / cloud',
};
