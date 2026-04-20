// Contractor Finder design tokens (scoped via inline style on layout root)
// Polished SaaS, slate/blue palette, light bg
export const cfTheme = {
  // HSL components only
  '--cf-bg': '210 20% 98%',
  '--cf-surface': '0 0% 100%',
  '--cf-surface-alt': '210 25% 96%',
  '--cf-border': '215 20% 90%',
  '--cf-border-strong': '215 18% 82%',
  '--cf-text': '222 30% 15%',
  '--cf-text-muted': '218 12% 45%',
  '--cf-text-subtle': '218 10% 60%',
  '--cf-primary': '217 91% 50%',
  '--cf-primary-hover': '217 91% 44%',
  '--cf-primary-soft': '217 91% 96%',
  '--cf-accent': '199 89% 48%',
  '--cf-success': '142 71% 38%',
  '--cf-success-soft': '142 65% 94%',
  '--cf-warning': '38 92% 50%',
  '--cf-warning-soft': '38 95% 95%',
  '--cf-danger': '0 84% 55%',
  '--cf-danger-soft': '0 85% 96%',
  '--cf-purple': '262 83% 58%',
  '--cf-purple-soft': '262 85% 96%',
  '--cf-shadow-sm': '0 1px 2px 0 hsl(215 25% 25% / 0.04)',
  '--cf-shadow-md': '0 4px 12px -2px hsl(215 25% 25% / 0.08)',
  '--cf-shadow-lg': '0 12px 32px -8px hsl(215 25% 25% / 0.12)',
} as React.CSSProperties;

// re-import React types for css vars
import * as React from 'react';
