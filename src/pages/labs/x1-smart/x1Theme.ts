// X1 Smart design tokens — light, modern, graphical
// Apple Home + Linear + Arc Browser inspiration

export const X1_THEME = {
  // Surfaces — warm off-white with subtle depth
  bg: 'bg-[#fafaf7]',
  bgGradient: 'bg-gradient-to-b from-[#fafaf7] via-[#f4f4ee] to-[#eef0e9]',
  surface: 'bg-white',
  surfaceHover: 'hover:bg-white',
  surfaceElevated: 'bg-white',
  border: 'border-black/[0.06]',
  borderStrong: 'border-black/[0.12]',

  // Text
  text: 'text-[#0a0a0a]',
  textMuted: 'text-[#0a0a0a]/60',
  textDim: 'text-[#0a0a0a]/40',

  // Accent — confident indigo/violet = "intelligence"
  accent: 'text-indigo-600',
  accentBg: 'bg-indigo-600',
  accentSoft: 'bg-indigo-500/10',
  accentBorder: 'border-indigo-500/30',
} as const;

export const PRIORITY_STYLES = {
  critical: { dot: 'bg-rose-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]', text: 'text-rose-600', ring: 'ring-rose-400/40', soft: 'bg-rose-50', border: 'border-rose-200' },
  high: { dot: 'bg-cyan-500', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.4)]', text: 'text-cyan-600', ring: 'ring-cyan-400/30', soft: 'bg-cyan-50', border: 'border-cyan-200' },
  normal: { dot: 'bg-indigo-500', glow: 'shadow-[0_0_8px_rgba(99,102,241,0.4)]', text: 'text-indigo-600', ring: 'ring-indigo-400/30', soft: 'bg-indigo-50', border: 'border-indigo-200' },
  low: { dot: 'bg-stone-300', glow: '', text: 'text-stone-500', ring: 'ring-stone-200', soft: 'bg-stone-50', border: 'border-stone-200' },
} as const;

export const STATE_STYLES = {
  secure: { dot: 'bg-emerald-500', label: 'Secure', text: 'text-emerald-700', soft: 'bg-emerald-50', border: 'border-emerald-200' },
  active: { dot: 'bg-indigo-500', label: 'Active', text: 'text-indigo-600', soft: 'bg-indigo-50', border: 'border-indigo-200' },
  idle: { dot: 'bg-stone-400', label: 'Idle', text: 'text-stone-500', soft: 'bg-stone-50', border: 'border-stone-200' },
  alert: { dot: 'bg-rose-500', label: 'Alert', text: 'text-rose-600', soft: 'bg-rose-50', border: 'border-rose-200' },
} as const;

// Vibrant gradient palette for graphical accents
export const GRADIENTS = {
  primary: 'bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500',
  warm: 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400',
  cool: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
  fresh: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400',
  alert: 'bg-gradient-to-br from-rose-500 via-red-500 to-orange-500',
} as const;
