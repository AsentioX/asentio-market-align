import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { parseCSV, exportRowsCsv } from '@/components/admin/csvUtils';
import { STAGES } from '../lib/constants';
import type { Sponsor } from '../lib/types';

const COLUMNS = [
  'company_name', 'industry', 'website', 'headquarters', 'stage', 'priority',
  'tier_target', 'relationship_strength', 'probability', 'estimated_value', 'notes',
];

const HEADERS = [
  'Company Name', 'Industry', 'Website', 'Headquarters', 'Stage', 'Priority',
  'Tier Target', 'Relationship Strength', 'Probability', 'Estimated Value', 'Notes',
];

const num = (v: string) => {
  if (!v) return null;
  const n = Number(String(v).replace(/[$,%\s,]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const normalizeStage = (v: string) => {
  if (!v) return 'target_identified';
  const key = v.trim().toLowerCase().replace(/\s+/g, '_');
  const byKey = STAGES.find((s) => s.key === key);
  if (byKey) return byKey.key;
  const byLabel = STAGES.find((s) => s.label.toLowerCase() === v.trim().toLowerCase());
  return byLabel ? byLabel.key : 'target_identified';
};

interface Props {
  sponsors: Sponsor[];
}

const SponsorImportExport = ({ sponsors }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();

  const handleExport = () => {
    if (!sponsors.length) return toast.error('No sponsors to export');
    exportRowsCsv(
      `sponsors-${new Date().toISOString().slice(0, 10)}.csv`,
      HEADERS,
      COLUMNS,
      sponsors as unknown as Record<string, unknown>[]
    );
    toast.success(`Exported ${sponsors.length} sponsors`);
  };

  const handleTemplate = () => {
    exportRowsCsv('sponsors-template.csv', HEADERS, COLUMNS, [
      {
        company_name: 'Acme XR',
        industry: 'Hardware',
        website: 'https://acme.xr',
        headquarters: 'Boston, MA',
        stage: 'Initial Contact',
        priority: 'high',
        tier_target: 'Gold',
        relationship_strength: 3,
        probability: 40,
        estimated_value: 25000,
        notes: 'Met at CES',
      },
    ]);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const rows = parseCSV(await file.text());
      if (!rows.length) throw new Error('No rows found in the CSV');

      const existing = new Map(sponsors.map((s) => [s.company_name.trim().toLowerCase(), s.id]));
      const { data: u } = await supabase.auth.getUser();
      let created = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const [i, r] of rows.entries()) {
        const name = (r['company name'] || r['company_name'] || '').trim();
        if (!name) { errors.push(`Row ${i + 2}: missing company name`); continue; }

        const payload: Record<string, unknown> = {
          company_name: name,
          industry: r['industry'] || null,
          website: r['website'] || null,
          headquarters: r['headquarters'] || null,
          priority: (r['priority'] || 'medium').toLowerCase(),
          tier_target: r['tier target'] || r['tier_target'] || null,
          relationship_strength: num(r['relationship strength'] || r['relationship_strength']),
          probability: num(r['probability']),
          estimated_value: num(r['estimated value'] || r['estimated_value']),
          notes: r['notes'] || null,
        };
        const stageRaw = r['stage'] || '';
        const id = existing.get(name.toLowerCase());
        if (stageRaw || !id) payload.stage = normalizeStage(stageRaw);

        const res = id
          ? await supabase.from('scrm_sponsors' as any).update(payload).eq('id', id)
          : await supabase.from('scrm_sponsors' as any).insert({ ...payload, created_by: u.user?.id });

        if (res.error) errors.push(`Row ${i + 2} (${name}): ${res.error.message}`);
        else if (id) updated++;
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
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-1" /> Export
      </Button>
      <Button variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
        {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />} Import
      </Button>
    </div>
  );
};

export default SponsorImportExport;
