import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryItem {
  id: string;
  user_id: string;
  label: string;
  item_type: 'race' | 'practice';
  media_url: string;
  media_kind: 'image' | 'video';
  sort_order: number;
  created_at: string;
}

export const useGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('beaver_boat_gallery')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    setItems((data as GalleryItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
};
