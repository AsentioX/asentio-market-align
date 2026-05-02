import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useGovernance';
import { Eye, Target, Lightbulb, Pencil, ThumbsUp, Trash2, MessageCircle, Send, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/governance/RichTextEditor';
import DOMPurify from 'dompurify';

// ─── Helpers ───
// Convert plain-text (with \n) to HTML paragraphs for backward compat
function plainToHtml(text: string): string {
  if (text.startsWith('<')) return text; // already HTML
  return text
    .split('\n\n')
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Default content as HTML
const DEFAULTS = {
  theWhy: `<p><strong>Computing has finally caught up to our physiology, but our interfaces haven't caught up to our humanity.</strong></p><p>Since the dawn of the punch card, we have been forced to speak "machine." We have evolved from clunky physical inputs to touch and voice, and from distant teletypes to wearable displays. However, as technology shrinks the distance and increases the speed of our communication, it often dilutes the quality of our connection. We exist to ensure that as computing becomes invisible and omnipresent, it remains a tool for human flourishing rather than a replacement for it.</p>`,
  whyNow: `<p><strong>The "Hardware Gap" has closed, and the "AI Engine" has ignited.</strong></p><p>We are standing at a historic intersection where three technologies have reached a terminal velocity:</p><ul><li><strong>Input:</strong> Eye-tracking, neuro-sensing, and spatial awareness have made the body the interface.</li><li><strong>Output:</strong> Wearable displays (Smart Glasses) have moved from labs to all-day wearable reality.</li><li><strong>Processing:</strong> AI has reached a level of agentic intelligence that can finally understand human intent in real-time.</li></ul><p>There is a brief window of time to decide how these systems will be built. If we don't reimagine the interface now, we risk building a future that optimizes for "data" instead of "people."</p>`,
  vision: `<p><strong>To pioneer a future where technology is an invisible bridge to deeper human connection and a more grounded society.</strong></p><p>We imagine a world where the "Mainline" of technology doesn't distract us from reality, but enhances our presence within it—where computing serves the human spirit, not the other way around.</p>`,
  mission: `<p><strong>To convene a global community of explorers who prototype the future of human-centric computing through the convergence of XR and AI.</strong></p><p>How we execute:</p><ul><li><strong>Build the "Kernel":</strong> We provide the playground for the first generation of "Human-Centric" spatial apps.</li><li><strong>Keep the Human in the Loop:</strong> We prioritize social impact, ethics, and communication-first design in every "hack."</li><li><strong>Community as Infrastructure:</strong> We foster a diverse network of "interviewers and explorers" who bridge the gap between technical possibility and human necessity.</li></ul>`,
  whyMit: `<p>The MIT Reality Hack is the physical manifestation of <em>Mens et Manus</em>—the essential bridge between the visionary "Mind" and the building "Hand." We exist at a historic convergence where hardware has finally become wearable and AI has become agentic, fundamentally shifting the human I/O from punch cards to neuro-sensing and spatial overlays.</p><p>As the birthplace of the hacker ethos, MIT is the only "Kernel" capable of hosting this level of exploration, where we don't just dream of the future but prototype the "Mainline" version of it. By keeping the human at the center of this loop, we ensure that as computing becomes invisible, it remains a tool for deeper connection and the foundation for a more grounded society.</p>`,
};

// ─── Content hooks (gov_settings) ───
function useVisionContent() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['gov-vision-content'],
    queryFn: async () => {
      const { data } = await supabase
        .from('gov_settings')
        .select('key, value')
        .in('key', ['vision_text', 'mission_text', 'the_why_text', 'why_now_text', 'why_mit_text']);
      const map: Record<string, string> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return {
        theWhy: map['the_why_text'] ? plainToHtml(map['the_why_text']) : DEFAULTS.theWhy,
        whyNow: map['why_now_text'] ? plainToHtml(map['why_now_text']) : DEFAULTS.whyNow,
        whyMit: map['why_mit_text'] ? plainToHtml(map['why_mit_text']) : DEFAULTS.whyMit,
        vision: map['vision_text'] ? plainToHtml(map['vision_text']) : DEFAULTS.vision,
        mission: map['mission_text'] ? plainToHtml(map['mission_text']) : DEFAULTS.mission,
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

// ─── Rich content renderer ───
function RichContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-600 leading-relaxed
        prose-strong:text-gray-800 prose-headings:text-gray-800 prose-headings:text-base prose-headings:font-semibold
        prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
        prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
        prose-li:my-0.5 prose-li:marker:text-gray-400
        prose-p:mb-3 prose-p:last:mb-0"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}

// ─── Component ───
const VisionMission = () => {
  const { user, isAdmin } = useAuth();
  const { content, save } = useVisionContent();
  const { data: members } = useMembers();

  const [editOpen, setEditOpen] = useState(false);
  const [editTheWhy, setEditTheWhy] = useState('');
  const [editWhyNow, setEditWhyNow] = useState('');
  const [editWhyMit, setEditWhyMit] = useState('');
  const [editVision, setEditVision] = useState('');
  const [editMission, setEditMission] = useState('');

  const openEdit = () => {
    setEditTheWhy(content?.theWhy ?? '');
    setEditWhyNow(content?.whyNow ?? '');
    setEditWhyMit(content?.whyMit ?? '');
    setEditVision(content?.vision ?? '');
    setEditMission(content?.mission ?? '');
    setEditOpen(true);
  };

  const handleSave = async () => {
    await Promise.all([
      save.mutateAsync({ key: 'the_why_text', value: editTheWhy }),
      save.mutateAsync({ key: 'why_now_text', value: editWhyNow }),
      save.mutateAsync({ key: 'why_mit_text', value: editWhyMit }),
      save.mutateAsync({ key: 'vision_text', value: editVision }),
      save.mutateAsync({ key: 'mission_text', value: editMission }),
    ]);
    setEditOpen(false);
    toast({ title: 'Saved', description: 'Vision & Mission updated.' });
  };

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const authorName = currentMember?.name ?? user?.email ?? 'Anonymous';

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

      {/* The Why */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">The Why</h3>
          <span className="text-xs text-gray-400 ml-auto">The Core Purpose</span>
        </div>
        <RichContent html={content?.theWhy ?? ''} />
        <SectionDiscussion section="the-why" authorName={authorName} />
      </div>

      {/* Why Now? */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Why Now?</h3>
          <span className="text-xs text-gray-400 ml-auto">The Convergence</span>
        </div>
        <RichContent html={content?.whyNow ?? ''} />
        <SectionDiscussion section="why-now" authorName={authorName} />
      </div>

      {/* Why MIT */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Why MIT</h3>
          <span className="text-xs text-gray-400 ml-auto">Mens et Manus</span>
        </div>
        <RichContent html={content?.whyMit ?? ''} />
        <SectionDiscussion section="why-mit" authorName={authorName} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vision */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Vision</h3>
            <span className="text-xs text-gray-400 ml-auto">The North Star</span>
          </div>
          <RichContent html={content?.vision ?? ''} />
          <SectionDiscussion section="vision" authorName={authorName} />
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Mission</h3>
            <span className="text-xs text-gray-400 ml-auto">The How</span>
          </div>
          <RichContent html={content?.mission ?? ''} />
          <SectionDiscussion section="mission" authorName={authorName} />
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vision & Mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">The Why (The Core Purpose)</label>
              <RichTextEditor content={editTheWhy} onChange={setEditTheWhy} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Why Now? (The Convergence)</label>
              <RichTextEditor content={editWhyNow} onChange={setEditWhyNow} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Why MIT (Mens et Manus)</label>
              <RichTextEditor content={editWhyMit} onChange={setEditWhyMit} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Vision (The North Star)</label>
              <RichTextEditor content={editVision} onChange={setEditVision} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Mission (The How)</label>
              <RichTextEditor content={editMission} onChange={setEditMission} />
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
