import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { parseCSV, downloadCsv, csvValue } from '@/components/admin/csvUtils';
import { useScrmAuth } from '../lib/useScrmAuth';
import { STAGES, MOTIVATIONS, MOTIVATION_LABEL } from '../lib/constants';
import { useTeam } from '../lib/api';
import type { Sponsor } from '../lib/types';

// Columns mirror the sponsor detail page: header meta, meta grid, motivations, notes
const BASE_COLUMNS = [
  'company_name', 'industry', 'website', 'headquarters',
  'stage', 'priority', 'tier_target', 'owner',
];

const BASE_HEADERS = [
  'Company Name', 'Industry', 'Website', 'Headquarters',
  'Stage', 'Priority', 'Tier Target', 'Owner',
];

const MOTIVATION_HEADERS = MOTIVATIONS.map((k) => `${MOTIVATION_LABEL[k]} (0-10)`);

const HEADERS = [...BASE_HEADERS, ...MOTIVATION_HEADERS, 'Notes'];

const normalizeStage = (v: string) => {
  if (!v) return 'potential_sponsor';
  const key = v.trim().toLowerCase().replace(/\s+/g, '_');
  const byKey = STAGES.find((s) => s.key === key);
  if (byKey) return byKey.key;
  const byLabel = STAGES.find((s) => s.label.toLowerCase() === v.trim().toLowerCase());
  return byLabel ? byLabel.key : 'potential_sponsor';
};

const clamp10 = (v: string): number | null => {
  if (!v) return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(10, Math.round(n)));
};

interface Props {
  sponsors: Sponsor[];
}

const SponsorImportExport = ({ sponsors }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const { role } = useScrmAuth();
  const { data: team = [] } = useTeam();
  const isAdmin = role === 'admin';

  const ownerLabel = (id: string | null) => {
    const m = team.find((t: any) => t.id === id);
    return m ? (m.name || m.email || '') : '';
  };

  const ownerIdFrom = (val: string): string | null | undefined => {
    if (!val) return undefined;
    const v = val.trim().toLowerCase();
    if (v === 'unassigned' || v === 'none') return null;
    const m = team.find(
      (t: any) => (t.name ?? '').toLowerCase() === v || (t.email ?? '').toLowerCase() === v
    );
    return m ? m.id : undefined;
  };

  const rowFor = (s: any) => [
    ...BASE_COLUMNS.map((c) => (c === 'owner' ? ownerLabel(s.owner_id ?? null) : csvValue(s[c]))),
    ...MOTIVATIONS.map((k) => csvValue(s.motivations?.[k] ?? '')),
    csvValue(s.notes),
  ];

  const handleExport = () => {
    if (!sponsors.length) return toast.error('No sponsors to export');
    downloadCsv(
      `sponsors-${new Date().toISOString().slice(0, 10)}.csv`,
      HEADERS,
      sponsors.map(rowFor)
    );
    toast.success(`Exported ${sponsors.length} sponsors`);
  };

  const handleTemplate = () => {
    downloadCsv('sponsors-template.csv', HEADERS, [
      rowFor({
        company_name: 'Acme XR',
        industry: 'Hardware',
        website: 'https://acme.xr',
        headquarters: 'Boston, MA',
        stage: 'Contacting',
        priority: 'high',
        tier_target: 'Gold',
        owner_id: null,
        motivations: { developer_adoption: 8, recruiting: 5 },
        notes: 'Met at CES',
      }),
    ]);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const rows = parseCSV(await file.text());
      if (!rows.length) throw new Error('No rows found in the CSV');

      const existing = new Map(sponsors.map((s) => [s.company_name.trim().toLowerCase(), s]));
      const { data: u } = await supabase.auth.getUser();
      let created = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const [i, r] of rows.entries()) {
        const name = (r['company name'] || r['company_name'] || '').trim();
        if (!name) { errors.push(`Row ${i + 2}: missing company name`); continue; }

        const prev = existing.get(name.toLowerCase());

        const payload: Record<string, unknown> = {
          company_name: name,
          industry: r['industry'] || null,
          website: r['website'] || null,
          headquarters: r['headquarters'] || null,
          priority: (r['priority'] || 'medium').toLowerCase(),
          tier_target: r['tier target'] || r['tier_target'] || null,
          notes: r['notes'] || null,
        };

        const stageRaw = r['stage'] || '';
        if (stageRaw || !prev) payload.stage = normalizeStage(stageRaw);

        const owner = ownerIdFrom(r['owner'] || '');
        if (owner !== undefined) payload.owner_id = owner;

        // Motivations: only overwrite keys present in the CSV
        const motivations: Record<string, number> = { ...((prev?.motivations as any) ?? {}) };
        let hasMotivation = false;
        MOTIVATIONS.forEach((k, idx) => {
          const header = MOTIVATION_HEADERS[idx].toLowerCase();
          const raw = r[header] ?? r[MOTIVATION_LABEL[k].toLowerCase()] ?? r[k];
          const val = clamp10(raw ?? '');
          if (val !== null) { motivations[k] = val; hasMotivation = true; }
        });
        if (hasMotivation) payload.motivations = motivations;

        const res = prev
          ? await supabase.from('scrm_sponsors' as any).update(payload).eq('id', prev.id)
          : await supabase.from('scrm_sponsors' as any).insert({ ...payload, created_by: u.user?.id });

        if (res.error) errors.push(`Row ${i + 2} (${name}): ${res.error.message}`);
        else if (prev) updated++;
        else created++;
      }

      qc.invalidateQueries({ queryKey: ['scrm_sponsors'] });
      if (errors.length) {
        toast.error(`${errors.length} row(s) failed`, { description: errors.slice(0, 3).join(' · ') });
      }
      if (created || updated) toast.success(`Imported: ${created} created, ${updated} updated`);
    } catch (err: any) {
      toast.error(err.message ?? 'Import failed');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      <Button variant="outline" size="sm" onClick={handleTemplate}>Template</Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Import
      </Button>
      {isAdmin && (
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
      )}
    </div>
  );
};

export default SponsorImportExport;
