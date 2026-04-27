import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePerkPathAuth } from './usePerkPathAuth';

export type PerkCategory = 'auto' | 'dining' | 'travel' | 'shopping' | 'health' | 'entertainment' | 'services' | 'other';
export type Pillar = 'work' | 'home' | 'play';
export type MembershipCategory = 'financial' | 'lifestyle';

export type RewardsCurrency = 'cashback' | 'points';
export type RewardRates = Partial<Record<PerkCategory, number>>;

export interface Membership {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  tier: string | null;
  category: MembershipCategory;
  pillar: Pillar;
  brand_color: string;
  logo: string;
  perk_tags: string[];
  renewal_date: string | null;
  reciprocal_benefits: boolean;
  notes: string | null;
  is_active: boolean;
  card_image_url?: string | null;
  card_type?: string | null;
  // Card rewards (financial cards only). Defaults to base 1x cashback.
  reward_rates?: RewardRates;
  base_rate?: number;
  points_value_cents?: number;
  rewards_currency?: RewardsCurrency;
  rewards_seeded_at?: string | null;
}

export interface Perk {
  id: string;
  membership_id: string;
  user_id: string;
  title: string;
  value_label: string;
  category: PerkCategory;
  venue: string | null;
  how_to_redeem: string | null;
  image_url: string | null;
  perk_tags: string[];
  is_active: boolean;
  sort_order: number;
  // Joined
  membership?: Membership;
}

export interface Venue {
  id: string;
  name: string;
  brand: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  category: PerkCategory | null;
  perk_tags: string[];
}

export function usePerkPath() {
  const { user } = usePerkPathAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setMemberships([]); setPerks([]); setVenues([]); setLoading(false); return; }
    setLoading(true);
    const [mRes, pRes, vRes] = await Promise.all([
      supabase.from('pp_memberships').select('*').eq('user_id', user.id).eq('is_active', true).order('name'),
      supabase.from('pp_perks').select('*').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
      supabase.from('pp_venues').select('*'),
    ]);
    if (mRes.data) setMemberships(mRes.data as unknown as Membership[]);
    if (pRes.data) setPerks(pRes.data as Perk[]);
    if (vRes.data) setVenues(vRes.data as Venue[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Joined perks with membership lookup
  const enrichedPerks = useMemo(() => {
    const map = new Map(memberships.map(m => [m.id, m]));
    return perks.map(p => ({ ...p, membership: map.get(p.membership_id) }));
  }, [memberships, perks]);

  const updateMembership = useCallback(async (id: string, patch: Partial<Membership>) => {
    if (!user) return;
    await supabase.from('pp_memberships').update(patch).eq('id', id).eq('user_id', user.id);
    await fetchAll();
  }, [user, fetchAll]);

  const deleteMembership = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('pp_memberships').delete().eq('id', id).eq('user_id', user.id);
    await fetchAll();
  }, [user, fetchAll]);

  return {
    memberships,
    perks: enrichedPerks,
    venues,
    loading,
    updateMembership,
    deleteMembership,
    refresh: fetchAll,
  };
}
