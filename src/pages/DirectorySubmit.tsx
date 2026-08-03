import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSubmitCompany, SubmissionInput } from '@/hooks/useAsentioContent';
import { useXRCompanies } from '@/hooks/useXRCompanies';
import { useSeo } from '@/hooks/useSeo';
import TopographicPattern from '@/components/TopographicPattern';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  TAXONOMY,
  ALL_CATEGORIES,
  AI_XR_FILTERS,
  HUMAN_INTERFACE_MODES,
  COMPANY_TYPES,
  FUNDING_STAGES,
} from '@/lib/xrTaxonomy';
import { trackPageView } from '@/lib/analytics';

const DirectorySubmit = () => {
  const [searchParams] = useSearchParams();
  const submit = useSubmitCompany();
  const { data: companies } = useXRCompanies();

  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    company_name: searchParams.get('company') || '',
    website: '',
    description: '',
    hq_location: '',
    company_type: '',
    primary_category: '',
    funding_stage: '',
    products_summary: '',
    submitter_name: '',
    submitter_email: '',
    submitter_role: '',
  });
  const [aiCaps, setAiCaps] = useState<string[]>([]);
  const [interfaces, setInterfaces] = useState<string[]>([]);

  useSeo({
    title: 'Add Your Company to the HAI Directory | Asentio',
    description:
      'Submit your XR, AI, wearables or component company to the Asentio HAI Directory.',
    canonicalPath: '/hai-directory/submit',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/hai-directory/submit');
  }, []);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.submitter_email.includes('@')) {
      toast({ title: 'Company name and a valid email are required', variant: 'destructive' });
      return;
    }

    const payload: SubmissionInput = {
      submission_type: 'new_company',
      company_name: form.company_name.trim(),
      website: form.website || null,
      description: form.description || null,
      hq_location: form.hq_location || null,
      company_type: form.company_type || null,
      primary_category: form.primary_category || null,
      ai_capabilities: aiCaps,
      human_interface: interfaces,
      products_summary: form.products_summary || null,
      funding_stage: form.funding_stage || null,
      submitter_name: form.submitter_name || null,
      submitter_email: form.submitter_email || null,
      submitter_role: form.submitter_role || null,
      existing_company_id: null,
      source: 'directory-submit',
    };

    try {
      await submit.mutateAsync(payload);
      setDone(true);
      window.scrollTo(0, 0);
    } catch {
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
          <CheckCircle2 className="w-12 h-12 text-asentio-red mx-auto mb-5" />
          <h1 className="text-3xl font-bold text-foreground mb-3">Submission received</h1>
          <p className="text-muted-foreground mb-8">
            Thanks — Asentio reviews every submission by hand. If we need anything else we'll email you
            at {form.submitter_email}.
          </p>
          <Link to="/hai-directory">
            <Button className="bg-asentio-blue hover:bg-asentio-blue/90 px-6 py-5">
              Back to the HAI Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-36 pb-8 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link to="/hai-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="w-4 h-4" /> HAI Directory
          </Link>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
            Add your company
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
            The Asentio HAI Directory is curated. Tell us what you build and where you sit in the stack —
            we review every submission before publishing.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
          {/* Company */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Company</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company name *</Label>
                <Input
                  id="company_name"
                  required
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">What does the company do?</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hq">HQ location</Label>
                <Input
                  id="hq"
                  value={form.hq_location}
                  onChange={(e) => setForm({ ...form, hq_location: e.target.value })}
                />
              </div>
              <div>
                <Label>Company type</Label>
                <Select value={form.company_type} onValueChange={(v) => setForm({ ...form, company_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {COMPANY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Funding stage</Label>
                <Select value={form.funding_stage} onValueChange={(v) => setForm({ ...form, funding_stage: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    {FUNDING_STAGES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Placement in the stack */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Where you sit in the stack</h2>

            <div>
              <Label>Primary category</Label>
              <Select value={form.primary_category} onValueChange={(v) => setForm({ ...form, primary_category: v })}>
                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-72">
                  {TAXONOMY.map((g) => (
                    <div key={g.slug}>
                      <div className="px-2 py-1.5 text-xs uppercase tracking-wide text-muted-foreground">{g.label}</div>
                      {g.children.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {ALL_CATEGORIES.length} categories across six layers.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">AI capabilities</Label>
              <div className="flex flex-wrap gap-2">
                {AI_XR_FILTERS.map((cap) => (
                  <Badge
                    key={cap}
                    onClick={() => toggle(aiCaps, setAiCaps, cap)}
                    className={`cursor-pointer ${
                      aiCaps.includes(cap)
                        ? 'bg-asentio-red text-white hover:bg-asentio-red/90'
                        : 'bg-muted text-muted-foreground hover:text-asentio-blue'
                    }`}
                  >
                    {cap}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Human interface</Label>
              <div className="flex flex-wrap gap-2">
                {HUMAN_INTERFACE_MODES.map((mode2) => (
                  <Badge
                    key={mode2}
                    onClick={() => toggle(interfaces, setInterfaces, mode2)}
                    className={`cursor-pointer ${
                      interfaces.includes(mode2)
                        ? 'bg-asentio-red text-white hover:bg-asentio-red/90'
                        : 'bg-muted text-muted-foreground hover:text-asentio-blue'
                    }`}
                  >
                    {mode2}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="products">Key products</Label>
              <Textarea
                id="products"
                rows={2}
                placeholder="Product names and one line on each"
                value={form.products_summary}
                onChange={(e) => setForm({ ...form, products_summary: e.target.value })}
              />
            </div>
          </div>

          {/* Submitter */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">About you</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={form.submitter_name} onChange={(e) => setForm({ ...form, submitter_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.submitter_email}
                  onChange={(e) => setForm({ ...form, submitter_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={form.submitter_role} onChange={(e) => setForm({ ...form, submitter_role: e.target.value })} />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submit.isPending}
            className="bg-asentio-blue hover:bg-asentio-blue/90 px-8 py-6 text-base"
          >
            {submit.isPending ? 'Submitting…' : 'Submit company'}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default DirectorySubmit;
