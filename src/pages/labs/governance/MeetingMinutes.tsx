import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDrafts, useMembers } from '@/hooks/useGovernance';
import { Plus, Pencil, Trash2, X, Calendar, Users, FileText, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MeetingMinute {
  id: string;
  title: string;
  meeting_date: string;
  attendees: string[];
  notes: string;
  transcript_id: string | null;
  created_by: string | null;
  created_at: string;
}

function useMeetingMinutes() {
  return useQuery({
    queryKey: ['gov-meeting-minutes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gov_meeting_minutes')
        .select('*')
        .order('meeting_date', { ascending: false });
      if (error) throw error;
      return data as MeetingMinute[];
    },
  });
}

function useMeetingMinutesMutations() {
  const qc = useQueryClient();

  const addMinute = useMutation({
    mutationFn: async (m: { title: string; meeting_date: string; attendees: string[]; notes: string; transcript_id?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('gov_meeting_minutes').insert({
        title: m.title,
        meeting_date: m.meeting_date,
        attendees: m.attendees,
        notes: m.notes,
        transcript_id: m.transcript_id ?? null,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-meeting-minutes'] }),
  });

  const updateMinute = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; meeting_date?: string; attendees?: string[]; notes?: string; transcript_id?: string | null }) => {
      const { error } = await supabase.from('gov_meeting_minutes').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-meeting-minutes'] }),
  });

  const deleteMinute = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_meeting_minutes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-meeting-minutes'] }),
  });

  return { addMinute, updateMinute, deleteMinute };
}

const parseBgColor = (avatar: string) => {
  const parts = avatar.split('|');
  return { emoji: parts[0] || '🐻', bgColor: parts[1] || 'bg-teal-100 text-teal-700' };
};

const MeetingMinutes = () => {
  const { data: minutes = [], isLoading } = useMeetingMinutes();
  const { addMinute, updateMinute, deleteMinute } = useMeetingMinutesMutations();
  const { drafts } = useDrafts();
  const { data: members = [] } = useMembers();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const currentMember = useMemo(() => {
    if (!user) return null;
    return members.find(m => m.user_id === user.id) ?? null;
  }, [user, members]);

  const getMemberByUserId = (userId: string | null) => {
    if (!userId) return null;
    return members.find(m => m.user_id === userId) ?? null;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [transcriptId, setTranscriptId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setSelectedAttendees([]);
    setNotes('');
    setTranscriptId(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (m: MeetingMinute) => {
    setTitle(m.title);
    setMeetingDate(m.meeting_date);
    setSelectedAttendees(m.attendees);
    setNotes(m.notes);
    setTranscriptId(m.transcript_id);
    setEditingId(m.id);
    setShowForm(true);
  };

  const toggleAttendee = (name: string) => {
    setSelectedAttendees(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (editingId) {
      updateMinute.mutate({ id: editingId, title, meeting_date: meetingDate, attendees: selectedAttendees, notes, transcript_id: transcriptId });
    } else {
      addMinute.mutate({ title, meeting_date: meetingDate, attendees: selectedAttendees, notes, transcript_id: transcriptId });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) { toast({ title: 'Admin only', variant: 'destructive' }); return; }
    deleteMinute.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Meeting Minutes</h2>
          <p className="text-gray-500 text-sm mt-1">Record and review meeting notes, decisions, and attendees.</p>
        </div>
        {user && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Minutes
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-teal-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{editingId ? 'Edit Minutes' : 'New Meeting Minutes'}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>

          {currentMember && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {(() => {
                const { emoji, bgColor } = parseBgColor(currentMember.avatar);
                return <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${bgColor}`}>{emoji}</span>;
              })()}
              Creating as <span className="font-medium text-gray-700">{currentMember.name}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting title…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Attendees</label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
              {members.map((m) => {
                const isSelected = selectedAttendees.includes(m.name);
                const { emoji, bgColor } = parseBgColor(m.avatar);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAttendee(m.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isSelected
                        ? 'border-teal-300 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${bgColor}`}>{emoji}</span>
                    {m.name}
                    {isSelected && <Check className="w-3 h-3 text-teal-600" />}
                  </button>
                );
              })}
              {members.length === 0 && <p className="text-xs text-gray-400">No task force members found.</p>}
            </div>
          </div>

          {drafts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Link to Transcript (optional)</label>
              <select
                value={transcriptId ?? ''}
                onChange={(e) => setTranscriptId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">None</option>
                {drafts.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting notes, key decisions, action items…"
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={addMinute.isPending || updateMinute.isPending}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {editingId ? 'Save Changes' : 'Create Minutes'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {minutes.length === 0 && !showForm && (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No meeting minutes yet. Create your first entry!</p>
        </div>
      )}

      <div className="space-y-3">
        {minutes.map((m) => {
          const isExpanded = expandedId === m.id;
          const linkedDraft = m.transcript_id ? drafts.find(d => d.id === m.transcript_id) : null;
          const createdByMember = getMemberByUserId(m.created_by);

          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                  {createdByMember ? (
                    (() => {
                      const { emoji, bgColor } = parseBgColor(createdByMember.avatar);
                      return <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${bgColor}`}>{emoji}</span>;
                    })()
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{m.title}</h4>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(m.meeting_date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {m.attendees.length} attendee{m.attendees.length !== 1 ? 's' : ''}
                    </span>
                    {createdByMember && (
                      <span className="text-gray-400">
                        by <span className="font-medium text-gray-500">{createdByMember.name}</span>
                      </span>
                    )}
                    {linkedDraft && (
                      <span className="flex items-center gap-1 text-teal-500">
                        <LinkIcon className="w-3 h-3" />
                        Transcript linked
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                  {m.attendees.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Attendees</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.attendees.map((a, i) => {
                          const member = members.find(mb => mb.name === a);
                          const avatarInfo = member ? parseBgColor(member.avatar) : null;
                          return (
                            <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {avatarInfo && (
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${avatarInfo.bgColor}`}>
                                  {avatarInfo.emoji}
                                </span>
                              )}
                              {a}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {linkedDraft && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Linked Transcript</p>
                      <div className="text-sm text-teal-600 bg-teal-50 rounded-lg px-3 py-2">
                        <p className="font-medium">{linkedDraft.title}</p>
                        {linkedDraft.summary && <p className="text-xs text-teal-500 mt-0.5">{linkedDraft.summary}</p>}
                      </div>
                    </div>
                  )}

                  {m.notes && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3 leading-relaxed">
                        {m.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingMinutes;
