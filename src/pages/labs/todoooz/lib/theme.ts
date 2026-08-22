import type { TdzCard } from './types';

export interface TdzColorTheme {
  key: string;
  label: string;
  /** HSL triplet used for accents, borders and glows */
  hsl: string;
}

export const TDZ_THEMES: TdzColorTheme[] = [
  { key: 'default', label: 'Default', hsl: '215 20% 65%' },
  { key: 'indigo', label: 'Indigo', hsl: '243 75% 62%' },
  { key: 'violet', label: 'Violet', hsl: '269 75% 65%' },
  { key: 'sky', label: 'Sky', hsl: '199 89% 55%' },
  { key: 'cyan', label: 'Cyan', hsl: '188 90% 50%' },
  { key: 'emerald', label: 'Emerald', hsl: '158 64% 45%' },
  { key: 'teal', label: 'Teal', hsl: '175 70% 45%' },
  { key: 'lime', label: 'Lime', hsl: '85 65% 48%' },
  { key: 'green', label: 'Green', hsl: '142 70% 45%' },
  { key: 'yellow', label: 'Yellow', hsl: '54 95% 52%' },
  { key: 'amber', label: 'Amber', hsl: '38 92% 55%' },
  { key: 'orange', label: 'Orange', hsl: '25 95% 58%' },
  { key: 'red', label: 'Red', hsl: '0 80% 58%' },
  { key: 'rose', label: 'Rose', hsl: '347 82% 62%' },
  { key: 'pink', label: 'Pink', hsl: '330 80% 65%' },
  { key: 'fuchsia', label: 'Fuchsia', hsl: '292 78% 62%' },
];

export const themeByKey = (key?: string | null): TdzColorTheme =>
  TDZ_THEMES.find((t) => t.key === key) ?? TDZ_THEMES[0];

/** Resolve a card's effective theme, inheriting from its parent when unset. */
export const resolveTheme = (card: TdzCard, parent?: TdzCard | null): TdzColorTheme =>
  themeByKey(card.color_theme ?? parent?.color_theme ?? 'default');

/** CSS custom properties applied to a card element. */
export const themeVars = (theme: TdzColorTheme, intensity = 1): React.CSSProperties =>
  ({
    '--tdz-accent': theme.hsl,
    '--tdz-accent-strength': String(intensity),
  }) as React.CSSProperties;
