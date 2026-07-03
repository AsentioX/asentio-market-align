import type { Sponsor, Contact, Action } from './types';

export function healthScore(s: Sponsor, contacts: Contact[], actions: Action[]): number {
  let score = 0;
  const openActions = actions.filter(a => a.status === 'open');
  if (s.last_contact_at) {
    const days = (Date.now() - new Date(s.last_contact_at).getTime()) / 86400000;
    if (days < 7) score += 20; else if (days < 21) score += 12; else if (days < 45) score += 6;
  }
  if (s.owner_id) score += 10;
  if (openActions.length > 0) score += 20;
  if (contacts.some(c => c.is_decision_maker)) score += 15;
  const stagesReached = ['proposal_sent','negotiation','verbal_commitment','contract_signed','activation_planning','delivery','post_event','renewal'];
  if (stagesReached.includes(s.stage)) score += 20;
  if (['contract_signed','activation_planning','delivery','post_event','renewal'].includes(s.stage)) score += 15;
  return Math.min(100, score);
}

export function healthColor(score: number): 'green'|'yellow'|'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86400000);
}
