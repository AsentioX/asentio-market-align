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
import { toast } from 'sonner';
import { Users, Shield, Trash2 } from 'lucide-react';

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
  const { role } = useScrmAuth();
  const { data: team = [], refetch } = useTeam();
  const isAdmin = role === 'admin';

  const patch = async (id: string, updates: Record<string, any>, msg = 'Saved') => {
    const { error } = await supabase.from('scrm_user_roles' as any).update(updates).eq('id', id);
    if (error) toast.error(error.message); else { toast.success(msg); refetch(); }
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from('scrm_user_roles' as any).delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Member deleted'); refetch(); }
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5" /> Team</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        {team.length} members · {team.filter(m => m.is_active).length} active
      </p>

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
                  {m.photo_url ? (
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
                    <TextCell value={m.email ?? ''} placeholder="Email" onSave={v => patch(m.id, { email: v || null })} />
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
                  <td className="px-4 py-2 text-right">
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

      {isAdmin && (
        <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="text-sm font-medium text-slate-900 mb-2">Add a teammate</div>
          <p className="text-xs text-slate-500">
            Ask them to sign in at <code>/labs/rhcrm</code> with their email. They'll see "Awaiting access" — refresh this page,
            then fill in their details and set their role above. Paste an image URL in the photo field to show their picture.
          </p>
          <div className="mt-3 space-y-2">
            {team.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-40 truncate">{m.name || m.email}</span>
                <TextCell value={m.photo_url ?? ''} placeholder="Photo URL" onSave={v => patch(m.id, { photo_url: v || null })} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
