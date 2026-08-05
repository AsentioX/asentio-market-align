import { Link } from 'react-router-dom';
import { Star, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { XRCompany } from '@/hooks/useXRCompanies';
import { useHAIUseCases } from '@/hooks/useHAIUseCases';
import { useCasesForCompany, partnersForCompany } from '@/lib/haiMatching';
import { UseCaseIcon } from '@/components/directory/UseCaseSolutionCard';

const FitStars = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`Fit ${rating} of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i <= rating ? 'fill-asentio-red text-asentio-red' : 'text-muted-foreground/30'}`}
      />
    ))}
  </span>
);

interface Props {
  company: XRCompany;
  allCompanies?: XRCompany[];
}

/** Human use cases supported + best partner matches, both derived from framework tags. */
const CompanyHAIExtras = ({ company, allCompanies }: Props) => {
  const { data: useCases } = useHAIUseCases();
  const supported = useCasesForCompany(company, useCases);
  const partners = partnersForCompany(company, allCompanies, useCases);

  return (
    <>
      {supported.length > 0 && (
        <section className="border-y border-border bg-muted/40">
          <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
            <div className="w-12 h-1 bg-asentio-red mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" /> Human use cases supported
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Where {company.name} fits into what people are actually trying to accomplish.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supported.map(({ item: uc, matches }) => (
                <Link
                  key={uc.id}
                  to={`/hai-directory/solutions/${uc.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 hover:border-asentio-red/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-asentio-blue group-hover:text-asentio-red transition-colors">
                      <UseCaseIcon name={uc.icon} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{uc.domain}</p>
                      <p className="font-semibold text-foreground text-sm group-hover:text-asentio-red transition-colors">
                        {uc.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {matches.slice(0, 2).flatMap((m) =>
                      m.values.slice(0, 2).map((v) => (
                        <Badge key={`${m.key}-${v}`} variant="secondary" className="text-[10px]">
                          {v}
                        </Badge>
                      ))
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-1">Best partner matches</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Companies that complete what {company.name} cannot deliver alone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((m) => (
              <div key={m.item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link
                    to={`/hai-directory/company/${encodeURIComponent(m.item.slug || m.item.name)}`}
                    className="font-semibold text-foreground text-sm hover:text-asentio-red transition-colors"
                  >
                    {m.item.name}
                  </Link>
                  <FitStars rating={m.rating} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {m.reasons[0] ||
                    (m.matches[0] ? `${m.matches[0].label}: ${m.matches[0].values.join(', ')}` : '')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default CompanyHAIExtras;
