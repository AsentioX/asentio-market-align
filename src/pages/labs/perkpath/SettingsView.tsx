import { useState } from 'react';
import { User, Mail, Save, AlertTriangle, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePerkPathAuth } from '@/hooks/usePerkPathAuth';
import { toast } from 'sonner';

const SettingsView = () => {
  const { user, perkpathUser, signOut } = usePerkPathAuth();
  const [displayName, setDisplayName] = useState(perkpathUser?.display_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleting, setDeleting] = useState(false);

  const saveName = async () => {
    if (!user) return;
    const trimmed = displayName.trim().slice(0, 100);
    if (!trimmed) { toast.error('Name cannot be empty'); return; }
    setSavingName(true);
    const { error } = await supabase.from('pp_users').update({ display_name: trimmed }).eq('user_id', user.id);
    setSavingName(false);
    if (error) toast.error(error.message);
    else toast.success('Name updated');
  };

  const saveEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { toast.error('Invalid email'); return; }
    if (trimmed === user?.email) { toast.info('Email unchanged'); return; }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setSavingEmail(false);
    if (error) toast.error(error.message);
    else toast.success('Confirmation email sent to both addresses');
  };

  const deleteAccount = async () => {
    if (confirmDelete.trim().toUpperCase() !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setDeleting(false); toast.error('Not signed in'); return; }
    const { error } = await supabase.functions.invoke('pp-delete-account');
    if (error) {
      setDeleting(false);
      toast.error(error.message ?? 'Failed to delete account');
      return;
    }
    toast.success('Account deleted');
    await supabase.auth.signOut();
  };

  return (
    <div className="px-5 py-5 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account details.</p>
      </div>

      {/* Profile */}
      <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Profile</h3>
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
            <User className="w-3.5 h-3.5" /> Display name
          </label>
          <div className="flex gap-2">
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={100}
              className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={saveName}
              disabled={savingName}
              className="px-4 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={255}
              className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={saveEmail}
              disabled={savingEmail}
              className="px-4 h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">A confirmation link will be sent to your new address.</p>
        </div>
      </section>

      {/* Session */}
      <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Session</h3>
        <button
          onClick={signOut}
          className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wide">Danger zone</h3>
        </div>
        <p className="text-xs text-rose-800/80">
          Deleting your account permanently removes all memberships, perks and personal data. This cannot be undone.
        </p>
        <input
          value={confirmDelete}
          onChange={e => setConfirmDelete(e.target.value)}
          placeholder='Type "DELETE" to confirm'
          className="w-full h-11 px-4 rounded-2xl border border-rose-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <button
          onClick={deleteAccount}
          disabled={deleting || confirmDelete.trim().toUpperCase() !== 'DELETE'}
          className="w-full h-11 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          Delete account
        </button>
      </section>
    </div>
  );
};

export default SettingsView;
