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

// Columns mirror the sponsor detail page: header meta, meta grid, tabs, notes
const BASE_COLUMNS = [
  'company_name', 'industry', 'sponsor_type', 'website', 'headquarters', 'organization_type',
  'stage', 'priority', 'tier_target', 'owner',
  'likelihood_2027', 'strategic_fit', 'recommended_activation', 'recommended_next_action',
];

const BASE_HEADERS = [
  'Company Name', 'Industry', 'Type', 'Website', 'Headquarters', 'Organization Type',
  'Stage', 'Priority', 'Tier Target', 'Owner',
  '2027 Sponsorship Likelihood', 'Strategic Fit / Focus', 'Recommended Activation', 'Recommended Next Action',
];

const MOTIVATION_HEADERS = MOTIVATIONS.map((k) => `${MOTIVATION_LABEL[k]} (0-10)`);

// Multi-value tab columns. Records separated by ";", fields inside a record by "|".
const CHILD_HEADERS = [
  'Actions (title | due date | owner | waiting on | priority | category | status; …)',
  'Contacts (name | role | email | linkedin | influence | decision maker; …)',
  'Meetings (title | date | attendees; …)',
  'Delivery (category | title | status | due date; …)',
  'Past Sponsorships (year | amount | tier | feedback; …)',
];

const HEADERS = [...BASE_HEADERS, ...MOTIVATION_HEADERS, ...CHILD_HEADERS, 'Notes'];

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

const clean = (v: unknown) => String(v ?? '').replace(/[;|\r\n]+/g, ' ').trim();
const packRecords = (rows: unknown[][]) =>
  rows.map((f) => f.map(clean).join(' | ')).join('; ');
const unpackRecords = (raw: string) =>
  (raw || '')
    .split(';')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split('|').map((f) => f.trim()));

const dateOrNull = (v: string) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
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

  const rowFor = (s: any, children?: any) => [
    ...BASE_COLUMNS.map((c) => (c === 'owner' ? ownerLabel(s.owner_id ?? null) : csvValue(s[c]))),
    ...MOTIVATIONS.map((k) => csvValue(s.motivations?.[k] ?? '')),
    csvValue(packRecords((children?.actions ?? []).map((a: any) => [a.title, a.due_date, a.owner_name, a.waiting_on, a.priority, a.category, a.status]))),
    csvValue(packRecords((children?.contacts ?? []).map((c: any) => [c.name, c.role, c.email, c.linkedin, c.influence, c.is_decision_maker ? 'yes' : 'no']))),
    csvValue(packRecords((children?.meetings ?? []).map((m: any) => [m.title, m.meeting_date, m.attendees]))),
    csvValue(packRecords((children?.deliverables ?? []).map((d: any) => [d.category, d.title, d.status, d.due_date]))),
    csvValue(packRecords((children?.past ?? []).map((p: any) => [p.year, p.amount, p.tier, p.feedback]))),
    csvValue(s.notes),
  ];

  const handleExport = async () => {
    if (!sponsors.length) return toast.error('No sponsors to export');
    setBusy(true);
    try {
      const ids = sponsors.map((s) => s.id);
      const grab = async (table: string) => {
        const { data } = await supabase.from(table as any).select('*').in('sponsor_id', ids);
        return (data ?? []) as any[];
      };
      const [actions, contacts, meetings, deliverables, past] = await Promise.all([
        grab('scrm_actions'), grab('scrm_contacts'), grab('scrm_meetings'),
        grab('scrm_deliverables'), grab('scrm_past_sponsorships'),
      ]);
      const by = (rows: any[], id: string) => rows.filter((r) => r.sponsor_id === id);
      downloadCsv(
        `sponsors-${new Date().toISOString().slice(0, 10)}.csv`,
        HEADERS,
        sponsors.map((s) => rowFor(s, {
          actions: by(actions, s.id), contacts: by(contacts, s.id), meetings: by(meetings, s.id),
          deliverables: by(deliverables, s.id), past: by(past, s.id),
        }))
      );
      toast.success(`Exported ${sponsors.length} sponsors`);
    } catch (e: any) {
      toast.error(e.message ?? 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const handleTemplate = () => {
    downloadCsv('sponsors-template.csv', HEADERS, [
      rowFor(
        {
          company_name: 'Acme XR',
          industry: 'Hardware',
          sponsor_type: 'Corporate',
          website: 'https://acme.xr',
          headquarters: 'Boston, MA',
          organization_type: 'Private company',
          likelihood_2027: 'High',
          strategic_fit: 'Developer tooling + hardware ecosystem',
          recommended_activation: 'Hardware lab + workshop',
          recommended_next_action: 'Send 2027 prospectus',
          stage: 'Contacting',
          priority: 'high',
          tier_target: 'Gold',
          owner_id: null,
          motivations: { developer_adoption: 8, recruiting: 5 },
          notes: 'Met at CES',
        },
        {
          actions: [{ title: 'Send deck', due_date: '2026-09-01', owner_name: 'Jon Li', waiting_on: 'mit', priority: 'high', category: 'outreach', status: 'open' }],
          contacts: [{ name: 'Jane Doe', role: 'Head of Developer Relations', email: 'jane@acme.xr', linkedin: '', influence: 'high', is_decision_maker: true }],
          meetings: [{ title: 'Intro call', meeting_date: '2026-08-20', attendees: 'Jane Doe, Jon Li' }],
          deliverables: [{ category: 'Branding', title: 'Logo on main stage', status: 'planned', due_date: '2026-12-01' }],
          past: [{ year: 2025, amount: 50000, tier: 'Gold', feedback: 'Wanted more recruiting access' }],
        }
      ),
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

      const pick = (r: Record<string, string>, prefix: string) => {
        const key = Object.keys(r).find((k) => k.startsWith(prefix.toLowerCase()));
        return key ? r[key] : '';
      };

      for (const [i, r] of rows.entries()) {
        const name = (r['company name'] || r['company_name'] || '').trim();
        if (!name) { errors.push(`Row ${i + 2}: missing company name`); continue; }

        const prev = existing.get(name.toLowerCase());

        const payload: Record<string, unknown> = {
          company_name: name,
          industry: r['industry'] || null,
          sponsor_type: r['type'] || r['sponsor_type'] || null,
          website: r['website'] || null,
          headquarters: r['headquarters'] || null,
          organization_type: r['organization type'] || r['organization_type'] || null,
          likelihood_2027: r['2027 sponsorship likelihood'] || r['likelihood_2027'] || null,
          strategic_fit: r['strategic fit / focus'] || r['strategic fit'] || r['strategic_fit'] || null,
          recommended_activation: r['recommended activation'] || r['recommended_activation'] || null,
          recommended_next_action: r['recommended next action'] || r['recommended_next_action'] || null,
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
          ? await supabase.from('scrm_sponsors' as any).update(payload).eq('id', prev.id).select('id').maybeSingle()
          : await supabase.from('scrm_sponsors' as any).insert({ ...payload, created_by: u.user?.id }).select('id').maybeSingle();

        if (res.error) { errors.push(`Row ${i + 2} (${name}): ${res.error.message}`); continue; }
        if (prev) updated++; else created++;

        const sponsorId = (res.data as any)?.id ?? prev?.id;
        if (!sponsorId) continue;

        // ---- Child records (append-only; existing rows are never duplicated) ----
        const childInsert = async (table: string, rowsToAdd: any[], keyOf: (x: any) => string) => {
          if (!rowsToAdd.length) return;
          const { data: cur } = await supabase.from(table as any).select('*').eq('sponsor_id', sponsorId);
          const seen = new Set((cur ?? []).map((x: any) => keyOf(x)));
          const fresh = rowsToAdd.filter((x) => !seen.has(keyOf(x)));
          if (!fresh.length) return;
          const { error } = await supabase.from(table as any).insert(fresh);
          if (error) errors.push(`Row ${i + 2} (${name}) ${table}: ${error.message}`);
        };

        await childInsert('scrm_actions',
          unpackRecords(pick(r, 'actions (')).filter((f) => f[0]).map((f) => ({
            sponsor_id: sponsorId, title: f[0], due_date: dateOrNull(f[1] ?? ''), owner_name: f[2] || null,
            waiting_on: (f[3] || 'mit').toLowerCase(), priority: (f[4] || 'medium').toLowerCase(),
            category: f[5] || null, status: (f[6] || 'open').toLowerCase(), created_by: u.user?.id,
          })),
          (x) => `${(x.title ?? '').toLowerCase()}`);

        await childInsert('scrm_contacts',
          unpackRecords(pick(r, 'contacts (')).filter((f) => f[0]).map((f) => ({
            sponsor_id: sponsorId, name: f[0], role: f[1] || null, email: f[2] || null,
            linkedin: f[3] || null, influence: (f[4] || 'medium').toLowerCase(),
            is_decision_maker: /^(yes|true|y|1|dm)$/i.test(f[5] ?? ''),
          })),
          (x) => `${(x.name ?? '').toLowerCase()}`);

        await childInsert('scrm_meetings',
          unpackRecords(pick(r, 'meetings (')).filter((f) => f[0]).map((f) => ({
            sponsor_id: sponsorId, title: f[0], meeting_date: dateOrNull(f[1] ?? ''),
            attendees: f[2] || null, source: 'import', created_by: u.user?.id,
          })),
          (x) => `${(x.title ?? '').toLowerCase()}|${x.meeting_date ?? ''}`);

        await childInsert('scrm_deliverables',
          unpackRecords(pick(r, 'delivery (')).filter((f) => f[0] && f[1]).map((f) => ({
            sponsor_id: sponsorId, category: f[0], title: f[1],
            status: (f[2] || 'planned').toLowerCase(), due_date: dateOrNull(f[3] ?? ''),
          })),
          (x) => `${(x.category ?? '').toLowerCase()}|${(x.title ?? '').toLowerCase()}`);

        await childInsert('scrm_past_sponsorships',
          unpackRecords(pick(r, 'past sponsorships (')).filter((f) => Number(f[0])).map((f) => ({
            sponsor_id: sponsorId, year: Number(f[0]),
            amount: f[1] ? Number(String(f[1]).replace(/[^\d.-]/g, '')) : null,
            tier: f[2] || null, feedback: f[3] || null, created_by: u.user?.id,
          })),
          (x) => `${x.year}`);
      }

      ['scrm_sponsors', 'scrm_actions_all', 'scrm_contacts', 'scrm_meetings', 'scrm_deliverables', 'scrm_past_sponsorships', 'scrm_actions']
        .forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
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
        <Button variant="outline" size="sm" disabled={busy} onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> Export
        </Button>
      )}
    </div>
  );
};

export default SponsorImportExport;
