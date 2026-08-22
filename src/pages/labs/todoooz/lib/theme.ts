import type { TdzCard } from './types';

export interface TdzColorTheme {
  key: string;
  label: string;
  /** HSL triplet used for accents, borders and glows */
  hsl: string;
  /** Hex form, used for tag chips and any place that needs a plain color */
  hex: string;
}

export const TDZ_THEMES: TdzColorTheme[] = [
  { key: 'default', label: 'Slate', hsl: '200 16% 62%', hex: '#90A4AE' },
  { key: 'red', label: 'Red', hsl: '355 100% 60%', hex: '#FF3344' },
  { key: 'orange', label: 'Orange', hsl: '28 100% 50%', hex: '#FF7700' },
  { key: 'amber', label: 'Amber', hsl: '43 100% 51%', hex: '#FFB703' },
  { key: 'gold', label: 'Gold', hsl: '51 100% 50%', hex: '#FFD700' },
  { key: 'lime', label: 'Lime', hsl: '70 100% 40%', hex: '#AACC00' },
  { key: 'green', label: 'Green', hsl: '151 100% 45%', hex: '#00E676' },
  { key: 'teal', label: 'Teal', hsl: '152 41% 52%', hex: '#52B788' },
  { key: 'aqua', label: 'Aqua', hsl: '172 100% 48%', hex: '#00F5D4' },
  { key: 'sky', label: 'Sky', hsl: '191 100% 50%', hex: '#00D2FF' },
  { key: 'blue', label: 'Blue', hsl: '217 71% 51%', hex: '#2A6FDB' },
  { key: 'violet', label: 'Violet', hsl: '276 91% 38%', hex: '#7209B7' },
  { key: 'purple', label: 'Purple', hsl: '273 68% 59%', hex: '#9D4EDD' },
  { key: 'magenta', label: 'Magenta', hsl: '328 100% 41%', hex: '#D0006E' },
  { key: 'pink', label: 'Pink', hsl: '330 100% 64%', hex: '#FF48A5' },
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
