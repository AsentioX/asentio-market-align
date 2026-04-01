import { toast } from 'sonner';

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export async function shareContent(data: ShareData) {
  const shareUrl = data.url || window.location.href;
  const fullData = { ...data, url: shareUrl };

  if (navigator.share) {
    try {
      await navigator.share(fullData);
      return;
    } catch (e) {
      // User cancelled or share failed — fall through to clipboard
      if ((e as DOMException).name === 'AbortError') return;
    }
  }

  // Fallback: copy to clipboard
  const copyText = `${data.title}\n${data.text}\n${shareUrl}`;
  try {
    await navigator.clipboard.writeText(copyText);
    toast.success('Copied to clipboard!', {
      description: 'Share it anywhere you like.',
      duration: 2500,
    });
  } catch {
    toast.error('Unable to share');
  }
}

export function buildWorkoutShareText(exercise: string, score: number, mode: string): ShareData {
  return {
    title: '💪 W.O.Buddy — Workout Complete!',
    text: `Just crushed ${exercise} (${mode}) and earned +${score} points on W.O.Buddy!`,
  };
}

export function buildStatsShareText(workouts: number, points: number, streak: number): ShareData {
  return {
    title: '🏆 W.O.Buddy — My Stats',
    text: `${workouts} workouts · ${points.toLocaleString()} points · ${streak}-week streak on W.O.Buddy!`,
  };
}

export function buildAchievementShareText(title: string, icon: string): ShareData {
  return {
    title: `${icon} W.O.Buddy — Achievement Unlocked!`,
    text: `I just unlocked "${title}" on W.O.Buddy!`,
  };
}
