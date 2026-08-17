import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TopographicPattern from '@/components/TopographicPattern';
import ARBackground from '@/components/ARBackground';
import { useSeo } from '@/hooks/useSeo';
import { useXRCompanies } from '@/hooks/useXRCompanies';
import { useHAIUseCases } from '@/hooks/useHAIUseCases';
import { HAVE_OPTIONS, NEED_OPTIONS, findPartners, PartnerMatchResult } from '@/lib/haiMatching';
import { SOLUTION_LAYERS } from '@/lib/haiFramework';
import { trackPageView, trackEvent } from '@/lib/analytics';

const FitStars = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`Fit ${rating} of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i <= rating ? 'fill-asentio-red text-asentio-red' : 'text-muted-foreground/30'}`}
      />
    ))}
  </span>
);

const PartnerCard = ({ match }: { match: PartnerMatchResult }) => {
  const c = match.item;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-asentio-red/40 hover:shadow-md">
      <div className="flex items-start gap-4">
        {c.logo_url ? (
          <img
            src={c.logo_url}
            alt={`${c.name} logo`}
            className="w-12 h-12 rounded-lg object-contain bg-background border border-border p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-muted-foreground">{c.name.charAt(0)}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`}
              className="font-semibold text-foreground hover:text-asentio-red transition-colors"
            >
              {c.name}
            </Link>
          </div>
          {c.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.description}</p>}
        </div>
      </div>

      {match.reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
          {match.reasons.slice(0, 3).map((r) => (
            <li key={r} className="text-xs text-muted-foreground flex gap-2">
              <span className="text-asentio-red">—</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

const OptionGrid = ({
  options,
  value,
  onSelect,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onSelect: (v: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onSelect(o.value)}
        className={`rounded-full border px-4 py-2 text-sm transition-all ${
          value === o.value
            ? 'border-asentio-red bg-asentio-red text-white'
            : 'border-border bg-card text-foreground hover:border-asentio-red/50'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const PartnerFinder = () => {
  const [have, setHave] = useState<string>();
  const [need, setNeed] = useState<string>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data: companies, isLoading } = useXRCompanies({});
  const { data: useCases } = useHAIUseCases();

  useSeo({
    title: 'Partner Finder — Find Your Human + AI Partners | Asentio',
    description:
      'Tell us what you build and what you are missing. The Asentio Partner Finder matches you with complementary companies across the Human + AI ecosystem.',
    canonicalPath: '/hai-directory/partner-finder',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView('/hai-directory/partner-finder');
  }, []);

  useEffect(() => {
    if (have && need) {
      trackEvent('partner_finder_query', { have, need }, '/hai-directory/partner-finder');
    }
  }, [have, need]);

  const results = useMemo(
    () => findPartners(companies, have, need, useCases),
    [companies, have, need, useCases]
  );

  const groupedResults = useMemo(() => {
    const top = results.slice(0, 24);
    const groups = SOLUTION_LAYERS.map((layer) => ({
      label: layer.label,
      description: layer.description,
      matches: top.filter((m) =>
        ((m.item.ecosystem_roles as string[] | null) || []).some((r) => layer.roles.includes(r))
      ),
    }));
    const categorized = new Set(groups.flatMap((g) => g.matches.map((m) => m.item.id)));
    const other = top.filter((m) => !categorized.has(m.item.id));
    if (other.length > 0) {
      groups.push({
        label: 'Other',
        description: 'Companies without a defined ecosystem role yet.',
        matches: other,
      });
    }
    return groups.filter((g) => g.matches.length > 0);
  }, [results]);


  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-28 md:pt-36 pb-12 bg-[#0a0f1f] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1f] via-[#111a2e] to-[#0a0f1f]" />
        <TopographicPattern variant="darkBg" className="opacity-50" />
        <ARBackground />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl">
          <Link
            to="/hai-directory"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> HAI Directory
          </Link>
          <div className="w-12 h-1 bg-asentio-red mb-5" />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Partner Finder</h1>
          <p className="text-lg text-white/70 max-w-2xl">
            Nobody builds the Human + AI stack alone. Tell us what you already have and what you need, and
            we will show you who completes it.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-asentio-red font-semibold mb-3">I have</p>
            <OptionGrid options={HAVE_OPTIONS} value={have} onSelect={setHave} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-asentio-red font-semibold mb-3">I need</p>
            <OptionGrid options={NEED_OPTIONS} value={need} onSelect={setNeed} />
          </div>
          {(have || need) && (
            <button
              type="button"
              onClick={() => {
                setHave(undefined);
                setNeed(undefined);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3" /> Start over
            </button>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 pb-20 max-w-7xl">
        {!have && !need ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Choose at least one option above to see matches.
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No strong matches yet for that combination. Try a broader need.
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {results.length} potential partner{results.length !== 1 ? 's' : ''}
            </h2>
            <p className="text-muted-foreground mb-8">
              Grouped by where they sit in the Human + AI solution stack, ranked by how well they
              complement what you already build.
            </p>
            <div className="space-y-3">
              {groupedResults.map((group) => {
                const isOpen = expanded[group.label] ?? false;
                return (
                  <div key={group.label} className="rounded-xl border border-border bg-card/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpanded((p) => ({ ...p, [group.label]: !isOpen }))}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground truncate">{group.label}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{group.matches.length}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1">
                        <p className="text-sm text-muted-foreground mb-5">{group.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {group.matches.map((m) => (
                            <PartnerCard key={m.item.id} match={m} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default PartnerFinder;
