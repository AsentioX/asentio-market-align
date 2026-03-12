import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useCaseStudies,
  useCreateCaseStudy,
  useUpdateCaseStudy,
  useDeleteCaseStudy,
  CASE_STUDY_TAGS,
  CaseStudy,
} from '@/hooks/useCaseStudies';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Plus, Trash2, Pencil, Loader2, GripVertical, ExternalLink, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const EMPTY_FORM = {
  company: '',
  website: '',
  description: '',
  image: '',
  image_zoom: 1,
  image_position: 'center',
  challenge: '',
  what_we_did: '',
  tags: [] as string[],
  sort_order: 0,
  is_active: true,
};

type FormState = typeof EMPTY_FORM;

const CaseStudiesAdmin = () => {
  const { data: caseStudies, isLoading } = useCaseStudies();
  const createCS = useCreateCaseStudy();
  const updateCS = useUpdateCaseStudy();
  const deleteCS = useDeleteCaseStudy();
  const { toast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sort_order: (caseStudies?.length || 0) + 1 });
    setSheetOpen(true);
  };

  const openEdit = (cs: CaseStudy) => {
    setEditing(cs);
    setForm({
      company: cs.company,
      website: cs.website || '',
      description: cs.description,
      image: cs.image || '',
      image_zoom: cs.image_zoom ?? 1,
      image_position: cs.image_position || 'center',
      challenge: cs.challenge || '',
      what_we_did: cs.what_we_did || '',
      tags: cs.tags || [],
      sort_order: cs.sort_order,
      is_active: cs.is_active,
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!form.company.trim() || !form.description.trim()) {
      toast({ title: 'Required fields missing', description: 'Company and description are required.', variant: 'destructive' });
      return;
    }
    const payload = {
      company: form.company.trim(),
      website: form.website.trim() || null,
      description: form.description.trim(),
      image: form.image.trim() || null,
      image_zoom: form.image_zoom,
      image_position: form.image_position.trim() || 'center',
      challenge: form.challenge.trim() || null,
      what_we_did: form.what_we_did.trim() || null,
      tags: form.tags,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await updateCS.mutateAsync({ id: editing.id, ...payload });
        toast({ title: 'Case study updated' });
      } else {
        await createCS.mutateAsync(payload);
        toast({ title: 'Case study created' });
      }
      setSheetOpen(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (cs: CaseStudy) => {
    try {
      await deleteCS.mutateAsync(cs.id);
      toast({ title: 'Case study deleted', description: `${cs.company} removed.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const addTag = (tag: string) => {
    if (!form.tags.includes(tag)) setForm(f => ({ ...f, tags: [...f.tags, tag] }));
  };
  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  const addCustomTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { addTag(t); setTagInput(''); }
  };

  const isSaving = createCS.isPending || updateCS.isPending;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Case Studies</CardTitle>
            <Button className="bg-asentio-blue hover:bg-asentio-blue/90" onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />Add Case Study
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
            </div>
          ) : caseStudies && caseStudies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground w-8"></th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Website</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Tags</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Active</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudies.map((cs) => (
                    <tr key={cs.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 text-muted-foreground">
                        <GripVertical className="w-4 h-4" />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{cs.company}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{cs.description}</p>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {cs.website ? (
                          <a href={cs.website} target="_blank" rel="noopener noreferrer" className="text-asentio-blue hover:underline flex items-center gap-1 text-sm">
                            <ExternalLink className="w-3 h-3" />Website
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {cs.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                          {(cs.tags?.length || 0) > 3 && (
                            <span className="text-xs text-muted-foreground">+{cs.tags!.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <Badge variant={cs.is_active ? 'default' : 'outline'} className={cs.is_active ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                          {cs.is_active ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(cs)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Case Study</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{cs.company}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(cs)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No case studies yet</p>
              <Button className="bg-asentio-blue hover:bg-asentio-blue/90" onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" />Add Your First Case Study
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit / Create Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? `Edit: ${editing.company}` : 'New Case Study'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 mt-6">
            {/* Company + Website row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. BleeqUp" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="One-line summary" rows={2} />
            </div>

            {/* Challenge */}
            <div className="space-y-1.5">
              <Label htmlFor="challenge">Challenge</Label>
              <Textarea id="challenge" value={form.challenge} onChange={e => setForm(f => ({ ...f, challenge: e.target.value }))} placeholder="What problem did the client face?" rows={3} />
            </div>

            {/* What We Did */}
            <div className="space-y-1.5">
              <Label htmlFor="what_we_did">What We Did</Label>
              <Textarea id="what_we_did" value={form.what_we_did} onChange={e => setForm(f => ({ ...f, what_we_did: e.target.value }))} placeholder="How did Asentio help?" rows={3} />
            </div>

            {/* Image + Image Zoom + Position */}
            <div className="space-y-1.5">
              <Label htmlFor="image">Image Path / URL</Label>
              <Input id="image" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="/images/company.jpg or https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="image_zoom">Image Zoom (1 = normal)</Label>
                <Input id="image_zoom" type="number" step="0.1" min="1" max="3" value={form.image_zoom} onChange={e => setForm(f => ({ ...f, image_zoom: parseFloat(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image_position">Image Position</Label>
                <Input id="image_position" value={form.image_position} onChange={e => setForm(f => ({ ...f, image_position: e.target.value }))} placeholder="center, top, center 70%" />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Services / Tags</Label>
              {/* Current tags */}
              <div className="flex flex-wrap gap-2 min-h-8">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              {/* Preset tags */}
              <div className="flex flex-wrap gap-1.5">
                {CASE_STUDY_TAGS.filter(t => !form.tags.includes(t)).map(tag => (
                  <button key={tag} onClick={() => addTag(tag)} className="text-xs px-2 py-1 rounded-full border border-border hover:border-asentio-blue/50 hover:bg-asentio-blue/5 text-muted-foreground hover:text-foreground transition-colors">
                    + {tag}
                  </button>
                ))}
              </div>
              {/* Custom tag */}
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomTag())} placeholder="Custom tag..." className="h-8 text-sm" />
                <Button type="button" variant="outline" size="sm" onClick={addCustomTag}>Add</Button>
              </div>
            </div>

            {/* Sort order + Active */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input id="sort_order" type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch id="is_active" checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <Label htmlFor="is_active">Show on Services page</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-asentio-blue hover:bg-asentio-blue/90" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Case Study'}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CaseStudiesAdmin;
