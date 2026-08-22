import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  id: string;
  title: string;
  /** Optional right-side hint (counts, progress, etc.) */
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const storageKey = (id: string) => `tdz.section.${id}`;

/** Expand/collapse wrapper whose open state is remembered per section. */
const CollapsibleSection: React.FC<Props> = ({ id, title, meta, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(id));
    if (stored !== null) setOpen(stored === '1');
  }, [id]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      localStorage.setItem(storageKey(id), prev ? '0' : '1');
      return !prev;
    });
  }, [id]);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/45">{title}</span>
        <span className="flex items-center gap-2 text-[10px] text-white/35">
          {meta}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? '' : '-rotate-90'}`} />
        </span>
      </button>
      {open && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </section>
  );
};

export default CollapsibleSection;
