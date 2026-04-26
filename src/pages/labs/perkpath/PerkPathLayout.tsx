import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, X, Wallet, Home, LogOut, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerkPathAuth } from '@/hooks/usePerkPathAuth';
import { usePerkPath, type Perk } from '@/hooks/usePerkPath';
import { useGeolocation } from '@/hooks/useGeolocation';
import { searchPerks } from './searchEngine';
import PerkPathLogin from './PerkPathLogin';
import BrowseList from './BrowseList';
import RenewalSentinel from './RenewalSentinel';
import SearchResult from './SearchResult';
import NearbyNow from './NearbyNow';
import VaultView from './VaultView';
import SettingsView from './SettingsView';
import PurchaseView from './PurchaseView';
import PerkDrawer from './PerkDrawer';
import type { Membership } from './perkData';

const PerkPathLayout = () => {
  const { user, loading: authLoading, signOut, perkpathUser } = usePerkPathAuth();
  const { memberships, perks, venues, loading } = usePerkPath();
  const geo = useGeolocation();
  const [tab, setTab] = useState<'home' | 'purchase' | 'vault' | 'settings'>('home');
  const [searchValue, setSearchValue] = useState('');
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const searchResult = useMemo(() => searchValue.trim() ? searchPerks(perks, searchValue) : null, [perks, searchValue]);
  const perksByPillar = useMemo(() => {
    const groups: Record<Pillar, Perk[]> = { work: [], home: [], play: [] };
    perks.forEach(p => {
      const pillar = p.membership?.pillar ?? 'home';
      groups[pillar].push(p);
    });
    return groups;
  }, [perks]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <PerkPathLogin />;

  const handlePerkTap = (perk: Perk) => { setSelectedPerk(perk); setDrawerOpen(true); };

  // Adapter: VaultView expects legacy Membership shape
  const vaultMemberships: Membership[] = memberships.map(m => ({
    id: m.id, name: m.name, brandColor: m.brand_color,
    memberId: m.tier ? `${m.tier} member` : 'Member',
    logo: m.logo,
  }));

  // Adapter for PerkDrawer (legacy Perk shape)
  const drawerPerk = selectedPerk ? {
    id: selectedPerk.id,
    membershipId: selectedPerk.membership_id,
    membershipName: selectedPerk.membership?.name ?? '',
    brandColor: selectedPerk.membership?.brand_color ?? '#10b981',
    title: selectedPerk.title,
    value: selectedPerk.value_label,
    category: 'shopping' as const,
    image: selectedPerk.image_url ?? '',
    distance: '—',
    venue: selectedPerk.venue ?? '',
    howToRedeem: selectedPerk.how_to_redeem ?? '',
  } : null;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-white relative">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-100 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <Link to="/labs" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">PerkPath</h1>
            <button onClick={signOut} className="text-slate-400 hover:text-rose-600 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          {perkpathUser?.display_name && (
            <p className="text-[11px] text-slate-400 text-center -mt-0.5">Hi, {perkpathUser.display_name}</p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            {tab === 'home' ? (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {/* Universal Search */}
                <div className="px-5 pt-4 pb-2">
                  <form onSubmit={(e) => e.preventDefault()} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      placeholder="Search merchants (Hertz, hotels, dining…)"
                      className="pl-11 pr-4 h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-emerald-500"
                    />
                    {searchValue && (
                      <button type="button" onClick={() => setSearchValue('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                  </form>
                </div>

                {searchValue.trim() && (
                  <SearchResult query={searchValue} result={searchResult} onPerkTap={handlePerkTap} onClose={() => setSearchValue('')} />
                )}

                {!searchValue.trim() && (
                  <>
                    <RenewalSentinel memberships={memberships} />
                    <NearbyNow
                      coords={geo.coords}
                      status={geo.status}
                      perks={perks}
                      venues={venues}
                      onRequest={geo.request}
                      onPerkTap={handlePerkTap}
                    />
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
                        <p className="text-sm font-medium text-slate-500">Loading your perks…</p>
                      </div>
                    ) : memberships.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mb-5">
                          <Wallet className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Your Wallet is Empty</h2>
                        <p className="text-sm text-slate-500">Memberships will appear here once added.</p>
                      </div>
                    ) : (
                      <BrowseList perks={perks} memberships={memberships} onPerkTap={handlePerkTap} />

                    )}
                  </>
                )}
              </motion.div>
            ) : tab === 'purchase' ? (
              <motion.div key="purchase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <PurchaseView />
              </motion.div>
            ) : tab === 'vault' ? (
              <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <VaultView memberships={vaultMemberships} />
              </motion.div>
            ) : (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-slate-100 flex z-40">
          <button onClick={() => setTab('home')} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Discover</span>
          </button>
          <button onClick={() => setTab('purchase')} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === 'purchase' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Purchase</span>
          </button>
          <button onClick={() => setTab('vault')} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === 'vault' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Wallet</span>
          </button>
          <button onClick={() => setTab('settings')} className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${tab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Settings</span>
          </button>
        </nav>

        <PerkDrawer perk={drawerPerk} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
};

export default PerkPathLayout;
