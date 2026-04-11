import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Car, Utensils, Plane, ShoppingBag, Heart, MapPin, Wallet, Home, X, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MEMBERSHIPS, MOCK_PERKS, CATEGORY_LABELS, type Perk, type Membership } from './perkData';
import PerkCard from './PerkCard';
import PerkDrawer from './PerkDrawer';
import VaultView from './VaultView';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Home },
  { key: 'auto', label: 'Auto', icon: Car },
  { key: 'dining', label: 'Dining', icon: Utensils },
  { key: 'travel', label: 'Travel', icon: Plane },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { key: 'health', label: 'Health', icon: Heart },
] as const;

const PerkPathLayout = () => {
  const [tab, setTab] = useState<'home' | 'vault'>('home');
  const [searchValue, setSearchValue] = useState('');
  const [activeMemberships, setActiveMemberships] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allPerks = activeMemberships.flatMap(id => MOCK_PERKS[id] || []);
  const filteredPerks = activeCategory === 'all'
    ? allPerks
    : allPerks.filter(p => p.category === activeCategory);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim().toLowerCase();
    if (!q) return;

    const match = Object.keys(MEMBERSHIPS).find(k =>
      MEMBERSHIPS[k].name.toLowerCase().includes(q)
    );

    if (!match) {
      toast.error('Membership not found. Try AAA, AARP, Chase, Costco, or Amex.');
      return;
    }

    if (activeMemberships.includes(match)) {
      toast.info(`${MEMBERSHIPS[match].name} is already in your vault.`);
      setSearchValue('');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setActiveMemberships(prev => [...prev, match]);
      setLoading(false);
      setSearchValue('');
      toast.success(`${MEMBERSHIPS[match].name} perks added to your vault!`);
    }, 2000);
  }, [searchValue, activeMemberships]);

  const handlePerkTap = (perk: Perk) => {
    setSelectedPerk(perk);
    setDrawerOpen(true);
  };

  const handleDemoMove = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎯 Perk Nearby!', { body: "You're at Denny's—use your AARP for 15% off." });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          new Notification('🎯 Perk Nearby!', { body: "You're at Denny's—use your AARP for 15% off." });
        } else {
          toast('🎯 Perk Nearby!', { description: "You're at Denny's—use your AARP for 15% off." });
        }
      });
    } else {
      toast('🎯 Perk Nearby!', { description: "You're at Denny's—use your AARP for 15% off." });
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-white relative">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <Link to="/labs" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">PerkPath</h1>
            <button onClick={handleDemoMove} className="text-slate-400 hover:text-emerald-600 transition-colors" title="Demo proximity alert">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            {tab === 'home' ? (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {/* Search */}
                <div className="px-5 pt-4 pb-2">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      placeholder="Add a membership (e.g., AAA, Chase, Costco)"
                      className="pl-11 pr-4 h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-emerald-500"
                      disabled={loading}
                    />
                    {searchValue && (
                      <button type="button" onClick={() => setSearchValue('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </form>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Fetching & Categorizing...</p>
                  </div>
                )}

                {/* Categories */}
                {!loading && activeMemberships.length > 0 && (
                  <div className="px-5 py-3">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.key;
                        return (
                          <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                              isActive
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Perk Grid */}
                {!loading && activeMemberships.length > 0 && (
                  <div className="px-5 pt-2 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-slate-900">
                        {activeCategory === 'all' ? 'All Perks' : CATEGORY_LABELS[activeCategory]}
                      </h2>
                      <span className="text-xs text-slate-400 font-medium">{filteredPerks.length} benefits</span>
                    </div>
                    <AnimatePresence mode="popLayout">
                      <motion.div layout className="flex flex-col gap-4">
                        {filteredPerks.map(perk => (
                          <motion.div
                            key={perk.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                          >
                            <PerkCard perk={perk} onTap={() => handlePerkTap(perk)} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                    {filteredPerks.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-8">No perks in this category yet.</p>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {!loading && activeMemberships.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mb-5">
                      <Wallet className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Your Perk Vault is Empty</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Search for a membership above to unlock savings. Try <span className="font-semibold text-slate-700">AAA</span>, <span className="font-semibold text-slate-700">Chase</span>, or <span className="font-semibold text-slate-700">Costco</span>.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <VaultView memberships={activeMemberships.map(id => MEMBERSHIPS[id])} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-slate-100 flex z-40">
          <button onClick={() => setTab('home')} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Discover</span>
          </button>
          <button onClick={() => setTab('vault')} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === 'vault' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Vault</span>
          </button>
        </nav>

        {/* Perk Drawer */}
        <PerkDrawer perk={selectedPerk} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
};

export default PerkPathLayout;
