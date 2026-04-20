import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Contractor, SavedSegment, SegmentFilters } from './types';
import { seedContractors, seedSegments } from './seedData';

const STORAGE_KEY = 'cf:v1';

interface PersistedState {
  contractors: Contractor[];
  segments: SavedSegment[];
  flagged: string[]; // contractor ids flagged as bad data
}

interface CFStore extends PersistedState {
  saveSegment: (s: Omit<SavedSegment, 'id' | 'created_at'>) => SavedSegment;
  deleteSegment: (id: string) => void;
  updateSegment: (id: string, patch: Partial<SavedSegment>) => void;
  addToSegment: (segmentId: string, contractorId: string) => void;
  removeFromSegment: (segmentId: string, contractorId: string) => void;
  flagContractor: (id: string) => void;
  refreshContractor: (id: string) => void;
  applyFilters: (filters: SegmentFilters) => Contractor[];
}

const Ctx = createContext<CFStore | null>(null);

const load = (): PersistedState => {
  if (typeof window === 'undefined') return { contractors: seedContractors, segments: seedSegments, flagged: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { contractors: seedContractors, segments: seedSegments, flagged: [] };
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      contractors: parsed.contractors?.length ? parsed.contractors : seedContractors,
      segments: parsed.segments ?? seedSegments,
      flagged: parsed.flagged ?? [],
    };
  } catch {
    return { contractors: seedContractors, segments: seedSegments, flagged: [] };
  }
};

export function CFProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const applyFilters = useCallback(
    (f: SegmentFilters): Contractor[] => {
      let list = state.contractors;
      if (f.query) {
        const q = f.query.toLowerCase();
        list = list.filter(
          (c) =>
            c.company_name.toLowerCase().includes(q) ||
            c.contractor_type.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.specialties.some((s) => s.toLowerCase().includes(q)) ||
            c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (f.states?.length) list = list.filter((c) => f.states!.includes(c.state));
      if (f.cities?.length) list = list.filter((c) => f.cities!.some((x) => c.city.toLowerCase() === x.toLowerCase()));
      if (f.counties?.length) list = list.filter((c) => f.counties!.some((x) => c.county.toLowerCase() === x.toLowerCase()));
      if (f.zip) list = list.filter((c) => c.zip_code.startsWith(f.zip!));
      if (f.contractorTypes?.length) list = list.filter((c) => f.contractorTypes!.includes(c.contractor_type));
      if (f.licenseStatus?.length) list = list.filter((c) => f.licenseStatus!.includes(c.license_status));
      if (f.hasWebsite) list = list.filter((c) => !!c.website);
      if (f.hasEmail) list = list.filter((c) => !!c.email);
      if (f.hasVerifiedEmail) list = list.filter((c) => c.email_verified === true);
      if (f.hasPhone) list = list.filter((c) => !!c.phone);
      if (f.companySizes?.length) list = list.filter((c) => f.companySizes!.includes(c.estimated_company_size));
      if (f.maturity?.length) list = list.filter((c) => f.maturity!.includes(c.estimated_business_maturity));
      if (f.minReviews != null) list = list.filter((c) => (c.review_count ?? 0) >= f.minReviews!);
      if (f.maxReviews != null) list = list.filter((c) => (c.review_count ?? 0) <= f.maxReviews!);
      if (f.minConfidence != null) list = list.filter((c) => c.confidence_score >= f.minConfidence!);
      if (f.commercialResidential) list = list.filter((c) => c.commercial_residential === f.commercialResidential || c.commercial_residential === 'Both');
      return list;
    },
    [state.contractors]
  );

  const saveSegment: CFStore['saveSegment'] = (s) => {
    const seg: SavedSegment = {
      ...s,
      id: `s-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setState((p) => ({ ...p, segments: [seg, ...p.segments] }));
    return seg;
  };

  const deleteSegment = (id: string) => setState((p) => ({ ...p, segments: p.segments.filter((s) => s.id !== id) }));
  const updateSegment = (id: string, patch: Partial<SavedSegment>) =>
    setState((p) => ({ ...p, segments: p.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const addToSegment = (segmentId: string, contractorId: string) =>
    setState((p) => ({
      ...p,
      segments: p.segments.map((s) =>
        s.id === segmentId && !s.contractor_ids.includes(contractorId)
          ? { ...s, contractor_ids: [...s.contractor_ids, contractorId] }
          : s
      ),
    }));

  const removeFromSegment = (segmentId: string, contractorId: string) =>
    setState((p) => ({
      ...p,
      segments: p.segments.map((s) =>
        s.id === segmentId ? { ...s, contractor_ids: s.contractor_ids.filter((c) => c !== contractorId) } : s
      ),
    }));

  const flagContractor = (id: string) => setState((p) => ({ ...p, flagged: [...new Set([...p.flagged, id])] }));

  const refreshContractor = (id: string) =>
    setState((p) => ({
      ...p,
      contractors: p.contractors.map((c) =>
        c.contractor_id === id
          ? { ...c, last_verified_date: new Date().toISOString(), confidence_score: Math.min(100, c.confidence_score + 2) }
          : c
      ),
    }));

  const value = useMemo<CFStore>(
    () => ({ ...state, saveSegment, deleteSegment, updateSegment, addToSegment, removeFromSegment, flagContractor, refreshContractor, applyFilters }),
    [state, applyFilters]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCF() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCF must be used within CFProvider');
  return ctx;
}

export function exportToCSV(contractors: Contractor[], filename = 'contractors.csv') {
  const headers = [
    'company_name', 'contractor_type', 'license_number', 'license_status', 'city', 'county', 'state',
    'zip_code', 'phone', 'email', 'website', 'review_rating', 'review_count', 'years_in_business',
    'estimated_company_size', 'estimated_business_maturity', 'confidence_score', 'last_verified_date',
  ];
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = contractors.map((c) => headers.map((h) => escape((c as any)[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
