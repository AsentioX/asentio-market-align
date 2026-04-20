import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCF, exportToCSV } from './useCFStore';
import { Bookmark, Trash2, Download, ArrowRight, Plus, GitCompare, X } from 'lucide-react';
import { LicenseStatusBadge, ConfidenceMeter } from './components/Atoms';
import { toast } from 'sonner';

export default function Segments() {
  const { segments, contractors, deleteSegment, updateSegment } = useCF();
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [compare, setCompare] = useState<string[]>([]);

  const segContractors = (s: typeof segments[number]) =>
    contractors.filter((c) => s.contractor_ids.includes(c.contractor_id));

  const toggleCompare = (id: string) => {
    setCompare((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 2 ? [...p, id] : [p[1], id]));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Segments</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--cf-text-muted))' }}>
            Reusable contractor lists. Export, compare, and use for outreach.
          </p>
        </div>
        <Link
          to="/labs/contractor-finder/explore"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg text-white"
          style={{ background: 'hsl(var(--cf-primary))' }}
        >
          <Plus className="w-4 h-4" /> Build New Segment
        </Link>
      </div>

      {compare.length === 2 && <CompareView ids={compare} onClose={() => setCompare([])} />}

      {segments.length === 0 ? (
        <div className="rounded-xl py-24 text-center" style={{ background: 'hsl(var(--cf-surface))', border: '1px dashed hsl(var(--cf-border))' }}>
          <Bookmark className="w-10 h-10 mx-auto mb-3" style={{ color: 'hsl(var(--cf-text-subtle))' }} />
          <p className="text-sm font-medium mb-2">No segments yet</p>
          <Link to="/labs/contractor-finder/explore" className="text-xs font-semibold" style={{ color: 'hsl(var(--cf-primary))' }}>
            Build one from the Explore tab →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {segments.map((s) => {
            const list = segContractors(s);
            return (
              <div
                key={s.id}
                className="rounded-xl p-5 flex flex-col"
                style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-base">{s.name}</h3>
                    <div className="text-xs" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                      Created {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold tabular-nums px-2 py-0.5 rounded"
                    style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
                  >
                    {list.length}
                  </span>
                </div>

                {editingNotesId === s.id ? (
                  <div className="mb-3">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      rows={2}
                      className="w-full text-xs px-2 py-1.5 rounded outline-none"
                      style={{ background: 'hsl(var(--cf-surface-alt))', border: '1px solid hsl(var(--cf-border))' }}
                      placeholder="Add notes…"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => { updateSegment(s.id, { notes: notesDraft }); setEditingNotesId(null); }}
                        className="text-[11px] font-semibold px-2 py-1 rounded text-white"
                        style={{ background: 'hsl(var(--cf-primary))' }}
                      >Save</button>
                      <button onClick={() => setEditingNotesId(null)} className="text-[11px]">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingNotesId(s.id); setNotesDraft(s.notes ?? ''); }}
                    className="text-xs text-left mb-3 italic"
                    style={{ color: 'hsl(var(--cf-text-muted))' }}
                  >
                    {s.notes || '+ Add notes'}
                  </button>
                )}

                {/* Filter chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {s.filters.contractorTypes?.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}>{t}</span>
                  ))}
                  {s.filters.cities?.map((c) => (
                    <span key={c} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-purple-soft))', color: 'hsl(var(--cf-purple))' }}>📍 {c}</span>
                  ))}
                  {s.filters.hasVerifiedEmail && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success-soft))', color: 'hsl(var(--cf-success))' }}>✓ Email</span>}
                  {s.filters.hasWebsite && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--cf-success-soft))', color: 'hsl(var(--cf-success))' }}>Website</span>}
                </div>

                {/* Preview list */}
                <div className="flex-1 mb-3 space-y-1.5">
                  {list.slice(0, 3).map((c) => (
                    <div key={c.contractor_id} className="text-xs flex items-center justify-between gap-2 px-2 py-1.5 rounded"
                      style={{ background: 'hsl(var(--cf-surface-alt))' }}>
                      <span className="truncate font-medium">{c.company_name}</span>
                      <LicenseStatusBadge status={c.license_status} />
                    </div>
                  ))}
                  {list.length > 3 && (
                    <div className="text-[11px] pl-2" style={{ color: 'hsl(var(--cf-text-subtle))' }}>+{list.length - 3} more</div>
                  )}
                  {list.length === 0 && (
                    <div className="text-xs italic" style={{ color: 'hsl(var(--cf-text-subtle))' }}>Empty segment</div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => { exportToCSV(list, `${s.name.replace(/\s+/g, '-').toLowerCase()}.csv`); }}
                    disabled={list.length === 0}
                    className="text-[11px] font-semibold px-2 py-1.5 rounded flex items-center justify-center gap-1 disabled:opacity-50"
                    style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
                  >
                    <Download className="w-3 h-3" /> CSV
                  </button>
                  <button
                    onClick={() => toggleCompare(s.id)}
                    disabled={list.length === 0}
                    className="text-[11px] font-semibold px-2 py-1.5 rounded flex items-center justify-center gap-1 disabled:opacity-50"
                    style={
                      compare.includes(s.id)
                        ? { background: 'hsl(var(--cf-purple))', color: 'white' }
                        : { background: 'hsl(var(--cf-purple-soft))', color: 'hsl(var(--cf-purple))' }
                    }
                  >
                    <GitCompare className="w-3 h-3" /> Compare
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${s.name}"?`)) { deleteSegment(s.id); toast.success('Segment deleted'); } }}
                    className="text-[11px] font-semibold px-2 py-1.5 rounded flex items-center justify-center gap-1"
                    style={{ background: 'hsl(var(--cf-danger-soft))', color: 'hsl(var(--cf-danger))' }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompareView({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const { segments, contractors } = useCF();
  const [a, b] = ids.map((id) => segments.find((s) => s.id === id)!);
  const aList = contractors.filter((c) => a.contractor_ids.includes(c.contractor_id));
  const bList = contractors.filter((c) => b.contractor_ids.includes(c.contractor_id));
  const avgConf = (l: typeof aList) => l.length ? Math.round(l.reduce((s, c) => s + c.confidence_score, 0) / l.length) : 0;
  const pctEmail = (l: typeof aList) => l.length ? Math.round(l.filter((c) => c.email_verified).length / l.length * 100) : 0;

  return (
    <div className="rounded-xl p-5" style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-purple) / 0.3)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><GitCompare className="w-4 h-4" style={{ color: 'hsl(var(--cf-purple))' }} /> Side-by-side</h3>
        <button onClick={onClose}><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[a, b].map((s, i) => {
          const list = i === 0 ? aList : bList;
          return (
            <div key={s.id} className="rounded-lg p-4" style={{ background: 'hsl(var(--cf-surface-alt))' }}>
              <div className="font-semibold text-sm mb-3">{s.name}</div>
              <div className="space-y-2 text-xs">
                <Stat label="Total contractors" value={String(list.length)} />
                <Stat label="Avg. confidence" value={`${avgConf(list)}%`} />
                <Stat label="Verified emails" value={`${pctEmail(list)}%`} />
                <Stat label="Active licenses" value={`${list.filter((c) => c.license_status === 'Active').length}`} />
                <Stat label="Premium maturity" value={`${list.filter((c) => c.estimated_business_maturity === 'Premium / Design-Forward').length}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'hsl(var(--cf-text-muted))' }}>{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}
