import { supabase } from '@/integrations/supabase/client';
import { fetchGooglePeople } from './google';
import type { TdzAccountSlot, TdzContact } from './types';

export const slotSource = (slot: TdzAccountSlot) => `google_${slot}`;

export const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual',
  google_work: 'Google · Work',
  google_personal: 'Google · Personal',
};

/**
 * Pull the signed-in user's real Google contacts for one account slot and
 * merge them into the master list. Rows are matched on email so re-syncing
 * never duplicates a person, and manual edits are preserved.
 */
export const syncGoogleContacts = async (
  userId: string,
  slot: TdzAccountSlot,
  existing: TdzContact[],
  email?: string | null,
): Promise<{ added: number; updated: number }> => {
  const incoming = await fetchGooglePeople(email);
  const byEmail = new Map(existing.filter((c) => c.email).map((c) => [c.email!.toLowerCase(), c]));
  const now = new Date().toISOString();

  let added = 0;
  let updated = 0;

  for (const person of incoming) {
    const match = byEmail.get(person.email.toLowerCase());
    if (match) {
      await supabase
        .from('tdz_contacts')
        .update({
          company: match.company ?? person.company ?? null,
          job_title: match.job_title ?? person.job_title ?? null,
          phone: match.phone ?? person.phone ?? null,
          avatar_url: match.avatar_url ?? person.avatar_url ?? null,
          account_slot: match.account_slot ?? slot,
          source: match.source === 'manual' ? slotSource(slot) : match.source,
          google_resource_id: match.google_resource_id ?? person.resource_id,
          last_synced_at: now,
        })
        .eq('id', match.id);
      updated += 1;
    } else {
      await supabase.from('tdz_contacts').insert({
        user_id: userId,
        name: person.name,
        email: person.email,
        phone: person.phone ?? null,
        company: person.company ?? null,
        job_title: person.job_title ?? null,
        avatar_url: person.avatar_url ?? null,
        tags: [],
        source: slotSource(slot),
        account_slot: slot,
        google_resource_id: person.resource_id,
        last_synced_at: now,
      });
      added += 1;
    }
  }

  return { added, updated };
};
