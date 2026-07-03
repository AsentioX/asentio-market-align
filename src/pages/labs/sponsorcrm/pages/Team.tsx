import { useState } from 'react';
import { useTeam } from '../lib/api';
import { useScrmAuth } from '../lib/useScrmAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, Shield } from 'lucide-react';

export default function Team() {
  const { role } = useScrmAuth();
  const { data: team = [], refetch } = useTeam();
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState('committee');
  const isChair = role === 'chair';

  const invite = async () => {
    if (!email) return;
    toast.info('Ask the person to sign in first. Then set their role here using their user ID.');
    setEmail('');
  };

  const updateRole = async (id: string, r: string) => {
    const { error } = await supabase.from('scrm_user_roles' as any).update({ role: r }).eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Role updated'); refetch(); }
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from('scrm_user_roles' as any).delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Removed'); refetch(); }
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2"><Users className="w-5 h-5" /> Team</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Sponsorship committee members and their roles.</p>

      <div className="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
        {team.map(m => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
              {(m.email ?? '?').slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-900 truncate">{m.email ?? m.user_id}</div>
              <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                {m.role === 'chair' && <Shield className="w-3 h-3" />} {m.role}
              </div>
            </div>
            {isChair && (
              <>
                <Select value={m.role} onValueChange={v => updateRole(m.id, v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['chair','committee','ops','leadership'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>Remove</Button>
              </>
            )}
          </div>
        ))}
      </div>

      {isChair && (
        <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="text-sm font-medium text-slate-900 mb-2">Add a teammate</div>
          <p className="text-xs text-slate-500 mb-3">
            Ask them to sign in at <code>/labs/rhcrm</code> with their email. They'll see "Awaiting access" — refresh this page and their account will show up (they self-register when they attempt to sign in). Then set their role here.
          </p>
          <p className="text-xs text-slate-500">Alternatively: they can create an account and you can promote them from the list above.</p>
        </div>
      )}
    </div>
  );
}
