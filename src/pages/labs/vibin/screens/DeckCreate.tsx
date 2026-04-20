import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { toast } from 'sonner';
import type { Duration } from '../types';

const DeckCreate = () => {
  const nav = useNavigate();
  const { cards, addDeck } = useVibin();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<Duration>('full-day');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const save = () => {
    if (!title.trim()) { toast.error('Give your deck a title'); return; }
    if (selected.length === 0) { toast.error('Pick at least one card'); return; }
    const cover = cards.find((c) => c.id === selected[0])?.image;
    const deck = addDeck({
      title, description: description || 'A vibe worth sharing.',
      duration, cardIds: selected, coverImage: cover, authorName: 'You',
    });
    toast.success('Deck created');
    nav(`/labs/vibin/decks/${deck.id}`);
  };

  return (
    <div>
      <header className="sticky top-0 z-30 px-5 pt-12 pb-3 bg-[hsl(20_30%_98%)]/95 backdrop-blur-md flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-[hsl(240_15%_15%)]" />
        </button>
        <h1 className="font-bold text-[hsl(240_15%_10%)]">New deck</h1>
        <button
          onClick={save}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(345_95%_60%)] to-[hsl(280_90%_55%)] text-white text-sm font-semibold shadow-md active:scale-95"
        >
          Create
        </button>
      </header>

      <div className="px-5 py-4 space-y-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Deck title — '1 Day in SF'"
          className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-base font-semibold outline-none focus:border-[hsl(345_95%_60%)]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's the story?"
          rows={2}
          className="w-full px-4 py-3 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-sm outline-none focus:border-[hsl(345_95%_60%)] resize-none"
        />

        <div>
          <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider mb-2">Duration</p>
          <div className="grid grid-cols-4 gap-2">
            {(['3hrs', 'half-day', 'full-day', 'multi-day'] as Duration[]).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-2.5 rounded-xl text-xs font-semibold ${
                  duration === d ? 'bg-[hsl(240_15%_10%)] text-white' : 'bg-white border border-[hsl(240_15%_92%)] text-[hsl(240_15%_25%)]'
                }`}
              >
                {d === '3hrs' ? '3 hrs' : d === 'half-day' ? 'Half' : d === 'full-day' ? 'Full' : 'Multi'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[hsl(240_8%_55%)] uppercase tracking-wider">Pick cards</p>
            <p className="text-xs font-semibold text-[hsl(345_95%_60%)]">{selected.length} selected</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cards.map((c) => {
              const sel = selected.includes(c.id);
              const order = selected.indexOf(c.id) + 1;
              return (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className={`relative h-32 rounded-2xl overflow-hidden text-left active:scale-95 transition-all ${sel ? 'ring-2 ring-[hsl(345_95%_60%)]' : ''}`}
                >
                  <img src={c.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${sel ? 'bg-gradient-to-t from-[hsl(345_95%_60%)]/60 to-transparent' : 'bg-gradient-to-t from-black/80 to-transparent'}`} />
                  <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-bold leading-tight">{c.title}</p>
                  {sel && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-[hsl(345_95%_60%)] font-bold text-xs flex items-center justify-center shadow-lg">
                      {order}
                    </div>
                  )}
                  {!sel && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckCreate;
