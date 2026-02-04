import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { XRAgency } from './useXRAgencies';

export interface XRUseCase {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  device: string;
  tech_stack: string[] | null;
  agency_id: string | null;
  image_url: string | null;
  client_name: string | null;
  is_editors_pick: boolean;
  editors_note: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  agency?: XRAgency;
}

export interface UseCaseFilters {
  search?: string;
  device?: string;
  agency_id?: string;
}

export const useXRUseCases = (filters?: UseCaseFilters) => {
  return useQuery({
    queryKey: ['xr-use-cases', filters],
    queryFn: async () => {
      let query = supabase
        .from('xr_use_cases')
        .select(`
          *,
          agency:xr_agencies(*)
        `)
        .order('is_editors_pick', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`);
      }
      if (filters?.device && filters.device !== 'all') {
        query = query.eq('device', filters.device);
      }
      if (filters?.agency_id && filters.agency_id !== 'all') {
        query = query.eq('agency_id', filters.agency_id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as XRUseCase[];
    }
  });
};

export const useXRUseCase = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['xr-use-case', idOrSlug],
    queryFn: async () => {
      // Try by ID first (UUID format), then by slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const column = isUUID ? 'id' : 'slug';
      
      const { data, error } = await supabase
        .from('xr_use_cases')
        .select(`
          *,
          agency:xr_agencies(*)
        `)
        .eq(column, idOrSlug)
        .single();
      
      if (error) throw error;
      return data as XRUseCase;
    },
    enabled: !!idOrSlug
  });
};

export const useCreateUseCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (useCase: Omit<XRUseCase, 'id' | 'created_at' | 'updated_at' | 'agency'>) => {
      const { data, error } = await supabase
        .from('xr_use_cases')
        .insert(useCase)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-use-cases'] });
    }
  });
};

export const useUpdateUseCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...useCase }: Partial<XRUseCase> & { id: string }) => {
      const { agency, ...rest } = useCase;
      const { data, error } = await supabase
        .from('xr_use_cases')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-use-cases'] });
    }
  });
};

export const useDeleteUseCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('xr_use_cases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-use-cases'] });
    }
  });
};

export const USE_CASE_DEVICES = [
  'Meta Quest 3',
  'Meta Quest Pro',
  'Apple Vision Pro',
  'Microsoft HoloLens 2',
  'Magic Leap 2',
  'Varjo XR-4',
  'Pico 4 Enterprise',
  'HTC Vive XR Elite',
  'Nreal Air',
  'Xreal Air 2',
  'Ray-Ban Meta',
  'Mobile AR (iOS/Android)',
  'WebXR',
  'Custom Hardware'
] as const;

export const TECH_STACK_OPTIONS = [
  'Unity',
  'Unreal Engine',
  'WebXR',
  'ARKit',
  'ARCore',
  'Vuforia',
  'Meta SDK',
  'OpenXR',
  'MRTK',
  'A-Frame',
  'Three.js',
  'Babylon.js',
  '8th Wall',
  'Niantic Lightship'
] as const;
