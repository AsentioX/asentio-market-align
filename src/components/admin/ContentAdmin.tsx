import { useState } from 'react';
import { useArticles, useUpdateArticle, useSubmissions, useReviewSubmission, useSubscribers } from '@/hooks/useAsentioContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Check, X, Download } from 'lucide-react';

const ContentAdmin = () => {
  const { data: articles, isLoading: articlesLoading } = useArticles('all');
  const { data: submissions, isLoading: submissionsLoading } = useSubmissions();
  const { data: subscribers, isLoading: subscribersLoading } = useSubscribers();
  const updateArticle = useUpdateArticle();
  const review = useReviewSubmission();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: '', summary: '', body: '', status: 'draft' });

  const startEdit = (a: { id: string; title: string; summary: string | null; body: string | null; status: string }) => {
    setEditingId(a.id);
    setDraft({ title: a.title, summary: a.summary || '', body: a.body || '', status: a.status });
  };

  const save = async (id: string) => {
    try {
      await updateArticle.mutateAsync({
        id,
        updates: {
          title: draft.title,
          summary: draft.summary,
          body: draft.body,
          status: draft.status,
          published_at: draft.status === 'published' ? new Date().toISOString() : null,
        },
      });
      setEditingId(null);
      toast({ title: 'Article saved' });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await review.mutateAsync({ id, status });
      toast({ title: status === 'approved' ? 'Submission approved and published' : 'Submission rejected' });
    } catch (e) {
      toast({ title: 'Action failed', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const exportSubscribers = () => {
    if (!subscribers?.length) return;
    const rows = [
      ['email', 'first_name', 'company', 'role', 'source', 'created_at'].join(','),
      ...subscribers.map((s: Record<string, unknown>) =>
        [s.email, s.first_name, s.company, s.role, s.source, s.created_at].map((v) => `"${v ?? ''}"`).join(',')
      ),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([rows], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asentio-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingCount = (submissions || []).filter((s: Record<string, unknown>) => s.status === 'pending').length;

  return (
    <Tabs defaultValue="articles" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="articles">Insights & Research</TabsTrigger>
        <TabsTrigger value="submissions">
          Submissions{pendingCount > 0 && <Badge className="ml-2 bg-asentio-red text-white">{pendingCount}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
      </TabsList>

      {/* Articles */}
      <TabsContent value="articles" className="space-y-4">
        {articlesLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-asentio-blue" />
        ) : (
          (articles || []).map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
                {editingId === a.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Title</Label>
                      <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    </div>
                    <div>
                      <Label>Summary</Label>
                      <Textarea rows={2} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
                    </div>
                    <div>
                      <Label>Body</Label>
                      <Textarea rows={10} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant={draft.status === 'published' ? 'default' : 'outline'}
                        onClick={() => setDraft({ ...draft, status: draft.status === 'published' ? 'draft' : 'published' })}
                      >
                        {draft.status === 'published' ? 'Published' : 'Draft'}
                      </Button>
                      <Button onClick={() => save(a.id)} disabled={updateArticle.isPending} className="bg-asentio-blue hover:bg-asentio-blue/90">
                        Save
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                        <Badge variant="secondary" className="text-xs">{a.kind}</Badge>
                        <Badge className={`text-xs ${a.status === 'published' ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {a.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
                    </div>
                    <Button variant="outline" onClick={() => startEdit(a)}>Edit</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* Submissions */}
      <TabsContent value="submissions" className="space-y-4">
        {submissionsLoading ? (
          <Loader2 className="w-6 h-6 animate-spin text-asentio-blue" />
        ) : (submissions || []).length === 0 ? (
          <p className="text-muted-foreground">No submissions yet.</p>
        ) : (
          (submissions || []).map((s: Record<string, any>) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{s.company_name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {s.submission_type === 'claim_profile' ? 'Claim' : 'New company'}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          s.status === 'approved'
                            ? 'bg-green-600 text-white'
                            : s.status === 'rejected'
                            ? 'bg-destructive text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{s.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {[s.primary_category, s.company_type, s.hq_location, s.website].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From {s.submitter_name || 'unknown'} ({s.submitter_email})
                    </p>
                  </div>

                  {s.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReview(s.id, 'approved')}
                        disabled={review.isPending}
                        className="bg-asentio-blue hover:bg-asentio-blue/90"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button variant="outline" onClick={() => handleReview(s.id, 'rejected')} disabled={review.isPending}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* Subscribers */}
      <TabsContent value="subscribers">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            {subscribersLoading ? 'Loading…' : `${subscribers?.length ?? 0} subscribers`}
          </p>
          <Button variant="outline" onClick={exportSubscribers} disabled={!subscribers?.length}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="border border-border rounded-lg divide-y divide-border">
          {(subscribers || []).map((s: Record<string, any>) => (
            <div key={s.id} className="flex items-center justify-between p-3 text-sm">
              <span className="text-foreground">{s.email}</span>
              <span className="text-muted-foreground text-xs">
                {s.source} · {new Date(s.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContentAdmin;
