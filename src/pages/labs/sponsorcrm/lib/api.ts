import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Sponsor, Contact, Action, Meeting, Deliverable } from './types';

// Sponsors
export function useSponsors() {
  return useQuery({
    queryKey: ['scrm_sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_sponsors' as any).select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Sponsor[];
    },
  });
}
export function useSponsor(id?: string) {
  return useQuery({
    queryKey: ['scrm_sponsor', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_sponsors' as any).select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data as unknown as Sponsor | null;
    },
  });
}
export function useSaveSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Partial<Sponsor> & { company_name: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const payload: any = { ...s };
      if (!s.id) payload.created_by = u.user?.id;
      const q = s.id
        ? supabase.from('scrm_sponsors' as any).update(payload).eq('id', s.id).select().maybeSingle()
        : supabase.from('scrm_sponsors' as any).insert(payload).select().maybeSingle();
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Sponsor;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['scrm_sponsors'] }); if (v.id) qc.invalidateQueries({ queryKey: ['scrm_sponsor', v.id] }); },
  });
}
export function useDeleteSponsor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scrm_sponsors' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scrm_sponsors'] }),
  });
}

// Contacts
export function useContacts(sponsorId?: string) {
  return useQuery({
    queryKey: ['scrm_contacts', sponsorId],
    enabled: !!sponsorId,
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_contacts' as any).select('*').eq('sponsor_id', sponsorId!).order('created_at');
      if (error) throw error;
      return (data ?? []) as unknown as Contact[];
    },
  });
}
export function useSaveContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: Partial<Contact> & { sponsor_id: string; name: string }) => {
      const q = c.id
        ? supabase.from('scrm_contacts' as any).update(c).eq('id', c.id).select().maybeSingle()
        : supabase.from('scrm_contacts' as any).insert(c).select().maybeSingle();
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['scrm_contacts', v.sponsor_id] }),
  });
}
export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; sponsor_id: string }) => {
      const { error } = await supabase.from('scrm_contacts' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['scrm_contacts', v.sponsor_id] }),
  });
}

// Actions
export function useAllActions() {
  return useQuery({
    queryKey: ['scrm_actions_all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_actions' as any).select('*').order('due_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as Action[];
    },
  });
}
export function useSponsorActions(sponsorId?: string) {
  return useQuery({
    queryKey: ['scrm_actions', sponsorId],
    enabled: !!sponsorId,
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_actions' as any).select('*').eq('sponsor_id', sponsorId!).order('due_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Action[];
    },
  });
}
export function useSaveAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<Action> & { sponsor_id: string; title: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const payload: any = { ...a };
      if (!a.id) payload.created_by = u.user?.id;
      if (a.status === 'done' && !a.completed_at) payload.completed_at = new Date().toISOString();
      const q = a.id
        ? supabase.from('scrm_actions' as any).update(payload).eq('id', a.id).select().maybeSingle()
        : supabase.from('scrm_actions' as any).insert(payload).select().maybeSingle();
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['scrm_actions_all'] });
      qc.invalidateQueries({ queryKey: ['scrm_actions', v.sponsor_id] });
    },
  });
}
export function useDeleteAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; sponsor_id: string }) => {
      const { error } = await supabase.from('scrm_actions' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['scrm_actions_all'] });
      qc.invalidateQueries({ queryKey: ['scrm_actions', v.sponsor_id] });
    },
  });
}

// Meetings
export function useMeetings(sponsorId?: string) {
  return useQuery({
    queryKey: ['scrm_meetings', sponsorId],
    enabled: !!sponsorId,
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_meetings' as any).select('*').eq('sponsor_id', sponsorId!).order('meeting_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Meeting[];
    },
  });
}
export function useSaveMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: Partial<Meeting> & { sponsor_id: string; title: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const payload: any = { ...m };
      if (!m.id) payload.created_by = u.user?.id;
      const q = m.id
        ? supabase.from('scrm_meetings' as any).update(payload).eq('id', m.id).select().maybeSingle()
        : supabase.from('scrm_meetings' as any).insert(payload).select().maybeSingle();
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Meeting;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['scrm_meetings', v.sponsor_id] }),
  });
}

// Deliverables
export function useDeliverables(sponsorId?: string) {
  return useQuery({
    queryKey: ['scrm_deliverables', sponsorId],
    enabled: !!sponsorId,
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_deliverables' as any).select('*').eq('sponsor_id', sponsorId!).order('created_at');
      if (error) throw error;
      return (data ?? []) as unknown as Deliverable[];
    },
  });
}
export function useSaveDeliverable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Partial<Deliverable> & { sponsor_id: string; category: string; title: string }) => {
      const q = d.id
        ? supabase.from('scrm_deliverables' as any).update(d).eq('id', d.id).select().maybeSingle()
        : supabase.from('scrm_deliverables' as any).insert(d).select().maybeSingle();
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['scrm_deliverables', v.sponsor_id] }),
  });
}

// Team
export function useTeam() {
  return useQuery({
    queryKey: ['scrm_team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('scrm_user_roles' as any).select('*').order('created_at');
      if (error) throw error;
      return data as unknown as { id: string; user_id: string; role: string; email: string | null }[];
    },
  });
}

// AI meeting analysis
export async function analyzeMeeting(transcript: string, sponsor_name: string, stage: string) {
  const { data, error } = await supabase.functions.invoke('scrm-analyze-meeting', {
    body: { transcript, sponsor_name, stage },
  });
  if (error) throw error;
  return data as {
    objectives: string[]; topics: string[]; decisions: string[]; risks: string[]; questions: string[];
    minutes: string;
    actions: { title: string; category: string; waiting_on: 'mit'|'sponsor'; due_in_days: number; priority: 'low'|'medium'|'high' }[];
  };
}
