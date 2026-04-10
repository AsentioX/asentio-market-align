import { useState } from 'react';
import { useMembers, useMemberMutations, Member } from '@/hooks/useGovernance';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AVATAR_OPTIONS = ['🐻', '🦊', '🐼', '🐨', '🦁', '🐯', '🦉', '🐺', '🦅', '🐬', '🦋', '🐢'];

const BG_COLORS = [
  { value: 'bg-teal-100 text-teal-700', label: 'Teal', dot: 'bg-teal-400' },
  { value: 'bg-amber-100 text-amber-700', label: 'Amber', dot: 'bg-amber-400' },
  { value: 'bg-violet-100 text-violet-700', label: 'Violet', dot: 'bg-violet-400' },
  { value: 'bg-rose-100 text-rose-700', label: 'Rose', dot: 'bg-rose-400' },
  { value: 'bg-sky-100 text-sky-700', label: 'Sky', dot: 'bg-sky-400' },
  { value: 'bg-emerald-100 text-emerald-700', label: 'Green', dot: 'bg-emerald-400' },
  { value: 'bg-orange-100 text-orange-700', label: 'Orange', dot: 'bg-orange-400' },
  { value: 'bg-indigo-100 text-indigo-700', label: 'Indigo', dot: 'bg-indigo-400' },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'team-lead', label: 'Team Lead' },
  { value: 'member', label: 'Member' },
  { value: 'community-member', label: 'Community Member' },
];

const parseBgColor = (avatar: string) => {
  // Store bg color after a pipe in the avatar field: "🐻|bg-violet-100 text-violet-700"
  const parts = avatar.split('|');
  return {
    emoji: parts[0] || '🐻',
    bgColor: parts[1] || BG_COLORS[0].value,
  };
};

const TaskForceMembers = () => {
  const { data: members = [], isLoading } = useMembers();
  const { addMember, updateMember, deleteMember } = useMemberMutations();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('member');
  const [emoji, setEmoji] = useState('🐻');
  const [bgColor, setBgColor] = useState(BG_COLORS[0].value);

  const resetForm = () => {
    setName('');
    setRole('member');
    setEmoji('🐻');
    setBgColor(BG_COLORS[0].value);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (m: Member) => {
    const parsed = parseBgColor(m.avatar);
    setEditingId(m.id);
    setName(m.name);
    setRole(m.role);
    setEmoji(parsed.emoji);
    setBgColor(parsed.bgColor);
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

    const avatarValue = `${emoji}|${bgColor}`;

    if (editingId) {
      updateMember.mutate({ id: editingId, name: name.trim(), role, avatar: avatarValue });
    } else {
      addMember.mutate({ name: name.trim(), role, avatar: avatarValue });
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
      {/* Animal picker */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Icon</p>
        <div className="flex gap-1 flex-wrap">
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => setEmoji(a)}
              className={`w-9 h-9 rounded-full text-lg flex items-center justify-center transition-all ${
                emoji === a ? 'ring-2 ring-teal-500 bg-teal-50 scale-110' : 'hover:bg-gray-100'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      {/* Color picker */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Background Color</p>
        <div className="flex gap-2 flex-wrap">
          {BG_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setBgColor(c.value)}
              className={`w-7 h-7 rounded-full ${c.dot} transition-all ${
                bgColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
              }`}
              title={c.label}
            />
          ))}
        </div>
      </div>
      {/* Preview */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
          {emoji}
        </div>
        <span className="text-sm text-gray-400">Preview</span>
      </div>
      <div className="flex gap-3">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
        {isAdmin && (
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
        )}
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
        {members.map((m) => {
          const parsed = parseBgColor(m.avatar);
          return editingId === m.id ? (
            <div key={m.id}>{formRow}</div>
          ) : (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4 group">
              <div className={`w-12 h-12 rounded-full ${parsed.bgColor} flex items-center justify-center font-bold text-xl flex-shrink-0`}>
                {parsed.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                {isAdmin && (
                  <p className="text-sm text-gray-500 truncate capitalize">{ROLE_OPTIONS.find(r => r.value === m.role)?.label ?? m.role}</p>
                )}
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
          );
        })}
      </div>
    </div>
  );
};

export default TaskForceMembers;
