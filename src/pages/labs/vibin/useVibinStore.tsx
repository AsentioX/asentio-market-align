import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { VibinState, VibinCard, Deck, Trip } from './types';
import { seedState } from './seedData';

const KEY = 'vibin-state-v1';

interface Ctx extends VibinState {
  addCard: (c: Omit<VibinCard, 'id' | 'createdAt'>) => VibinCard;
  updateCard: (id: string, patch: Partial<VibinCard>) => void;
  deleteCard: (id: string) => void;
  toggleLike: (id: string) => void;
  addDeck: (d: Omit<Deck, 'id' | 'createdAt'>) => Deck;
  updateDeck: (id: string, patch: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  addTrip: (t: Omit<Trip, 'id' | 'createdAt'>) => Trip;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  resetSeed: () => void;
}

const VibinCtx = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export const VibinProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<VibinState>(() => {
    if (typeof window === 'undefined') return seedState;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seedState;
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const addCard: Ctx['addCard'] = useCallback((c) => {
    const card: VibinCard = { ...c, id: 'c-' + uid(), createdAt: Date.now() };
    setState((s) => ({ ...s, cards: [card, ...s.cards] }));
    return card;
  }, []);
  const updateCard: Ctx['updateCard'] = useCallback((id, patch) => {
    setState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);
  const deleteCard: Ctx['deleteCard'] = useCallback((id) => {
    setState((s) => ({
      ...s,
      cards: s.cards.filter((c) => c.id !== id),
      decks: s.decks.map((d) => ({
        ...d,
        cardIds: d.cardIds.filter((x) => x !== id),
        optionalCardIds: d.optionalCardIds?.filter((x) => x !== id),
      })),
    }));
  }, []);
  const toggleLike: Ctx['toggleLike'] = useCallback((id) => {
    setState((s) => ({ ...s, cards: s.cards.map((c) => (c.id === id ? { ...c, liked: !c.liked } : c)) }));
  }, []);
  const addDeck: Ctx['addDeck'] = useCallback((d) => {
    const deck: Deck = { ...d, id: 'd-' + uid(), createdAt: Date.now() };
    setState((s) => ({ ...s, decks: [deck, ...s.decks] }));
    return deck;
  }, []);
  const updateDeck: Ctx['updateDeck'] = useCallback((id, patch) => {
    setState((s) => ({ ...s, decks: s.decks.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  }, []);
  const deleteDeck: Ctx['deleteDeck'] = useCallback((id) => {
    setState((s) => ({ ...s, decks: s.decks.filter((d) => d.id !== id) }));
  }, []);
  const addTrip: Ctx['addTrip'] = useCallback((t) => {
    const trip: Trip = { ...t, id: 't-' + uid(), createdAt: Date.now() };
    setState((s) => ({ ...s, trips: [trip, ...s.trips] }));
    return trip;
  }, []);
  const updateTrip: Ctx['updateTrip'] = useCallback((id, patch) => {
    setState((s) => ({ ...s, trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);
  const deleteTrip: Ctx['deleteTrip'] = useCallback((id) => {
    setState((s) => ({ ...s, trips: s.trips.filter((t) => t.id !== id) }));
  }, []);
  const resetSeed = useCallback(() => setState(seedState), []);

  return (
    <VibinCtx.Provider value={{
      ...state,
      addCard, updateCard, deleteCard, toggleLike,
      addDeck, updateDeck, deleteDeck,
      addTrip, updateTrip, deleteTrip, resetSeed,
    }}>
      {children}
    </VibinCtx.Provider>
  );
};

export const useVibin = () => {
  const ctx = useContext(VibinCtx);
  if (!ctx) throw new Error('useVibin must be used within VibinProvider');
  return ctx;
};
