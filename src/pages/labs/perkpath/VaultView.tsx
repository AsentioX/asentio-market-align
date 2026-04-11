import { useState } from 'react';
import { Wallet, CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Membership } from './perkData';

interface Props {
  memberships: Membership[];
}

const VaultView = ({ memberships }: Props) => {
  const [flipped, setFlipped] = useState<string | null>(null);

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
          <Wallet className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">No Memberships Yet</h2>
        <p className="text-sm text-slate-500">Go to Discover and add your first membership.</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-4">
      <h2 className="text-sm font-bold text-slate-900 mb-4">Your Memberships</h2>
      <div className="flex flex-col gap-4">
        {memberships.map(m => (
          <div key={m.id}>
            <AnimatePresence mode="wait">
              {flipped === m.id ? (
                <motion.div
                  key="back"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl p-6 text-white relative overflow-hidden min-h-[180px] flex flex-col justify-between"
                  style={{ backgroundColor: m.brandColor }}
                >
                  <button onClick={() => setFlipped(null)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-1">Member ID</p>
                    <p className="text-lg font-mono font-bold tracking-wider">{m.memberId}</p>
                  </div>
                  <div className="mt-4">
                    <div className="w-full h-12 bg-white/20 rounded-xl flex items-center justify-center gap-2">
                      <div className="flex gap-[2px]">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div key={i} className="w-[2px] bg-white/80 rounded-full" style={{ height: `${12 + Math.random() * 20}px` }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-white/50 text-center mt-1.5">Scan at checkout</p>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="front"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setFlipped(m.id)}
                  className="w-full rounded-3xl p-6 text-white text-left relative overflow-hidden min-h-[140px] active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: m.brandColor }}
                >
                  <div className="absolute top-4 right-4 text-3xl">{m.logo}</div>
                  <div className="flex flex-col justify-end h-full">
                    <p className="text-lg font-bold">{m.name}</p>
                    <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Tap to view ID & barcode
                    </p>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaultView;
