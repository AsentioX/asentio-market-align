import * as React from 'react';

// Contractor Finder design tokens (scoped via inline style on layout root)
// Polished SaaS, slate/blue palette, light bg
export const cfTheme: React.CSSProperties = {
  // HSL components only — consumed via hsl(var(--cf-*))
  ['--cf-bg' as any]: '210 20% 98%',
  ['--cf-surface' as any]: '0 0% 100%',
  ['--cf-surface-alt' as any]: '210 25% 96%',
  ['--cf-border' as any]: '215 20% 90%',
  ['--cf-border-strong' as any]: '215 18% 82%',
  ['--cf-text' as any]: '222 30% 15%',
  ['--cf-text-muted' as any]: '218 12% 45%',
  ['--cf-text-subtle' as any]: '218 10% 60%',
  ['--cf-primary' as any]: '217 91% 50%',
  ['--cf-primary-hover' as any]: '217 91% 44%',
  ['--cf-primary-soft' as any]: '217 91% 96%',
  ['--cf-accent' as any]: '199 89% 48%',
  ['--cf-success' as any]: '142 71% 38%',
  ['--cf-success-soft' as any]: '142 65% 94%',
  ['--cf-warning' as any]: '38 92% 50%',
  ['--cf-warning-soft' as any]: '38 95% 95%',
  ['--cf-danger' as any]: '0 84% 55%',
  ['--cf-danger-soft' as any]: '0 85% 96%',
  ['--cf-purple' as any]: '262 83% 58%',
  ['--cf-purple-soft' as any]: '262 85% 96%',
};
