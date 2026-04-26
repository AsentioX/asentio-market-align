import { useState } from 'react';
import { Wallet, Plus, Pencil, Trash2, ChevronDown, X, Check, Loader2, Sparkles, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import AddCardModal from './AddCardModal';
import type { Membership, Perk } from '@/hooks/usePerkPath';
import { getBrandLogoUrl } from './brandLogo';

interface Props {
  memberships: Membership[];
  perks: Perk[];
  onChanged: () => void;
  onUpdate: (id: string, patch: Partial<Membership>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const BRAND_COLORS = ['#1F2937', '#1565C0', '#D32F2F', '#1A237E', '#37474F', '#10b981', '#7C3AED', '#F59E0B'];

// Per-card logo loaded-state tracker (so we can fall back to the emoji)
const BrandLogo = ({ name, fallback }: { name: string; fallback: string }) => {
  const url = getBrandLogoUrl(name, 128);
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return <div className="text-3xl drop-shadow">{fallback}</div>;
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-white/95 shadow-sm flex items-center justify-center overflow-hidden p-1.5">
      <img
        src={url}
        alt={`${name} logo`}
        className="w-full h-full object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
};

const VaultView = ({ memberships, perks, onChanged, onUpdate, onDelete }: Props) => {
  const [addOpen, setAddOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Edit form local state
  const [form, setForm] = useState<Partial<Membership>>({});

  const startEdit = (m: Membership) => {
    setEditing(m.id);
    setForm({
      name: m.name,
      tier: m.tier ?? '',
      brand_color: m.brand_color,
      pillar: m.pillar,
      category: m.category,
      renewal_date: m.renewal_date,
    });
  };

  const cancelEdit = () => { setEditing(null); setForm({}); };

  const saveEdit = async (id: string) => {
    if (!form.name?.trim()) { toast.error('Name is required'); return; }
    setBusy(true);
    try {
      await onUpdate(id, {
        ...form,
        name: form.name.trim(),
        tier: (form.tier as string)?.trim() || null,
      });
      toast.success('Card updated');
      cancelEdit();
    } catch {
      toast.error('Failed to update card');
    } finally { setBusy(false); }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    try {
      await onDelete(id);
      toast.success('Card removed');
      setConfirmDelete(null);
      if (expanded === id) setExpanded(null);
    } catch {
      toast.error('Failed to delete card');
    } finally { setBusy(false); }
  };

  return (
    <div className="px-5 pt-5 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Your Wallet</h2>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Card
        </button>
      </div>

      {memberships.length === 0 ? (
        <button
          onClick={() => setAddOpen(true)}
          className="w-full flex flex-col items-center justify-center py-16 px-8 text-center rounded-3xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
        >
          <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1.5">Add Your First Card</h2>
          <p className="text-xs text-slate-500 max-w-[260px]">Save the cards you carry so you always know which perks are within reach.</p>
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          {memberships.map(m => {
            const isOpen = expanded === m.id;
            const isEditing = editing === m.id;
            const cardPerks = perks.filter(p => p.membership_id === m.id);

            return (
              <div key={m.id} className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                {/* Card visual */}
                <button
                  onClick={() => { if (!isEditing) setExpanded(isOpen ? null : m.id); }}
                  className="w-full text-left relative overflow-hidden min-h-[150px] active:scale-[0.99] transition-transform"
                  style={{ backgroundColor: m.brand_color }}
                >
                  {m.card_image_url ? (
                    <>
                      <img src={m.card_image_url} alt={m.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    </>
                  ) : null}
                  <div className="relative p-5 flex flex-col justify-between h-full min-h-[150px] text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        {m.card_type && (
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/70 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full self-start">
                            {m.card_type}
                          </span>
                        )}
                      </div>
                      <div className="text-3xl drop-shadow">{m.logo}</div>
                    </div>
                    <div>
                      <p className="text-lg font-bold drop-shadow leading-tight">{m.name}</p>
                      {m.tier && (
                        <p className="text-xs text-white/90 font-semibold drop-shadow mt-0.5">{m.tier}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-white/80 font-medium">
                        <span className="capitalize">{m.category}</span>
                        <span className="w-1 h-1 rounded-full bg-white/50" />
                        <span className="capitalize">{m.pillar}</span>
                        {cardPerks.length > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/50" />
                            <span>{cardPerks.length} perk{cardPerks.length === 1 ? '' : 's'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Action bar */}
                {!isEditing && (
                  <div className="flex items-center border-t border-slate-100">
                    <button
                      onClick={() => setExpanded(isOpen ? null : m.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      {isOpen ? 'Hide' : 'Details'}
                    </button>
                    <div className="w-px h-5 bg-slate-100" />
                    <button
                      onClick={() => startEdit(m)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <div className="w-px h-5 bg-slate-100" />
                    <button
                      onClick={() => setConfirmDelete(m.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                )}

                {/* Expanded details */}
                <AnimatePresence initial={false}>
                  {isOpen && !isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-100 bg-slate-50/60"
                    >
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <DetailItem label="Type" value={m.card_type ?? '—'} />
                          <DetailItem label="Tier" value={m.tier ?? '—'} />
                          <DetailItem label="Category" value={m.category} />
                          <DetailItem label="Pillar" value={m.pillar} />
                          <DetailItem
                            label="Renewal"
                            value={m.renewal_date ? new Date(m.renewal_date).toLocaleDateString() : '—'}
                            icon={<Calendar className="w-3 h-3" />}
                          />
                          <DetailItem
                            label="Tags"
                            value={m.perk_tags.length ? `${m.perk_tags.length}` : '—'}
                            icon={<Tag className="w-3 h-3" />}
                          />
                        </div>

                        {m.perk_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {m.perk_tags.slice(0, 8).map(t => (
                              <span key={t} className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        )}

                        <div className="pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Perks on this card ({cardPerks.length})
                          </p>
                          {cardPerks.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No perks yet — they'll appear automatically as we discover them.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {cardPerks.slice(0, 6).map(p => (
                                <li key={p.id} className="flex items-start justify-between gap-2 text-xs bg-white rounded-xl px-3 py-2 border border-slate-100">
                                  <span className="text-slate-700 font-medium leading-snug">{p.title}</span>
                                  <span className="text-emerald-600 font-bold text-[11px] whitespace-nowrap">{p.value_label}</span>
                                </li>
                              ))}
                              {cardPerks.length > 6 && (
                                <li className="text-[11px] text-slate-400 text-center pt-1">+{cardPerks.length - 6} more</li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Edit form */}
                <AnimatePresence initial={false}>
                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <div className="p-4 space-y-3 bg-slate-50/60">
                        <Field label="Name">
                          <Input
                            value={form.name ?? ''}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="h-10 rounded-xl bg-white border-slate-200 text-sm"
                          />
                        </Field>
                        <Field label="Tier">
                          <Input
                            value={(form.tier as string) ?? ''}
                            onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
                            placeholder="Reserve, Platinum, Gold…"
                            className="h-10 rounded-xl bg-white border-slate-200 text-sm"
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Category">
                            <select
                              value={form.category}
                              onChange={e => setForm(f => ({ ...f, category: e.target.value as Membership['category'] }))}
                              className="w-full h-10 rounded-xl bg-white border border-slate-200 text-sm px-3 capitalize"
                            >
                              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </Field>
                          <Field label="Pillar">
                            <select
                              value={form.pillar}
                              onChange={e => setForm(f => ({ ...f, pillar: e.target.value as Membership['pillar'] }))}
                              className="w-full h-10 rounded-xl bg-white border border-slate-200 text-sm px-3 capitalize"
                            >
                              {PILLAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </Field>
                        </div>
                        <Field label="Renewal date">
                          <Input
                            type="date"
                            value={form.renewal_date ?? ''}
                            onChange={e => setForm(f => ({ ...f, renewal_date: e.target.value || null }))}
                            className="h-10 rounded-xl bg-white border-slate-200 text-sm"
                          />
                        </Field>
                        <Field label="Card color">
                          <div className="flex gap-2 flex-wrap">
                            {BRAND_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, brand_color: c }))}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${form.brand_color === c ? 'border-slate-900 scale-110' : 'border-white'}`}
                                style={{ backgroundColor: c, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
                              />
                            ))}
                          </div>
                        </Field>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={cancelEdit}
                            disabled={busy}
                            className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(m.id)}
                            disabled={busy}
                            className="flex-1 h-10 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-5"
            onClick={() => !busy && setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Remove this card?</h3>
              <p className="text-sm text-slate-500 mb-5">
                This will delete the card and all linked perks from your wallet. This can't be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  disabled={busy}
                  className="flex-1 h-11 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  disabled={busy}
                  className="flex-1 h-11 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={onChanged} />
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">{label}</label>
    {children}
  </div>
);

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="bg-white rounded-xl px-3 py-2 border border-slate-100">
    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 flex items-center gap-1">
      {icon}{label}
    </p>
    <p className="text-xs font-semibold text-slate-700 capitalize truncate">{value}</p>
  </div>
);

export default VaultView;
