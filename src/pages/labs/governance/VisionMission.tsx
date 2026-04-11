import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useGovernance';
import { Eye, Target, Lightbulb, Pencil, ThumbsUp, Trash2, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

// ─── Content hooks (gov_settings) ───
function useVisionContent() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-vision-content'],
    queryFn: async () => {
      const { data } = await supabase
        .from('gov_settings')
        .select('key, value')
        .in('key', ['vision_text', 'mission_text', 'principles_text']);
      const map: Record<string, string> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return {
        vision: map['vision_text'] ?? 'A future where spatial computing policy is shaped transparently, inclusively, and proactively — ensuring XR technologies serve the public good while fostering innovation.',
        mission: map['mission_text'] ?? 'To convene diverse stakeholders in drafting, debating, and finalising governance policies for extended reality — bridging the gap between technological possibility and societal readiness.',
        principles: map['principles_text'] ?? 'Transparency — All deliberations and decisions are documented and publicly accessible.\nInclusivity — Perspectives from industry, academia, civil society, and affected communities are actively sought.\nEvidence-based — Policies are grounded in research, real-world data, and expert testimony.\nAdaptive — Governance frameworks evolve alongside the technology they regulate.\nHuman-centred — Individual rights, safety, and well-being remain the primary lens for every policy.',
      };
    },
  });

  const save = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data: existing } = await supabase.from('gov_settings').select('id').eq('key', key).maybeSingle();
      if (existing) {
        await supabase.from('gov_settings').update({ value }).eq('key', key);
      } else {
        await supabase.from('gov_settings').insert({ key, value });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-vision-content'] }),
  });

  return { content: query.data, isLoading: query.isLoading, save };
}

// ─── Section Discussion Component ───
interface VisionComment {
  id: string;
  body: string;
  author_name: string;
  created_by: string | null;
  created_at: string;
  section: string;
  vote_count: number;
  user_voted: boolean;
}

function useSectionComments(section: string) {
  const qc = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['gov-vision-comments', section, user?.id],
    queryFn: async () => {
      const { data: comments } = await supabase
        .from('gov_vision_comments')
        .select('*')
        .eq('section', section)
        .order('created_at', { ascending: true });

      const commentIds = (comments ?? []).map((c) => c.id);
      let votes: { comment_id: string; user_id: string }[] = [];
      if (commentIds.length > 0) {
        const { data } = await supabase
          .from('gov_vision_comment_votes')
          .select('comment_id, user_id')
          .in('comment_id', commentIds);
        votes = data ?? [];
      }

      return (comments ?? []).map((c) => {
        const commentVotes = votes.filter((v) => v.comment_id === c.id);
        return {
          ...c,
          vote_count: commentVotes.length,
          user_voted: user ? commentVotes.some((v) => v.user_id === user.id) : false,
        } as VisionComment;
      });
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ body, authorName }: { body: string; authorName: string }) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error('Must be logged in');
      const { error } = await supabase.from('gov_vision_comments').insert({
        body,
        author_name: authorName,
        created_by: u.id,
        section,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-vision-comments', section] }),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gov_vision_comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-vision-comments', section] }),
  });

  const toggleVote = useMutation({
    mutationFn: async ({ commentId, hasVoted }: { commentId: string; hasVoted: boolean }) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error('Must be logged in');
      if (hasVoted) {
        await supabase.from('gov_vision_comment_votes').delete().eq('comment_id', commentId).eq('user_id', u.id);
      } else {
        const { error } = await supabase.from('gov_vision_comment_votes').insert({ comment_id: commentId, user_id: u.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gov-vision-comments', section] }),
  });

  const sorted = useMemo(() => {
    return [...(query.data ?? [])].sort((a, b) => b.vote_count - a.vote_count);
  }, [query.data]);

  return { comments: sorted, isLoading: query.isLoading, addComment, deleteComment, toggleVote };
}

function SectionDiscussion({ section, authorName }: { section: string; authorName: string }) {
  const { user, isAdmin } = useAuth();
  const { comments, addComment, deleteComment, toggleVote } = useSectionComments(section);
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    if (!newComment.trim()) return;
    addComment.mutate({ body: newComment.trim(), authorName }, {
      onSuccess: () => { setNewComment(''); setExpanded(true); },
    });
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Discussion ({comments.length})</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {user ? (
            <div className="flex gap-2">
              <Input
                placeholder="Share your thoughts…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleAdd} disabled={!newComment.trim() || addComment.isPending} className="gap-1.5">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Sign in to join the discussion.</p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <button
                onClick={() => user && toggleVote.mutate({ commentId: c.id, hasVoted: c.user_voted })}
                disabled={!user}
                className={`flex flex-col items-center gap-0.5 pt-0.5 ${c.user_voted ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-medium">{c.vote_count}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{c.author_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{c.body}</p>
              </div>
              {(isAdmin || c.created_by === user?.id) && (
                <button
                  onClick={() => deleteComment.mutate(c.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors self-start p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Component ───
const VisionMission = () => {
  const { user, isAdmin } = useAuth();
  const { content, save } = useVisionContent();
  const { data: members } = useMembers();

  const [editOpen, setEditOpen] = useState(false);
  const [editVision, setEditVision] = useState('');
  const [editMission, setEditMission] = useState('');
  const [editPrinciples, setEditPrinciples] = useState('');

  const openEdit = () => {
    setEditVision(content?.vision ?? '');
    setEditMission(content?.mission ?? '');
    setEditPrinciples(content?.principles ?? '');
    setEditOpen(true);
  };

  const handleSave = async () => {
    await Promise.all([
      save.mutateAsync({ key: 'vision_text', value: editVision }),
      save.mutateAsync({ key: 'mission_text', value: editMission }),
      save.mutateAsync({ key: 'principles_text', value: editPrinciples }),
    ]);
    setEditOpen(false);
    toast({ title: 'Saved', description: 'Vision & Mission updated.' });
  };

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const authorName = currentMember?.name ?? user?.email ?? 'Anonymous';

  const principleLines = content?.principles?.split('\n').filter(Boolean) ?? [];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Vision & Mission</h2>
          <p className="text-sm text-gray-500">Guiding principles for the Field Of Views task force</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={openEdit} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vision */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Vision</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{content?.vision}</p>
          <SectionDiscussion section="vision" authorName={authorName} />
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Mission</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{content?.mission}</p>
          <SectionDiscussion section="mission" authorName={authorName} />
        </div>
      </div>

      {/* Principles */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Guiding Principles</h3>
        </div>
        <ul className="space-y-3 text-gray-600">
          {principleLines.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <SectionDiscussion section="principles" authorName={authorName} />
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vision & Mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Vision</label>
              <Textarea value={editVision} onChange={(e) => setEditVision(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mission</label>
              <Textarea value={editMission} onChange={(e) => setEditMission(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Guiding Principles (one per line)</label>
              <Textarea value={editPrinciples} onChange={(e) => setEditPrinciples(e.target.value)} rows={6} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={save.isPending}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisionMission;
