import { useMemo, useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { listTrades } from '../tradeLabels';

export function TradeLegendModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const trades = useMemo(() => listTrades(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter(
      (t) => t.code.toLowerCase().includes(q) || t.label.toLowerCase().includes(q),
    );
  }, [query, trades]);

  // Group by letter prefix (A, B, C, D, special)
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const t of filtered) {
      const prefix = t.code.match(/^[A-Z]+/)?.[0] ?? 'Other';
      const key =
        prefix === 'A' ? 'Class A — General Engineering'
        : prefix === 'B' ? 'Class B — General Building'
        : prefix === 'C' ? 'Class C — Specialty'
        : prefix === 'D' ? 'Class D — Limited Specialty'
        : 'Certifications';
      (groups[key] ??= []).push(t);
    }
    return groups;
  }, [filtered]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        style={{ background: 'hsl(var(--cf-surface))', border: '1px solid hsl(var(--cf-border))' }}
      >
        {/* Header */}
        <div
          className="p-5 flex items-start justify-between gap-4 shrink-0"
          style={{ borderBottom: '1px solid hsl(var(--cf-border))' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'hsl(var(--cf-primary-soft))', color: 'hsl(var(--cf-primary))' }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base">CSLB Contractor Trade Codes</h2>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--cf-text-muted))' }}>
                California State License Board classifications. {trades.length} codes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[hsl(var(--cf-surface-alt))]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0" style={{ borderBottom: '1px solid hsl(var(--cf-border))' }}>
          <div className="relative">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'hsl(var(--cf-text-subtle))' }}
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code (C-10) or trade (electrical)…"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-md outline-none"
              style={{
                background: 'hsl(var(--cf-surface-alt))',
                border: '1px solid hsl(var(--cf-border))',
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center text-sm py-12" style={{ color: 'hsl(var(--cf-text-muted))' }}>
              No matches for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName}>
                <h3
                  className="text-[11px] font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'hsl(var(--cf-text-subtle))' }}
                >
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {items.map((t) => (
                    <div
                      key={t.code}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs"
                      style={{ background: 'hsl(var(--cf-surface-alt))' }}
                    >
                      <span
                        className="font-mono font-bold tabular-nums shrink-0 px-1.5 py-0.5 rounded text-[11px]"
                        style={{
                          background: 'hsl(var(--cf-primary-soft))',
                          color: 'hsl(var(--cf-primary))',
                          minWidth: '3rem',
                          textAlign: 'center',
                        }}
                      >
                        {t.code}
                      </span>
                      <span className="truncate">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="p-3 text-[11px] text-center shrink-0"
          style={{
            borderTop: '1px solid hsl(var(--cf-border))',
            color: 'hsl(var(--cf-text-subtle))',
          }}
        >
          Source: California Contractors State License Board (CSLB)
        </div>
      </div>
    </div>
  );
}
