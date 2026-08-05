import { useState } from 'react';
import { useTeam } from '../lib/api';
import { useScrmAuth } from '../lib/useScrmAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Users, Shield, Trash2, UserPlus, KeyRound } from 'lucide-react';
import { PhotoUpload } from '../components/PhotoUpload';
import { SCRM_DEFAULT_PASSWORD } from './ChangePassword';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'finance', label: 'Finance' },
  { value: 'team_rh', label: 'Team RH' },
];
const roleLabel = (r: string) => ROLES.find(x => x.value === r)?.label ?? r;

const initials = (m: { name?: string | null; email?: string | null }) =>
  (m.name || m.email || '?').slice(0, 2).toUpperCase();

export default function Team() {
  const { role, user } = useScrmAuth();
  const { data: team = [], refetch } = useTeam();
  const isAdmin = role === 'admin';

  const patch = async (id: string, updates: Record<string, any>, msg = 'Saved') => {
    const { error } = await supabase.from('scrm_user_roles' as any).update(updates).eq('id', id);
    if (error) toast.error(error.message); else { toast.success(msg); refetch(); }
  };
  const resetPassword = async (id: string, label: string) => {
    const { data, error } = await supabase.functions.invoke('scrm-admin-account', {
      body: { action: 'reset_password', member_id: id },
    });
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? 'Could not reset password');
      return;
    }
    toast.success(`${label} reset to the default password`);
    refetch();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from('scrm_user_roles' as any).delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Member deleted'); refetch(); }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5" /> Team</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {team.length} members · {team.filter(m => m.is_active).length} active
          </p>
        </div>
        {isAdmin && <AddMemberDialog onAdded={refetch} />}
      </div>

      <div className="border border-slate-200 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 w-16">Photo</th>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Active</th>
              {isAdmin && <th className="px-4 py-3 w-12" />}
            </tr>
          </thead>
          <tbody>
            {team.map(m => (
              <tr key={m.id} className={`border-t border-slate-100 ${m.is_active ? '' : 'opacity-60'}`}>
                <td className="px-4 py-2">
                  {isAdmin || m.user_id === user?.id ? (
                    <PhotoUpload
                      size="sm"
                      value={m.photo_url}
                      onChange={url => patch(m.id, { photo_url: url }, url ? 'Photo updated' : 'Photo removed')}
                    />
                  ) : m.photo_url ? (
                    <img src={m.photo_url} alt={m.name ?? m.email ?? 'Team member'} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                      {initials(m)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <TextCell value={m.name ?? ''} placeholder="Name" onSave={v => patch(m.id, { name: v || null })} />
                  ) : <span className="text-slate-900">{m.name ?? '—'}</span>}
                </td>
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <div className="flex items-center gap-2">
                      <TextCell value={m.email ?? ''} placeholder="Email" onSave={v => patch(m.id, { email: v || null })} />
                      {!m.user_id && <span className="text-[10px] uppercase tracking-wide text-amber-600 whitespace-nowrap">Pending</span>}
                    </div>
                  ) : <span className="text-slate-600">{m.email ?? '—'}</span>}
                </td>
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <TextCell value={m.phone ?? ''} placeholder="Phone" onSave={v => patch(m.id, { phone: v || null })} />
                  ) : <span className="text-slate-600">{m.phone ?? '—'}</span>}
                </td>
                <td className="px-4 py-2">
                  {isAdmin ? (
                    <Select value={m.role} onValueChange={v => patch(m.id, { role: v }, 'Role updated')}>
                      <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      {m.role === 'admin' && <Shield className="w-3 h-3" />}{roleLabel(m.role)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!m.is_active}
                      disabled={!isAdmin}
                      onCheckedChange={v => patch(m.id, { is_active: v }, v ? 'Member active' : 'Member inactive')}
                    />
                    <span className="text-xs text-slate-500">{m.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900" title={m.user_id ? 'Reset to default password' : 'Create login with default password'}>
                          <KeyRound className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{m.user_id ? 'Reset password to default?' : 'Create login for this member?'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {m.name || m.email || 'This member'} will be able to sign in with the default password
                            <span className="font-mono"> {SCRM_DEFAULT_PASSWORD}</span> and must set a new one at next login.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => resetPassword(m.id, m.name || m.email || 'Member')}>
                            {m.user_id ? 'Reset password' : 'Create login'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete team member?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {m.name || m.email || 'This member'} will lose access to the CRM. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(m.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                )}
              </tr>
            ))}
            {team.length === 0 && (
              <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-400 text-sm">No team members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Click a photo to upload a new one (JPG or PNG, up to 5MB). You can always update your own photo.
        {isAdmin && <> Use the key icon to create a login for a pending member, or reset one back to the default password (<span className="font-mono">{SCRM_DEFAULT_PASSWORD}</span>).</>}
      </p>
    </div>
  );
}

function AddMemberDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', photo_url: '', role: 'team_rh' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    const { data: inserted, error } = await supabase.from('scrm_user_roles' as any).insert({
      user_id: null,
      role: form.role,
      email: form.email.trim().toLowerCase(),
      name: form.name.trim() || null,
      phone: form.phone.trim() || null,
      photo_url: form.photo_url.trim() || null,
      is_active: true,
      must_change_password: true,
    }).select('id').single();
    if (error) { setSaving(false); toast.error(error.message); return; }
    const { data: acc } = await supabase.functions.invoke('scrm-admin-account', {
      body: { action: 'create_account', member_id: (inserted as any)?.id },
    });
    setSaving(false);
    if ((acc as any)?.error) toast.error((acc as any).error);
    else toast.success(`Member added — default password ${SCRM_DEFAULT_PASSWORD}`);
    setForm({ name: '', email: '', phone: '', photo_url: '', role: 'team_rh' });
    setOpen(false);
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="w-4 h-4 mr-2" /> Add member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>
            An account is created with the default password <span className="font-mono">{SCRM_DEFAULT_PASSWORD}</span>. They must set a new password at first login.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Doe" /></div>
          <div><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@mitrealityhack.com" /></div>
          <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 1111" /></div>
          <div>
            <Label className="text-xs">Photo</Label>
            <div className="mt-1">
              <PhotoUpload value={form.photo_url || null} onChange={url => set('photo_url', url ?? '')} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value={form.role} onValueChange={v => set('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Adding…' : 'Add member'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TextCell({ value, placeholder, onSave }: { value: string; placeholder: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <Input
      className="h-8 text-sm"
      value={v}
      placeholder={placeholder}
      onChange={e => setV(e.target.value)}
      onBlur={() => { if (v !== value) onSave(v.trim()); }}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
    />
  );
}
