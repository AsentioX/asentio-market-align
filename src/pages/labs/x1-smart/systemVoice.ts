// X1 system personality — natural-language phrasing for the assistant.
// Tone scales: calm → watchful → direct based on overall state.

export type SystemMood = 'calm' | 'watch' | 'urgent';

export const HERO_VOICE: Record<SystemMood, { line: string; tone: string }> = {
  calm: {
    line: "Everything looks calm at home.",
    tone: 'text-emerald-700',
  },
  watch: {
    line: "I'm keeping an eye on the back door — nothing urgent yet.",
    tone: 'text-amber-700',
  },
  urgent: {
    line: "Something needs your attention. I'm ready to act if you are.",
    tone: 'text-rose-700',
  },
};

export const HERO_VOICE_COMMERCIAL: Record<SystemMood, { line: string; tone: string }> = {
  calm: { line: 'All sites operating normally.', tone: 'text-emerald-700' },
  watch: { line: "I'm watching one site closely — no escalation yet.", tone: 'text-amber-700' },
  urgent: { line: 'Warehouse needs immediate review. Standing by for your call.', tone: 'text-rose-700' },
};

// Pending-action toast lines
export const ACTION_VOICE = {
  confirmCancelled: (label: string) =>
    `Cancelled. I won't ${label.toLowerCase()} again tonight without asking.`,
  executed: (label: string) => `Done. ${label}.`,
  approved: (label: string) => `Got it. I'll handle "${label}" from now on.`,
  dismissed: () => "Okay, I won't suggest this again.",
};

// State-transition narration (for adaptive states)
export const STATE_VOICE = {
  enter: (state: string, reason: string) =>
    `Switched to ${state}. ${reason}.`,
};

// Greeting by hour
export const greetingByHour = (hour: number): string => {
  if (hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Tonight';
};
