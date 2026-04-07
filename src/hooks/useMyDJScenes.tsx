import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────
export interface DJLocation {
  id: string;
  name: string;
  location_type: string;
  detection_method: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
  wifi_signature: string | null;
  beacon_id: string | null;
}

export interface DJAudioScene {
  id: string;
  location_id: string;
  name: string;
  preferred_genre: string | null;
  preferred_artist: string | null;
  preferred_bpm_min: number | null;
  preferred_bpm_max: number | null;
  entry_behavior: string;
  exit_behavior: string;
  reentry_behavior: string;
  fade_in_seconds: number | null;
  fade_out_seconds: number | null;
  priority: number;
  is_active: boolean;
}

export interface DJMemoryAssociation {
  id: string;
  location_id: string | null;
  title: string;
  note: string | null;
  memory_type: string;
  emotional_intent: string;
  strength_score: number;
}

// ─── Locations ───────────────────────────────────────
export function useLocations(userId: string | undefined) {
  return useQuery({
    queryKey: ['mydj-locations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mydj_locations')
        .select('id, name, location_type, detection_method, is_active, latitude, longitude, radius_meters, wifi_signature, beacon_id')
        .order('name');
      if (error) throw error;
      return data as DJLocation[];
    },
    enabled: !!userId,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { user_id: string; name: string; location_type: string; detection_method: string }) => {
      const { data, error } = await supabase.from('mydj_locations').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mydj-locations'] });
      toast.success('Location saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mydj_locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mydj-locations'] });
      toast.success('Location deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Audio Scenes ────────────────────────────────────
export function useAudioScenes(userId: string | undefined) {
  return useQuery({
    queryKey: ['mydj-scenes', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mydj_audio_scenes')
        .select('id, location_id, name, preferred_genre, preferred_artist, preferred_bpm_min, preferred_bpm_max, entry_behavior, exit_behavior, reentry_behavior, fade_in_seconds, fade_out_seconds, priority, is_active')
        .order('priority');
      if (error) throw error;
      return data as DJAudioScene[];
    },
    enabled: !!userId,
  });
}

export function useCreateScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      location_id: string;
      name: string;
      preferred_genre?: string | null;
      entry_behavior: string;
      exit_behavior: string;
      reentry_behavior: string;
      fade_in_seconds?: number | null;
      fade_out_seconds?: number | null;
    }) => {
      const { data, error } = await supabase.from('mydj_audio_scenes').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mydj-scenes'] });
      toast.success('Audio scene saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleScene() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('mydj_audio_scenes').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mydj-scenes'] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Memory Associations ─────────────────────────────
export function useMemories(userId: string | undefined) {
  return useQuery({
    queryKey: ['mydj-memories', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mydj_memory_associations')
        .select('id, location_id, title, note, memory_type, emotional_intent, strength_score')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DJMemoryAssociation[];
    },
    enabled: !!userId,
  });
}

export function useCreateMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      user_id: string;
      title: string;
      note?: string | null;
      location_id?: string | null;
      memory_type: string;
      emotional_intent: string;
      strength_score: number;
    }) => {
      const { data, error } = await supabase.from('mydj_memory_associations').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mydj-memories'] });
      toast.success('Memory saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mydj_memory_associations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mydj-memories'] });
      toast.success('Memory deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
