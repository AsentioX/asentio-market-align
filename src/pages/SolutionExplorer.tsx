import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TopographicPattern from '@/components/TopographicPattern';
import { useSeo } from '@/hooks/useSeo';
import { useXRCompanies, companyValues, HAISelections, XRCompany } from '@/hooks/useXRCompanies';
import { SOLUTION_STEPS, SOLUTION_LAYERS, dimensionByKey, HAIDimensionKey, haiValueLabel } from '@/lib/haiFramework';
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw, Building2 } from 'lucide-react';

const SolutionExplorer = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<HAISelections>({});
  const [done, setDone] = useState(false);
  const { data: companies, isLoading } = useXRCompanies({});

  useSeo({
    title: 'Solution Explorer — Build a Human-AI Stack | Asentio',
    description:
      'Start with the human activity, then walk the stack — capability, AI, interface and industry — to assemble an ecosystem of vendors for your Human-AI solution.',
    canonicalPath: '/hai-directory/solution-explorer',
  });

  const currentKey = SOLUTION_STEPS[step];
  const dimension = dimensionByKey(currentKey);

  const toggle = (key: HAIDimensionKey, value: string) => {
    const current = selections[key] || [];
    setSelections({
      ...selections,
      [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const matches = useMemo(() => {
    if (!companies) return [];
    const active = Object.entries(selections).filter(([, v]) => v && v.length) as [HAIDimensionKey, string[]][];
    if (active.length === 0) return [];
    return companies
      .map((c) => ({
        company: c,
        score: active.reduce(
          (sum, [key, values]) => sum + values.filter((v) => companyValues(c, key).includes(v)).length,
          0
        ),
      }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((m) => m.company);
  }, [companies, selections]);

  const reset = () => {
    setSelections({});
    setStep(0);
    setDone(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-36 pb-10 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          <Link to="/hai-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">Solution Explorer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything begins with the human. Walk the stack and we'll assemble the ecosystem of companies
            that could build your solution.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
        {/* Stepper */}
        <ol className="flex flex-wrap items-center gap-2 mb-8">
          {SOLUTION_STEPS.map((key, i) => {
            const d = dimensionByKey(key);
            const active = !done && i === step;
            const complete = (selections[key] || []).length > 0;
            return (
              <li key={key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setStep(i); setDone(false); }}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-asentio-red text-primary-foreground'
                      : complete
                      ? 'bg-asentio-blue/10 text-asentio-blue'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {complete && !active && <Check className="w-3 h-3" />}
                  {d.label}
                </button>
                {i < SOLUTION_STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
              </li>
            );
          })}
        </ol>

        {!done && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-asentio-red font-semibold mb-2">
              Step {step + 1} of {SOLUTION_STEPS.length}
            </p>
            <h2 className="text-2xl font-semibold text-foreground mb-1">{dimension.question}</h2>
            <p className="text-sm text-muted-foreground mb-6">{dimension.blurb} Choose any that apply.</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {dimension.values.map((value) => {
                const selected = (selections[currentKey] || []).includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle(currentKey, value)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      selected
                        ? 'border-asentio-red bg-asentio-red text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-asentio-red/50 hover:text-foreground'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={reset} className="text-xs">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Start over
              </Button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {step < SOLUTION_STEPS.length - 1 ? (
                  <Button className="bg-asentio-red hover:bg-asentio-red/90" onClick={() => setStep(step + 1)}>
                    Next <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button className="bg-asentio-red hover:bg-asentio-red/90" onClick={() => setDone(true)}>
                    Build my ecosystem
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {done && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Your Human-AI ecosystem</h2>
                <p className="text-sm text-muted-foreground">
                  {matches.length} compan{matches.length === 1 ? 'y' : 'ies'} matched across the stack.
                </p>
              </div>
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> Start over
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-8">
              {Object.entries(selections).flatMap(([key, values]) =>
                (values || []).map((v) => (
                  <Badge key={`${key}-${v}`} variant="secondary" className="text-xs">
                    {v}
                  </Badge>
                ))
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-asentio-blue" />
              </div>
            ) : matches.length === 0 ? (
              <p className="text-muted-foreground py-10">
                No companies match yet. Try broadening your selections or{' '}
                <Link to="/hai-directory" className="text-asentio-blue hover:underline">browse the full directory</Link>.
              </p>
            ) : (
              <div className="space-y-8">
                {SOLUTION_LAYERS.map((layer) => {
                  const inLayer = matches.filter((c) =>
                    companyValues(c, 'ecosystem_roles').some((r) => layer.roles.includes(r))
                  );
                  if (inLayer.length === 0) return null;
                  return (
                    <div key={layer.label}>
                      <div className="flex items-baseline gap-2 mb-3">
                        <div className="w-1 h-5 bg-asentio-red rounded-full" />
                        <h3 className="text-lg font-semibold text-foreground">{layer.label}</h3>
                        <span className="text-xs text-muted-foreground">{layer.description}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inLayer.map((c) => <MiniCompany key={c.id} company={c} />)}
                      </div>
                    </div>
                  );
                })}

                {(() => {
                  const classified = new Set(
                    SOLUTION_LAYERS.flatMap((l) =>
                      matches.filter((c) => companyValues(c, 'ecosystem_roles').some((r) => l.roles.includes(r))).map((c) => c.id)
                    )
                  );
                  const rest = matches.filter((c) => !classified.has(c.id));
                  if (rest.length === 0) return null;
                  return (
                    <div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <div className="w-1 h-5 bg-muted-foreground rounded-full" />
                        <h3 className="text-lg font-semibold text-foreground">Other matches</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rest.map((c) => <MiniCompany key={c.id} company={c} />)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

const MiniCompany = ({ company }: { company: XRCompany }) => (
  <Link
    to={`/hai-directory/company/${encodeURIComponent(company.slug || company.name)}`}
    className="group rounded-xl border border-border bg-card p-4 hover:border-asentio-red/40 hover:shadow-md transition-all block"
  >
    <div className="flex items-center gap-3 mb-2">
      {company.logo_url ? (
        <img src={company.logo_url} alt={`${company.name} logo`} loading="lazy" className="w-9 h-9 object-contain rounded bg-muted p-1" />
      ) : (
        <div className="w-9 h-9 rounded bg-muted flex items-center justify-center">
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <span className="font-medium text-foreground group-hover:text-asentio-red transition-colors">{company.name}</span>
    </div>
    {company.description && <p className="text-xs text-muted-foreground line-clamp-2">{company.description}</p>}
  </Link>
);

export default SolutionExplorer;
