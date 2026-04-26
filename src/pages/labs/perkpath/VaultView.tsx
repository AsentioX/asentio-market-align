import { useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import AddCardModal from './AddCardModal';

interface VaultMembership {
  id: string;
  name: string;
  tier: string | null;
  brandColor: string;
  logo: string;
  memberId: string;
  cardImageUrl?: string | null;
  cardType?: string | null;
}

interface Props {
  memberships: VaultMembership[];
  onChanged: () => void;
}

const VaultView = ({ memberships, onChanged }: Props) => {
  const [addOpen, setAddOpen] = useState(false);

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
          {memberships.map(m => (
            <div
              key={m.id}
              className="w-full rounded-3xl text-white text-left relative overflow-hidden min-h-[140px]"
              style={{ backgroundColor: m.brandColor }}
            >
              {m.cardImageUrl ? (
                <>
                  <img src={m.cardImageUrl} alt={m.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </>
              ) : null}
              <div className="relative p-6 flex flex-col justify-end h-full min-h-[140px]">
                <div className="absolute top-4 right-4 text-3xl">{m.logo}</div>
                <p className="text-lg font-bold drop-shadow">{m.name}</p>
                {m.tier && <p className="text-xs text-white/80 font-semibold drop-shadow">{m.tier}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={onChanged} />
    </div>
  );
};

export default VaultView;
