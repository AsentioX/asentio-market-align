// X1 Smart design tokens — calm, confident, intelligent
// Apple Home + Tesla Autopilot + Verkada inspiration

export const X1_THEME = {
  // Surfaces
  bg: 'bg-[#0a0e14]', // deep near-black with cool tint
  bgGradient: 'bg-gradient-to-b from-[#0a0e14] via-[#0d1220] to-[#0a0e14]',
  surface: 'bg-white/[0.03]',
  surfaceHover: 'hover:bg-white/[0.06]',
  surfaceElevated: 'bg-white/[0.05]',
  border: 'border-white/[0.08]',
  borderStrong: 'border-white/[0.14]',

  // Text
  text: 'text-white',
  textMuted: 'text-white/60',
  textDim: 'text-white/40',

  // Accents — confident teal/cyan = "intelligence"
  accent: 'text-cyan-300',
  accentBg: 'bg-cyan-400',
  accentSoft: 'bg-cyan-400/10',
  accentBorder: 'border-cyan-400/30',
  accentGlow: 'shadow-[0_0_24px_-4px_rgba(34,211,238,0.4)]',

  // Priority colors
  critical: 'text-red-400',
  criticalBg: 'bg-red-500/10',
  criticalBorder: 'border-red-500/30',
  high: 'text-amber-300',
  highBg: 'bg-amber-400/10',
  highBorder: 'border-amber-400/25',
  normal: 'text-cyan-300',
  normalBg: 'bg-cyan-400/10',
  normalBorder: 'border-cyan-400/25',
  low: 'text-white/50',
  lowBg: 'bg-white/[0.04]',
  lowBorder: 'border-white/10',
} as const;

export const PRIORITY_STYLES = {
  critical: { dot: 'bg-red-400', glow: 'shadow-[0_0_12px_rgba(248,113,113,0.6)]', text: 'text-red-300', ring: 'ring-red-400/40' },
  high: { dot: 'bg-amber-300', glow: 'shadow-[0_0_10px_rgba(252,211,77,0.5)]', text: 'text-amber-200', ring: 'ring-amber-400/30' },
  normal: { dot: 'bg-cyan-300', glow: 'shadow-[0_0_8px_rgba(103,232,249,0.4)]', text: 'text-cyan-200', ring: 'ring-cyan-400/30' },
  low: { dot: 'bg-white/30', glow: '', text: 'text-white/50', ring: 'ring-white/10' },
} as const;

export const STATE_STYLES = {
  secure: { dot: 'bg-emerald-400', label: 'Secure', text: 'text-emerald-300' },
  active: { dot: 'bg-cyan-300', label: 'Active', text: 'text-cyan-200' },
  idle: { dot: 'bg-white/40', label: 'Idle', text: 'text-white/60' },
  alert: { dot: 'bg-red-400', label: 'Alert', text: 'text-red-300' },
} as const;
