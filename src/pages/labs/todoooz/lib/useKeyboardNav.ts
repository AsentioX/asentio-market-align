import { useCallback, useEffect, useRef } from 'react';
import { BUCKETS, PRIORITIES, sortCards } from './matrix';
import type { TdzBucket, TdzCard, TdzPriority } from './types';

interface Args {
  cards: TdzCard[];
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  drawerOpen: boolean;
  actions: {
    open: (id: string) => void;
    closeDrawer: () => void;
    cycleTab: (dir: 1 | -1) => void;
    rename: (id: string) => void;
    newCard: (bucket: TdzBucket, priority: TdzPriority) => void;
    newSub: (parentId: string) => void;
    move: (id: string, patch: Partial<TdzCard>) => void;
    toggleDone: (id: string) => void;
    toggleCollapse: (id: string) => void;
    remove: (id: string) => void;
    toggleMode: () => void;
    toggleCalendar: () => void;
    toggleAssistant: () => void;
    toggleHelp: () => void;
    focusSearch: () => void;
    jumpToday: () => void;
  };
}

const isTyping = (el: EventTarget | null) => {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
};

export const useKeyboardNav = ({ cards, focusedId, setFocusedId, drawerOpen, actions }: Args) => {
  const pending = useRef<string | null>(null);
  const a = useRef(actions);
  a.current = actions;

  const cellOf = useCallback(
    (card: TdzCard) => ({
      col: BUCKETS.findIndex((b) => b.key === card.time_bucket),
      row: PRIORITIES.findIndex((p) => p.key === card.priority),
    }),
    [],
  );

  const focusCell = useCallback(
    (col: number, row: number) => {
      const c = Math.min(Math.max(col, 0), BUCKETS.length - 1);
      const r = Math.min(Math.max(row, 0), PRIORITIES.length - 1);
      const list = sortCards(
        cards.filter((x) => x.time_bucket === BUCKETS[c].key && x.priority === PRIORITIES[r].key),
      );
      if (list.length) setFocusedId(list[0].id);
    },
    [cards, setFocusedId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
        return;
      }
      const key = e.key;
      const card = cards.find((c) => c.id === focusedId) ?? null;

      if (pending.current === 'g') {
        pending.current = null;
        if (key.toLowerCase() === 't') {
          e.preventDefault();
          a.current.jumpToday();
          return;
        }
      }

      if (key === '?') return e.preventDefault(), a.current.toggleHelp();
      if (key === 'Escape') return a.current.closeDrawer();
      if (key === '/') return e.preventDefault(), a.current.focusSearch();

      if (drawerOpen) {
        if (key === '[') return e.preventDefault(), a.current.cycleTab(-1);
        if (key === ']') return e.preventDefault(), a.current.cycleTab(1);
        return;
      }

      const dir: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        h: [-1, 0],
        l: [1, 0],
        k: [0, -1],
        j: [0, 1],
      };

      if (dir[key]) {
        e.preventDefault();
        const [dx, dy] = dir[key];
        if (!card) return focusCell(0, 0);
        const { col, row } = cellOf(card);
        if (e.shiftKey) {
          const nb = BUCKETS[Math.min(Math.max(col + dx, 0), BUCKETS.length - 1)].key;
          const np = PRIORITIES[Math.min(Math.max(row + dy, 0), PRIORITIES.length - 1)].key;
          a.current.move(card.id, { time_bucket: nb, priority: np });
        } else {
          const siblings = sortCards(
            cards.filter((x) => x.time_bucket === card.time_bucket && x.priority === card.priority),
          );
          const idx = siblings.findIndex((x) => x.id === card.id);
          if (dy !== 0 && siblings[idx + dy]) setFocusedId(siblings[idx + dy].id);
          else focusCell(col + dx, row + dy);
        }
        return;
      }

      switch (key) {
        case 'g':
        case 'G':
          pending.current = 'g';
          return;
        case 'Enter':
          if (card) e.preventDefault(), a.current.open(card.id);
          return;
        case 'e':
        case 'E':
          if (card) e.preventDefault(), a.current.rename(card.id);
          return;
        case 'n':
        case 'N':
          e.preventDefault();
          if (e.shiftKey && card) a.current.newSub(card.id);
          else a.current.newCard(card?.time_bucket ?? 'today', card?.priority ?? 'core');
          return;
        case ' ':
          if (card) e.preventDefault(), a.current.toggleDone(card.id);
          return;
        case 'x':
        case 'X':
          if (card) e.preventDefault(), a.current.toggleCollapse(card.id);
          return;
        case 'Delete':
        case 'Backspace':
          if (card) e.preventDefault(), a.current.remove(card.id);
          return;
        case 'm':
        case 'M':
          e.preventDefault();
          return a.current.toggleMode();
        case 'c':
        case 'C':
          e.preventDefault();
          return a.current.toggleCalendar();
        case 'a':
        case 'A':
          e.preventDefault();
          return a.current.toggleAssistant();
        default:
          break;
      }

      if (card && ['1', '2', '3', '4'].includes(key)) {
        e.preventDefault();
        a.current.move(card.id, { priority: PRIORITIES[Number(key) - 1].key });
        return;
      }
      const colKeys: Record<string, number> = { q: 0, w: 1, r: 2, t: 3 };
      if (card && colKeys[key.toLowerCase()] !== undefined) {
        e.preventDefault();
        a.current.move(card.id, { time_bucket: BUCKETS[colKeys[key.toLowerCase()]].key });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cards, focusedId, drawerOpen, cellOf, focusCell, setFocusedId]);
};
