import { useState, useRef, useCallback } from 'react';
import { Ruler, Weight, Heart, User, Pencil, Check, X, Star, Dumbbell, Camera, ImageIcon, Trash2 } from 'lucide-react';
import { mockUser } from './mockData';
import { useWOBuddyProfile } from '@/hooks/useWOBuddy';
import { useWOBuddyAuth } from '@/hooks/useWOBuddyAuth';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import AvatarCropModal from './AvatarCropModal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const ProfilePage = () => {
  const { profile, updateProfile, isAuthenticated } = useWOBuddyProfile();
  const { user, wobuddyUser } = useWOBuddyAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [draft, setDraft] = useState({ ...profile });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

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

  const displayName = wobuddyUser?.display_name || mockUser.name;

  const startEditingName = () => {
    setNameDraft(displayName);
    setEditingName(true);
  };

  const saveName = async () => {
    if (!wobuddyUser || !nameDraft.trim()) return;
    const { error } = await supabase
      .from('wobuddy_users')
      .update({ display_name: nameDraft.trim() })
      .eq('user_id', wobuddyUser.user_id);
    if (error) {
      toast.error('Failed to update name');
    } else {
      toast.success('Name updated!');
    }
    setEditingName(false);
  };

  const uploadImage = async (file: File, type: 'avatar' | 'background') => {
    if (!user) {
      toast.error('Sign in to upload images');
      return;
    }

    const setUploading = type === 'avatar' ? setUploadingAvatar : setUploadingBg;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${type}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('wobuddy-profiles')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wobuddy-profiles')
        .getPublicUrl(path);

      if (type === 'avatar') {
        updateProfile({ avatarUrl: publicUrl });
      } else {
        updateProfile({ backgroundUrl: publicUrl });
      }
      toast.success(`${type === 'avatar' ? 'Profile photo' : 'Background'} updated!`);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (type === 'avatar') {
      const reader = new FileReader();
      reader.onload = () => setCropImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      uploadImage(file, type);
    }
    e.target.value = '';
  };

  const handleCropDone = useCallback(async (blob: Blob) => {
    setCropImageSrc(null);
    const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await uploadImage(file, 'avatar');
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'avatar')} />
      <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'background')} />

      {/* Avatar + name */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Background image / gradient */}
        <div className="relative">
          {profile.backgroundUrl ? (
            <div className="absolute inset-0">
              <img src={profile.backgroundUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#0a0a0f]" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-emerald-500/10 to-transparent" />
          )}

          {/* Background edit button */}
          <button
            onClick={() => bgInputRef.current?.click()}
            disabled={uploadingBg}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all"
          >
            {uploadingBg ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>

          <div className="relative p-6 pt-8">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Avatar with edit overlay */}
              <div className="relative group">
                {profile.avatarUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl shadow-emerald-500/20 border-2 border-emerald-400/30">
                    <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-3xl font-bold shadow-xl shadow-emerald-500/20 border-2 border-emerald-400/30">
                    {mockUser.avatar}
                  </div>
                )}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  {uploadingAvatar ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      className="bg-transparent text-xl font-bold text-center outline-none border-b border-emerald-400/50 w-40"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                    />
                    <button onClick={saveName} className="text-emerald-400 hover:text-emerald-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingName(false)} className="text-white/40 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <h2 className="text-xl font-bold group/name cursor-pointer" onClick={startEditingName}>
                    {displayName}
                    <Pencil className="w-3 h-3 inline ml-1.5 opacity-0 group-hover/name:opacity-60 transition-opacity" />
                  </h2>
                )}
                <p className="text-xs text-white/40">Member since {mockUser.memberSince}</p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/20">Level {mockUser.level}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-medium border border-amber-500/20">🔥 {mockUser.weeklyStreak}w streak</span>
                </div>
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
      {cropImageSrc && (
        <AvatarCropModal
          imageSrc={cropImageSrc}
          onCropDone={handleCropDone}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
