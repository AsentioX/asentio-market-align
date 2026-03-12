import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useContacts, useContactNotes, useCreateContact, useUpdateContact,
  useDeleteContact, useAddNote, STAGES, CRMContact, CRMStage, NoteType,
} from '@/hooks/useCRM';
import {
  Plus, Search, Mail, Phone, Calendar, MessageSquare, Trash2,
  ExternalLink, Users, Trophy, Clock, AlertCircle, Building2,
  ChevronRight, StickyNote, PhoneCall, Video, Loader2,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────
const SOURCE_LABELS: Record<string, string> = {
  contact_form: 'Contact Form',
  manual: 'Manual',
  directory_cta: 'XR Directory',
};

function stageInfo(stage: CRMStage) {
  return STAGES.find((s) => s.key === stage) || STAGES[0];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const NOTE_TYPE_ICONS: Record<NoteType, React.ElementType> = {
  note: StickyNote,
  email: Mail,
  call: PhoneCall,
  meeting: Video,
};

// ── Contact Card ───────────────────────────────────────────────
function ContactCard({ contact, onClick }: { contact: CRMContact; onClick: () => void }) {
  const si = stageInfo(contact.stage);
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{contact.name}</p>
          {contact.company && <p className="text-xs text-muted-foreground truncate">{contact.company}</p>}
        </div>
        <Badge variant="outline" className={`text-xs shrink-0 ${si.color}`}>{si.label}</Badge>
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">{contact.email}</p>
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-xs">{SOURCE_LABELS[contact.source] || contact.source}</Badge>
        <span className="text-xs text-muted-foreground">{timeAgo(contact.created_at)}</span>
      </div>
      {contact.follow_up_date && (
        <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
          <Clock className="w-3 h-3" />
          Follow up: {new Date(contact.follow_up_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// ── Contact Detail Sheet ───────────────────────────────────────
function ContactSheet({
  contact, open, onClose,
}: { contact: CRMContact | null; open: boolean; onClose: () => void }) {
  const [noteBody, setNoteBody] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('note');
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const addNote = useAddNote();
  const { data: notes, isLoading: notesLoading } = useContactNotes(contact?.id || '');
  const { toast } = useToast();

  if (!contact) return null;

  const si = stageInfo(contact.stage);

  const handleStageChange = async (stage: string) => {
    try {
      await updateContact.mutateAsync({ id: contact.id, stage: stage as CRMStage });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleFollowUpChange = async (date: string) => {
    try {
      await updateContact.mutateAsync({ id: contact.id, follow_up_date: date || null });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleAddNote = async () => {
    if (!noteBody.trim()) return;
    try {
      await addNote.mutateAsync({ contact_id: contact.id, body: noteBody.trim(), type: noteType });
      setNoteBody('');
      toast({ title: 'Note added' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContact.mutateAsync(contact.id);
      toast({ title: 'Contact deleted' });
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground truncate">{contact.name}</p>
              {contact.company && <p className="text-sm text-muted-foreground font-normal">{contact.company}</p>}
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Contact info */}
        <div className="space-y-2 mb-6">
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <Mail className="w-4 h-4 shrink-0" /> {contact.email}
          </a>
          {contact.role && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 shrink-0" /> {contact.role}
            </p>
          )}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-4 h-4 shrink-0" />
            {SOURCE_LABELS[contact.source] || contact.source}
            {contact.source_context && <span className="text-foreground">· {contact.source_context}</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            Added {new Date(contact.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Original message */}
        {contact.message && (
          <div className="bg-muted/50 rounded-lg p-3 mb-6">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Original message</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{contact.message}</p>
          </div>
        )}

        {/* Stage + follow-up */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Stage</p>
            <Select value={contact.stage} onValueChange={handleStageChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Follow-up date</p>
            <Input
              type="date"
              className="h-9"
              defaultValue={contact.follow_up_date || ''}
              onBlur={(e) => handleFollowUpChange(e.target.value)}
            />
          </div>
        </div>

        {/* Quick email CTA */}
        <div className="flex gap-2 mb-6">
          <Button asChild size="sm" className="flex-1 bg-primary text-primary-foreground">
            <a href={`mailto:${contact.email}?subject=Following up from Asentio`}>
              <Mail className="w-4 h-4 mr-2" /> Send Email
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                <AlertDialogDescription>
                  Permanently delete {contact.name} and all their notes? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Activity timeline */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground mb-3">Activity</p>

          {/* Add note */}
          <div className="bg-muted/40 rounded-lg p-3 mb-4 space-y-2">
            <div className="flex gap-2">
              <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Log an activity or note..."
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              className="min-h-[80px] text-sm bg-background"
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!noteBody.trim() || addNote.isPending}
              className="w-full bg-primary text-primary-foreground"
            >
              {addNote.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Log Activity'}
            </Button>
          </div>

          {notesLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => {
                const Icon = NOTE_TYPE_ICONS[note.type] || StickyNote;
                return (
                  <div key={note.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-foreground capitalize">{note.type}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(note.created_at)}</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{note.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No activity yet — log the first note above.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Add Contact Modal ──────────────────────────────────────────
function AddContactDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createContact = useCreateContact();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', email: '', company: '', role: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    try {
      await createContact.mutateAsync({
        ...form,
        source: 'manual',
        source_context: null,
        stage: 'new',
        follow_up_date: null,
        tags: [],
      });
      toast({ title: 'Contact added' });
      setForm({ name: '', email: '', company: '', role: '', message: '' });
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Error', description: (e as Error).message, variant: 'destructive' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add Contact</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Company</label>
              <Input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Role / Title</label>
              <Input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder="How did you meet? What are they interested in?"
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createContact.isPending} className="flex-1 bg-primary text-primary-foreground">
              {createContact.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main CRM Dashboard ─────────────────────────────────────────
export default function CRMDashboard() {
  const { data: contacts = [], isLoading } = useContacts();
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<CRMContact | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q),
    );
  }, [contacts, search]);

  // KPIs
  const total = contacts.length;
  const won = contacts.filter((c) => c.stage === 'won').length;
  const open = contacts.filter((c) => !['won', 'lost'].includes(c.stage)).length;
  const overdue = contacts.filter((c) => c.follow_up_date && new Date(c.follow_up_date) < new Date()).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">CRM</h2>
          <p className="text-sm text-muted-foreground">Track leads and conversations</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Contact
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users,        label: 'Total Contacts', value: total,  accent: false },
          { icon: ChevronRight, label: 'Active',         value: open,   accent: false },
          { icon: Trophy,       label: 'Won',            value: won,    accent: true },
          { icon: AlertCircle,  label: 'Overdue Follow-ups', value: overdue, accent: overdue > 0 },
        ].map(({ icon: Icon, label, value, accent }) => (
          <Card key={label} className={accent ? 'border-primary/30 bg-primary/5' : ''}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold text-foreground mt-0.5">{value}</p>
                </div>
                <div className={`p-2 rounded-lg ${accent ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`w-4 h-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['pipeline', 'list'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors capitalize ${viewMode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline view */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const stageContacts = filtered.filter((c) => c.stage === stage.key);
            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{stage.label}</p>
                    <p className="text-xs text-muted-foreground">{stageContacts.length}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {stageContacts.map((c) => (
                    <ContactCard key={c.id} contact={c} onClick={() => setSelectedContact(c)} />
                  ))}
                  {stageContacts.length === 0 && (
                    <div className="border border-dashed border-border rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {search ? 'No contacts match your search.' : 'No contacts yet — add one above.'}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((c) => {
                  const si = stageInfo(c.stage);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedContact(c)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{c.name[0].toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}{c.company ? ` · ${c.company}` : ''}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs shrink-0 hidden sm:flex ${si.color}`}>{si.label}</Badge>
                      <Badge variant="secondary" className="text-xs shrink-0 hidden md:flex">{SOURCE_LABELS[c.source] || c.source}</Badge>
                      {c.follow_up_date && (
                        <span className="text-xs text-amber-600 shrink-0 hidden lg:flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.follow_up_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(c.created_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ContactSheet
        contact={selectedContact}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />
      <AddContactDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
