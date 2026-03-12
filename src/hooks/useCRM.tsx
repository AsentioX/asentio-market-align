import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CRMStage = 'new' | 'reached_out' | 'call_booked' | 'proposal_sent' | 'won' | 'lost';
export type NoteType = 'note' | 'email' | 'call' | 'meeting';

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  message: string | null;
  source: string;
  source_context: string | null;
  stage: CRMStage;
  follow_up_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CRMNote {
  id: string;
  contact_id: string;
  body: string;
  type: NoteType;
  created_at: string;
}

export const STAGES: { key: CRMStage; label: string; color: string }[] = [
  { key: 'new',           label: 'New',           color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  { key: 'reached_out',   label: 'Reached Out',   color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  { key: 'call_booked',   label: 'Call Booked',   color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  { key: 'won',           label: 'Won',           color: 'bg-green-500/10 text-green-700 border-green-200' },
  { key: 'lost',          label: 'Lost',          color: 'bg-red-500/10 text-red-700 border-red-200' },
];

export function useContacts() {
  return useQuery({
    queryKey: ['crm_contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CRMContact[];
    },
  });
}

export function useContactNotes(contactId: string) {
  return useQuery({
    queryKey: ['crm_notes', contactId],
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CRMNote[];
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: Omit<CRMContact, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('crm_contacts').insert(contact).select().single();
      if (error) throw error;
      return data as CRMContact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm_contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CRMContact> & { id: string }) => {
      const { data, error } = await supabase.from('crm_contacts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as CRMContact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm_contacts'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['crm_contacts'] }),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ contact_id, body, type }: { contact_id: string; body: string; type: NoteType }) => {
      const { data, error } = await supabase.from('crm_notes').insert({ contact_id, body, type }).select().single();
      if (error) throw error;
      return data as CRMNote;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['crm_notes', vars.contact_id] }),
  });
}
