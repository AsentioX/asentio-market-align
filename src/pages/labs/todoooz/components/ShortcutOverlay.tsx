import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const SHORTCUTS: { group: string; items: [string, string][] }[] = [
  {
    group: 'Navigate',
    items: [
      ['↑ ↓ ← → / h j k l', 'Move focus between cards'],
      ['Tab / Shift+Tab', 'Jump between matrix cells'],
      ['G then T', 'Jump to the Today column'],
      ['/', 'Focus search'],
    ],
  },
  {
    group: 'Cards',
    items: [
      ['Enter', 'Open the detail drawer'],
      ['Esc', 'Close drawer or overlay'],
      ['[ / ]', 'Cycle drawer tabs'],
      ['E', 'Rename the focused card'],
      ['N', 'New card in the focused cell'],
      ['Shift+N', 'New sub-task under the focused card'],
      ['Space', 'Toggle complete'],
      ['X', 'Collapse / expand sub-tasks'],
      ['Delete / Backspace', 'Delete card (with confirm)'],
    ],
  },
  {
    group: 'Move & classify',
    items: [
      ['Shift + arrows', 'Move the focused card between cells'],
      ['1 – 4', 'Set priority row'],
      ['Q W R T', 'Set time column'],
      ['C then a color key', 'Open the color picker'],
    ],
  },
  {
    group: 'Workspace',
    items: [
      ['M', 'Toggle Work / Personal mode'],
      ['C', 'Toggle the calendar sidebar'],
      ['A', 'Toggle the Chief of Staff'],
      ['?', 'This cheat sheet'],
    ],
  },
];

const ShortcutOverlay: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({ open, onOpenChange }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl border-white/10 bg-slate-900/95 text-white backdrop-blur-xl">
      <DialogHeader>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
      </DialogHeader>
      <div className="grid gap-5 sm:grid-cols-2">
        {SHORTCUTS.map((g) => (
          <div key={g.group}>
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">{g.group}</div>
            <ul className="space-y-1.5">
              {g.items.map(([k, d]) => (
                <li key={k} className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-white/60">{d}</span>
                  <kbd className="shrink-0 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
                    {k}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default ShortcutOverlay;
