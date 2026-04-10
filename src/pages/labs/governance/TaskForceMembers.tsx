import { useState } from 'react';
import { useMembers, useMemberMutations, Member } from '@/hooks/useGovernance';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AVATAR_OPTIONS = ['👤', '🧑‍💼', '🧑‍🔬', '🧑‍🎨', '🧑‍💻', '🧑‍🏫', '🌟', '🔷', '🟢', '🟠'];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'team-lead', label: 'Team Lead' },
  { value: 'member', label: 'Member' },
];

const TaskForceMembers = () => {
  const { data: members = [], isLoading } = useMembers();
  const { addMember, updateMember, deleteMember } = useMemberMutations();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [avatar, setAvatar] = useState('👤');

  const resetForm = () => {
    setName('');
    setRole('member');
    setAvatar('👤');
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setName(m.name);
    setRole(m.role);
    setAvatar(m.avatar);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!user) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    if (!name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    if (editingId) {
      updateMember.mutate({ id: editingId, name: name.trim(), role, avatar });
    } else {
      addMember.mutate({ name: name.trim(), role, avatar });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!user) {
      toast({ title: 'Sign in required', variant: 'destructive' });
      return;
    }
    deleteMember.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>;
  }

  const formRow = (
    <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-all ${
                avatar === a ? 'ring-2 ring-teal-500 bg-teal-50' : 'hover:bg-gray-100'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-4 h-4 mr-1" /> Cancel</Button>
        <Button size="sm" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          <Check className="w-4 h-4 mr-1" /> {editingId ? 'Update' : 'Add'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Task Force Members</h2>
          <p className="text-gray-500 mt-1">People shaping the operating model.</p>
        </div>
        {!showForm && !editingId && (
          <Button size="sm" onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-1" /> Add Member
          </Button>
        )}
      </div>

      {showForm && formRow}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {members.map((m) =>
          editingId === m.id ? (
            <div key={m.id}>{formRow}</div>
          ) : (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                <p className="text-sm text-gray-500 truncate capitalize">{ROLE_OPTIONS.find(r => r.value === m.role)?.label ?? m.role}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TaskForceMembers;
