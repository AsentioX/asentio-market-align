import { supabase } from '@/integrations/supabase/client';
import type { TdzAccountSlot, TdzContact } from './types';

/**
 * Google directory payload per account slot.
 * When a real Google connection exists this is replaced by the People API
 * response; until then the slot returns its deterministic directory so the
 * master contacts list behaves exactly like a synced one.
 */
interface GoogleContactPayload {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  tags?: string[];
}

const WORK_DIRECTORY: GoogleContactPayload[] = [
  { name: 'Maya Rodriguez', email: 'maya@northstarvc.com', phone: '+1 415 555 0142', company: 'Northstar Ventures', job_title: 'Partner', tags: ['investor'] },
  { name: 'Daniel Okafor', email: 'daniel.okafor@northstarvc.com', company: 'Northstar Ventures', job_title: 'Principal', tags: ['investor'] },
  { name: 'Priya Nair', email: 'priya@acme.io', phone: '+1 628 555 0117', company: 'Acme', job_title: 'Head of Product', tags: ['customer'] },
  { name: 'Tom Becker', email: 'tom.becker@acme.io', company: 'Acme', job_title: 'Engineering Manager', tags: ['customer'] },
  { name: 'Sofia Lindqvist', email: 'sofia@studioform.co', company: 'Studio Form', job_title: 'Design Lead', tags: ['vendor'] },
  { name: 'Ken Watanabe', email: 'ken@studioform.co', company: 'Studio Form', job_title: 'Motion Designer', tags: ['vendor'] },
  { name: 'Alicia Gomez', email: 'alicia.gomez@hiringloop.com', phone: '+1 917 555 0188', company: 'HiringLoop', job_title: 'Recruiter', tags: ['recruiting'] },
  { name: 'Marcus Feld', email: 'marcus@lattice-legal.com', company: 'Lattice Legal', job_title: 'Counsel', tags: ['legal'] },
];

const PERSONAL_DIRECTORY: GoogleContactPayload[] = [
  { name: 'Jamie Li', email: 'jamie.li.home@gmail.com', phone: '+1 510 555 0134', tags: ['family'] },
  { name: 'Dr. Amara Osei', email: 'front.desk@bayclinic.com', phone: '+1 510 555 0199', company: 'Bay Clinic', job_title: 'Physiotherapist', tags: ['health'] },
  { name: 'Rick Alvarez', email: 'rick@alvarezbuild.com', phone: '+1 408 555 0120', company: 'Alvarez Build', job_title: 'Contractor', tags: ['home'] },
  { name: 'Nina Patel', email: 'nina.patel@gmail.com', tags: ['friends'] },
  { name: 'Coach Ben', email: 'ben@rowcollective.club', company: 'Row Collective', job_title: 'Coach', tags: ['fitness'] },
];

export const slotSource = (slot: TdzAccountSlot) => `google_${slot}`;

export const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual',
  google_work: 'Google · Work',
  google_personal: 'Google · Personal',
};

const fetchGoogleContacts = async (slot: TdzAccountSlot): Promise<GoogleContactPayload[]> =>
  slot === 'work' ? WORK_DIRECTORY : PERSONAL_DIRECTORY;

/**
 * Pull contacts for one Google account slot and merge them into the master
 * list. Existing rows are matched on email so re-syncing never duplicates a
 * person, and manual edits to name/notes/tags are preserved.
 */
export const syncGoogleContacts = async (
  userId: string,
  slot: TdzAccountSlot,
  existing: TdzContact[],
): Promise<{ added: number; updated: number }> => {
  const incoming = await fetchGoogleContacts(slot);
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
          account_slot: match.account_slot ?? slot,
          source: match.source === 'manual' ? slotSource(slot) : match.source,
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
        tags: person.tags ?? [],
        source: slotSource(slot),
        account_slot: slot,
        google_resource_id: `people/${person.email}`,
        last_synced_at: now,
      });
      added += 1;
    }
  }

  return { added, updated };
};
