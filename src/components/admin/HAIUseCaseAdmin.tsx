import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useHAIUseCases,
  useUpsertUseCase,
  useDeleteUseCaseRecord,
  HAIUseCase,
} from '@/hooks/useHAIUseCases';
import { HAI_DIMENSIONS, HAIDimensionKey } from '@/lib/haiFramework';
import { Pencil, Plus, Trash2, Loader2 } from 'lucide-react';

const FRAMEWORK_KEYS: HAIDimensionKey[] = [
  'human_activities',
  'human_capabilities',
  'ai_capabilities',
  'human_interface',
  'industry_focus',
  'ecosystem_roles',
];

type Draft = Partial<HAIUseCase> & { slug: string; name: string; domain: string };

const emptyDraft = (): Draft => ({
  slug: '',
  name: '',
  domain: '',
  summary: '',
  description: '',
  icon: '',
  display_order: 0,
  is_featured: false,
  human_activities: [],
  human_capabilities: [],
  ai_capabilities: [],
  human_interface: [],
  industry_focus: [],
  ecosystem_roles: [],
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const HAIUseCaseAdmin = () => {
  const { data: useCases, isLoading } = useHAIUseCases();
  const upsert = useUpsertUseCase();
  const remove = useDeleteUseCaseRecord();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return useCases || [];
    return (useCases || []).filter((u) =>
      `${u.name} ${u.domain}`.toLowerCase().includes(q)
    );
  }, [useCases, search]);

  const startNew = () => {
    setDraft(emptyDraft());
    setOpen(true);
  };

  const startEdit = (uc: HAIUseCase) => {
    setDraft({ ...uc });
    setOpen(true);
  };

  const toggleValue = (key: HAIDimensionKey, value: string) => {
    const current = ((draft as unknown as Record<string, string[] | null>)[key] || []) as string[];
    setDraft({
      ...draft,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const save = async () => {
    if (!draft.name || !draft.domain) {
      toast({ title: 'Name and domain are required', variant: 'destructive' });
      return;
    }
    try {
      await upsert.mutateAsync({ ...draft, slug: draft.slug || slugify(draft.name) });
      toast({ title: 'Use case saved' });
      setOpen(false);
    } catch (e) {
      toast({ title: 'Could not save', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = async (uc: HAIUseCase) => {
    if (!confirm(`Delete "${uc.name}"?`)) return;
    try {
      await remove.mutateAsync(uc.id);
      toast({ title: 'Use case deleted' });
    } catch (e) {
      toast({ title: 'Could not delete', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Human Use Cases</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            The solution discovery layer. Framework tags drive every match on the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-48"
          />
          <Button onClick={startNew} className="bg-asentio-red hover:bg-asentio-red/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Order</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Domain</th>
                  <th className="py-2 pr-4 font-medium">Activities</th>
                  <th className="py-2 pr-4 font-medium">Featured</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((uc) => (
                  <tr key={uc.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-muted-foreground">{uc.display_order}</td>
                    <td className="py-2 pr-4 font-medium text-foreground">{uc.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{uc.domain}</td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {(uc.human_activities || []).slice(0, 3).map((a) => (
                          <Badge key={a} variant="secondary" className="text-[10px]">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{uc.is_featured ? 'Yes' : '—'}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(uc)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(uc)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Edit use case' : 'New use case'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                      slug: draft.id ? draft.slug : slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Domain</label>
                <Input value={draft.domain} onChange={(e) => setDraft({ ...draft, domain: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Icon (Lucide name)</label>
                <Input
                  value={draft.icon || ''}
                  onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                  placeholder="Wrench"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Display order</label>
                <Input
                  type="number"
                  value={draft.display_order ?? 0}
                  onChange={(e) => setDraft({ ...draft, display_order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={!!draft.is_featured}
                  onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
                />
                <span className="text-sm text-foreground">Featured</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Summary</label>
              <Textarea
                rows={2}
                value={draft.summary || ''}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                rows={5}
                value={draft.description || ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>

            {FRAMEWORK_KEYS.map((key) => {
              const dimension = HAI_DIMENSIONS.find((d) => d.key === key)!;
              const selected = ((draft as unknown as Record<string, string[] | null>)[key] || []) as string[];
              return (
                <div key={key}>
                  <p className="text-xs font-medium text-muted-foreground mb-2">{dimension.label}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dimension.values.map((v) => (
                      <label key={v} className="flex items-center gap-2 text-sm text-foreground">
                        <Checkbox checked={selected.includes(v)} onCheckedChange={() => toggleValue(key, v)} />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={upsert.isPending}
              className="bg-asentio-red hover:bg-asentio-red/90 text-white"
            >
              {upsert.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HAIUseCaseAdmin;
