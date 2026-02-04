import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface XRAgency {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  services: string[] | null;
  regions: string[] | null;
  is_editors_pick: boolean;
  editors_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyFilters {
  search?: string;
  region?: string;
  service?: string;
}

export const useXRAgencies = (filters?: AgencyFilters) => {
  return useQuery({
    queryKey: ['xr-agencies', filters],
    queryFn: async () => {
      let query = supabase
        .from('xr_agencies')
        .select('*')
        .order('is_editors_pick', { ascending: false })
        .order('name', { ascending: true });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.region && filters.region !== 'all') {
        query = query.contains('regions', [filters.region]);
      }
      if (filters?.service && filters.service !== 'all') {
        query = query.contains('services', [filters.service]);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as XRAgency[];
    }
  });
};

export const useXRAgency = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['xr-agency', idOrSlug],
    queryFn: async () => {
      // Try by ID first (UUID format), then by slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const column = isUUID ? 'id' : 'slug';
      
      const { data, error } = await supabase
        .from('xr_agencies')
        .select('*')
        .eq(column, idOrSlug)
        .single();
      
      if (error) throw error;
      return data as XRAgency;
    },
    enabled: !!idOrSlug
  });
};

export const useCreateAgency = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agency: Omit<XRAgency, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('xr_agencies')
        .insert(agency)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-agencies'] });
    }
  });
};

export const useUpdateAgency = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...agency }: Partial<XRAgency> & { id: string }) => {
      const { data, error } = await supabase
        .from('xr_agencies')
        .update(agency)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-agencies'] });
    }
  });
};

export const useDeleteAgency = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('xr_agencies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xr-agencies'] });
    }
  });
};

export const AGENCY_SERVICES = [
  'AR Development',
  'VR Development',
  'MR Development',
  'Spatial Computing',
  '3D Modeling',
  'Digital Twins',
  'Training & Simulation',
  'Marketing & Advertising',
  'Enterprise Solutions',
  'Consulting'
] as const;

export const AGENCY_REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Global'
] as const;
