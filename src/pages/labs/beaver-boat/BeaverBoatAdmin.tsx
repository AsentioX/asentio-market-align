import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, LogOut, Image as ImageIcon, Video, Mail, MailOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useGallery } from './useGallery';
import logo from './assets/logo.png';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}


const BeaverBoatAdmin = () => {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const [label, setLabel] = useState('');
  const [itemType, setItemType] = useState<'race' | 'practice'>('race');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { items, reload } = useGallery();

  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('beaver_boat_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMessages(data as ContactMessage[]);
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadMessages();
  }, [user, loadMessages]);

  const toggleRead = async (m: ContactMessage) => {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: !x.is_read } : x)));
    await supabase.from('beaver_boat_messages').update({ is_read: !m.is_read }).eq('id', m.id);
  };

  const deleteMessage = async (m: ContactMessage) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    await supabase.from('beaver_boat_messages').delete().eq('id', m.id);
  };


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setBusy(true);
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/labs/beaver-boat/admin` },
      });
      if (error) setAuthError(error.message);
      else setAuthError('Check your email to confirm your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
    setBusy(false);
  };

  const handleGoogle = async () => {
    await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.href });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploadError('');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('beaver-boat-gallery')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('beaver-boat-gallery').getPublicUrl(path);
      const kind: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
      const { error: insErr } = await supabase.from('beaver_boat_gallery').insert({
        user_id: user.id,
        label: label || file.name,
        item_type: itemType,
        media_url: pub.publicUrl,
        media_kind: kind,
      });
      if (insErr) throw insErr;
      setLabel('');
      setFile(null);
      (document.getElementById('bb-file') as HTMLInputElement | null)?.value &&
        ((document.getElementById('bb-file') as HTMLInputElement).value = '');
      reload();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete "${item.label}"?`)) return;
    // Remove the row first (RLS-protected to owner). Then best-effort delete the file.
    const { error } = await supabase.from('beaver_boat_gallery').delete().eq('id', item.id);
    if (error) {
      alert(error.message);
      return;
    }
    try {
      const url: string = item.media_url;
      const marker = '/beaver-boat-gallery/';
      const idx = url.indexOf(marker);
      if (idx >= 0) {
        const path = url.slice(idx + marker.length);
        await supabase.storage.from('beaver-boat-gallery').remove([path]);
      }
    } catch {}
    reload();
  };

  // -- LOGIN SCREEN ---------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-[#A31F34] text-white flex flex-col">
        <header className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/labs/beaver-boat" className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
            <span className="font-bold tracking-tight">Admin</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md bg-white text-black rounded-2xl shadow-2xl p-8">
            <h1 className="text-2xl font-black mb-1">Beaver Boat CMS</h1>
            <p className="text-sm text-neutral-500 mb-6">Sign in to manage the gallery.</p>

            <button
              onClick={handleGoogle}
              className="w-full mb-4 py-3 rounded-xl border-2 border-black/10 font-bold hover:bg-black/5 transition"
            >
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-xs text-neutral-500">or</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-black/15 focus:border-[#A31F34] focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-black/15 focus:border-[#A31F34] focus:outline-none"
              />
              {authError && <div className="text-sm text-[#A31F34]">{authError}</div>}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-[#A31F34] text-white font-black hover:bg-[#FF000D] transition disabled:opacity-60"
              >
                {busy ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }}
              className="mt-4 text-sm text-neutral-500 hover:text-black"
            >
              {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- ADMIN DASHBOARD ------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <header className="sticky top-0 z-40 bg-white border-b border-black/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/labs/beaver-boat" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-9 w-9 object-contain" />
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-[#A31F34] uppercase tracking-widest leading-none">CMS</div>
              <div className="font-bold tracking-tight text-sm">Beaver Boat Gallery</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-neutral-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold text-neutral-700 hover:bg-neutral-100"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-[380px_1fr] gap-8">
        {/* Upload form */}
        <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-black/10 p-6 space-y-4 h-fit shadow-sm">
          <div>
            <h2 className="text-xl font-black mb-1">Add to Gallery</h2>
            <p className="text-sm text-neutral-500">Photos or videos. Max 50 MB recommended.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Caption</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. SF Festival 2026 — Final Heat"
              maxLength={120}
              className="w-full px-3 py-2.5 rounded-lg border border-black/15 focus:border-[#A31F34] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['race', 'practice'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setItemType(t)}
                  className={`py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition ${
                    itemType === t
                      ? t === 'race'
                        ? 'bg-[#FF000D] text-white'
                        : 'bg-[#C0C0C0] text-black'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1.5">File</label>
            <input
              id="bb-file"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#A31F34] file:text-white file:font-bold file:cursor-pointer hover:file:bg-[#FF000D]"
            />
            {file && (
              <div className="mt-1.5 text-xs text-neutral-500">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </div>
            )}
          </div>

          {uploadError && <div className="text-sm text-[#A31F34]">{uploadError}</div>}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 rounded-xl bg-[#A31F34] text-white font-black hover:bg-[#FF000D] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload to Gallery'}
          </button>
        </form>

        {/* Current gallery */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black">Current Gallery <span className="text-neutral-400 font-bold">({items.length})</span></h2>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-black/15 p-10 text-center text-neutral-500">
              No items yet. Upload your first photo or video on the left.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((g) => (
                <div key={g.id} className="bg-white rounded-xl border border-black/10 overflow-hidden group">
                  <div className="aspect-[4/3] bg-neutral-100 relative">
                    {g.media_kind === 'video' ? (
                      <video src={g.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={g.media_url} alt={g.label} className="w-full h-full object-cover" />
                    )}
                    <span className={`absolute top-2 left-2 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${g.item_type === 'race' ? 'bg-[#FF000D] text-white' : 'bg-[#C0C0C0] text-black'}`}>
                      {g.item_type}
                    </span>
                    <span className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5">
                      {g.media_kind === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    </span>
                    {g.user_id === user.id && (
                      <button
                        onClick={() => handleDelete(g)}
                        className="absolute bottom-2 right-2 bg-white/95 text-[#A31F34] rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition shadow"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="p-2.5 text-xs font-medium truncate">{g.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BeaverBoatAdmin;
