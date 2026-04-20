import { useNavigate } from 'react-router-dom';
import { Settings, Heart, Share2, RefreshCw, Sparkles, Layers, Map as MapIcon } from 'lucide-react';
import { useVibin } from '../useVibinStore';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, cards, decks, trips, resetSeed } = useVibin();
  const nav = useNavigate();
  const liked = cards.filter((c) => c.liked).length;

  return (
    <div>
      <header className="px-5 pt-12 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[hsl(240_15%_10%)]">Profile</h1>
        <button onClick={() => nav('/labs/vibin/onboarding')} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <Settings className="w-5 h-5 text-[hsl(240_15%_25%)]" />
        </button>
      </header>

      <div className="px-5">
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[hsl(345_95%_60%)] via-[hsl(280_90%_55%)] to-[hsl(220_95%_55%)] text-white overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <img src={profile.avatar} alt="" className="w-20 h-20 rounded-full border-4 border-white/40 object-cover" />
            <div>
              <p className="text-xl font-bold">{profile.name}</p>
              <p className="text-sm text-white/85">{profile.handle}</p>
            </div>
          </div>
          <p className="relative text-sm text-white/90 mt-4 italic">"{profile.bio}"</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat n={cards.length} label="Cards" icon={Sparkles} />
          <Stat n={decks.length} label="Decks" icon={Layers} />
          <Stat n={trips.length} label="Trips" icon={MapIcon} />
        </div>

        <div className="mt-5 space-y-2">
          <Row label="Liked cards" value={`${liked}`} icon={Heart} onClick={() => nav('/labs/vibin/cards')} />
          <Row label="Share my profile" value="vibin.app/curator" icon={Share2} onClick={() => { navigator.clipboard?.writeText('https://vibin.app/curator'); toast.success('Profile link copied'); }} />
          <Row label="Import places" value="Get started" icon={Sparkles} onClick={() => nav('/labs/vibin/onboarding')} />
          <Row label="Reset to sample data" value="" icon={RefreshCw} onClick={() => { if (confirm('Reset all cards, decks, trips to sample data?')) { resetSeed(); toast.success('Reset complete'); }}} />
        </div>
      </div>
    </div>
  );
};

const Stat = ({ n, label, icon: Icon }: { n: number; label: string; icon: any }) => (
  <div className="p-4 rounded-2xl bg-white border border-[hsl(240_15%_92%)] text-center">
    <Icon className="w-4 h-4 mx-auto text-[hsl(345_95%_60%)]" />
    <p className="text-2xl font-bold text-[hsl(240_15%_10%)] mt-1">{n}</p>
    <p className="text-[10px] uppercase tracking-wider text-[hsl(240_8%_55%)] font-semibold">{label}</p>
  </div>
);

const Row = ({ label, value, icon: Icon, onClick }: { label: string; value: string; icon: any; onClick: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-[hsl(240_15%_92%)] active:scale-[0.99] transition-transform">
    <div className="w-9 h-9 rounded-xl bg-[hsl(240_15%_96%)] flex items-center justify-center">
      <Icon className="w-4 h-4 text-[hsl(240_15%_25%)]" />
    </div>
    <p className="flex-1 text-left text-sm font-semibold text-[hsl(240_15%_10%)]">{label}</p>
    {value && <p className="text-xs text-[hsl(240_8%_55%)]">{value}</p>}
  </button>
);

export default Profile;
