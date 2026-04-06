import { useState } from 'react';
import { Ruler, Weight, Heart, User, Pencil, Check, X, Star, Dumbbell } from 'lucide-react';
import { mockUser } from './mockData';
import { useWOBuddyProfile } from '@/hooks/useWOBuddy';

const ProfilePage = () => {
  const { profile, updateProfile, isAuthenticated } = useWOBuddyProfile();
  const [editingProfile, setEditingProfile] = useState(false);
  const [draft, setDraft] = useState({ ...profile });

  const getAge = (bd: string) => {
    const diff = Date.now() - new Date(bd).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const saveProfile = () => {
    updateProfile({ ...draft });
    setEditingProfile(false);
  };
  const cancelEdit = () => {
    setDraft({ ...profile });
    setEditingProfile(false);
  };

  return (
    <div className="space-y-6">
      {/* Avatar + name */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600/30 via-emerald-500/10 to-transparent p-6 pt-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-3xl font-bold shadow-xl shadow-emerald-500/20 border-2 border-emerald-400/30">
              {mockUser.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold">{mockUser.name}</h2>
              <p className="text-xs text-white/40">Member since {mockUser.memberSince}</p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/20">Level {mockUser.level}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-medium border border-amber-500/20">🔥 {mockUser.weeklyStreak}w streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body Metrics */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-2xl p-4 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">Body Metrics</span>
          </div>
          {!editingProfile ? (
            <button onClick={() => { setDraft({ ...profile }); setEditingProfile(true); }} className="text-white/40 hover:text-white transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="text-white/40 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
              <button onClick={saveProfile} className="text-white/40 hover:text-emerald-400 transition-colors"><Check className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {!editingProfile ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: <Ruler className="w-3.5 h-3.5 text-blue-400" />, label: 'Height', value: `${profile.height} cm`, bg: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/10' },
              { icon: <Weight className="w-3.5 h-3.5 text-green-400" />, label: 'Weight', value: `${profile.weight} kg`, bg: 'from-green-500/15 to-green-600/5', border: 'border-green-500/10' },
              { icon: <Star className="w-3.5 h-3.5 text-amber-400" />, label: 'Goal Weight', value: `${profile.goalWeight} kg`, bg: 'from-amber-500/15 to-amber-600/5', border: 'border-amber-500/10' },
              { icon: <Heart className="w-3.5 h-3.5 text-rose-400" />, label: 'Resting HR', value: `${profile.restingHR} bpm`, bg: 'from-rose-500/15 to-rose-600/5', border: 'border-rose-500/10', measured: true },
              { icon: <User className="w-3.5 h-3.5 text-violet-400" />, label: 'Age / Gender', value: `${getAge(profile.birthdate)} · ${profile.gender}`, bg: 'from-violet-500/15 to-violet-600/5', border: 'border-violet-500/10' },
              { icon: <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />, label: 'Body Fat', value: `${profile.bodyFat}%`, bg: 'from-cyan-500/15 to-cyan-600/5', border: 'border-cyan-500/10', measured: true },
              { icon: <User className="w-3.5 h-3.5 text-pink-400" />, label: 'Ethnicity', value: profile.ethnicity, bg: 'from-pink-500/15 to-pink-600/5', border: 'border-pink-500/10' },
            ].map((m, i) => (
              <div key={i} className={`bg-gradient-to-b ${m.bg} rounded-xl p-3 border ${m.border}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {m.icon}<span className="text-[10px] text-white/40">{m.label}</span>
                  {'measured' in m && m.measured && (
                    <span className="text-[8px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded-full ml-auto">measured</span>
                  )}
                </div>
                <p className="text-sm font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Height (cm)', key: 'height' as const, type: 'number' },
              { label: 'Weight (kg)', key: 'weight' as const, type: 'number' },
              { label: 'Goal Weight (kg)', key: 'goalWeight' as const, type: 'number' },
            ].map((field) => (
              <div key={field.key} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                <label className="text-[10px] text-white/40 block mb-1">{field.label}</label>
                <input
                  type="number"
                  value={draft[field.key]}
                  onChange={(e) => setDraft(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="w-full bg-transparent text-sm font-semibold outline-none border-b border-white/10 focus:border-emerald-400/50 pb-0.5 transition-colors"
                />
              </div>
            ))}
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
              <label className="text-[10px] text-white/40 block mb-1">Birthdate</label>
              <input
                type="date"
                value={draft.birthdate}
                onChange={(e) => setDraft(prev => ({ ...prev, birthdate: e.target.value }))}
                className="w-full bg-transparent text-sm font-semibold outline-none border-b border-white/10 focus:border-emerald-400/50 pb-0.5 transition-colors [color-scheme:dark]"
              />
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] col-span-2">
              <label className="text-[10px] text-white/40 block mb-1">Gender</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} onClick={() => setDraft(prev => ({ ...prev, gender: g }))}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${draft.gender === g ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/[0.06] text-white/40'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] col-span-2">
              <label className="text-[10px] text-white/40 block mb-1">Ethnicity</label>
              <div className="flex gap-2 flex-wrap">
                {['Asian', 'Black', 'Hispanic', 'White', 'Mixed', 'Other'].map(e => (
                  <button key={e} onClick={() => setDraft(prev => ({ ...prev, ethnicity: e }))}
                    className={`text-xs py-1.5 px-3 rounded-lg border transition-all ${draft.ethnicity === e ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.02] border-white/[0.06] text-white/40'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 bg-white/[0.02] rounded-xl p-3 border border-dashed border-white/[0.06]">
              <p className="text-[10px] text-white/30 text-center">💡 Resting HR and Body Fat % are measured from your wearable device and cannot be edited manually.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
