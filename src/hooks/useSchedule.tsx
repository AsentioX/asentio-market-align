import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ScheduleRole = 'hacker' | 'sponsor' | 'press' | 'mentor' | 'organizer';

export interface ScheduleItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  event_date: string;
  location: string | null;
  description: string | null;
  allowed_roles: ScheduleRole[];
  icon_name: string | null;
  created_at: string;
  updated_at: string;
}

export const SCHEDULE_ROLES: { value: ScheduleRole; label: string; color: string }[] = [
  { value: 'hacker', label: 'Hacker', color: 'bg-cyan-500' },
  { value: 'sponsor', label: 'Sponsor', color: 'bg-purple-500' },
  { value: 'press', label: 'Press', color: 'bg-pink-500' },
  { value: 'mentor', label: 'Mentor', color: 'bg-green-500' },
  { value: 'organizer', label: 'Organizer', color: 'bg-orange-500' },
];

export const EVENT_DATES = [
  { value: '2026-01-22', label: 'Jan 22', day: 'Thu' },
  { value: '2026-01-23', label: 'Jan 23', day: 'Fri' },
  { value: '2026-01-24', label: 'Jan 24', day: 'Sat' },
  { value: '2026-01-25', label: 'Jan 25', day: 'Sun' },
  { value: '2026-01-26', label: 'Jan 26', day: 'Mon' },
];

export const useScheduleItems = (date?: string, role?: ScheduleRole | null, search?: string) => {
  return useQuery({
    queryKey: ['schedule-items', date, role, search],
    queryFn: async () => {
      console.log('Fetching schedule items for date:', date);
      
      try {
        let query = supabase
          .from('schedule_items')
          .select('*')
          .order('event_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (date) {
          query = query.eq('event_date', date);
        }

        const { data, error } = await query;

        console.log('Schedule query result:', { dataLength: data?.length, error });

        if (error) {
          console.error('Schedule query error:', error);
          throw error;
        }

        let filteredData = (data || []) as ScheduleItem[];

        // Filter by role if specified
        if (role) {
          filteredData = filteredData.filter(item => 
            item.allowed_roles.includes(role)
          );
        }

        // Filter by search term
        if (search && search.trim()) {
          const searchLower = search.toLowerCase();
          filteredData = filteredData.filter(item =>
            item.title.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower)
          );
        }

        console.log('Returning filtered data:', filteredData.length, 'items');
        return filteredData;
      } catch (err) {
        console.error('Schedule fetch failed:', err);
        throw err;
      }
    },
    staleTime: 0, // Always refetch when component mounts
    gcTime: 1000 * 60 * 5, // Keep cache for 5 minutes for background use
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useCreateScheduleItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<ScheduleItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('schedule_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-items'] });
    },
  });
};

export const useUpdateScheduleItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<ScheduleItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-items'] });
    },
  });
};

export const useDeleteScheduleItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-items'] });
    },
  });
};
