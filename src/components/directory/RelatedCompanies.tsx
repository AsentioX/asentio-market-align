import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { XRCompany, companyValues } from '@/hooks/useXRCompanies';
import { Badge } from '@/components/ui/badge';
import { HAIDimensionKey } from '@/lib/haiFramework';

interface RelatedCompaniesProps {
  company: XRCompany;
  all: XRCompany[] | undefined;
}

const overlap = (a: string[], b: string[]) => a.filter((v) => b.includes(v));

const WEIGHTS: { key: HAIDimensionKey; weight: number; reason: string }[] = [
  { key: 'human_activities', weight: 4, reason: 'Similar human activities' },
  { key: 'ai_capabilities', weight: 3, reason: 'Similar AI capabilities' },
  { key: 'human_interface', weight: 3, reason: 'Similar interface' },
  { key: 'industry_focus', weight: 2, reason: 'Same industry' },
  { key: 'human_capabilities', weight: 2, reason: 'Augments the same human capability' },
  { key: 'physical_platforms', weight: 1, reason: 'Similar platform' },
];

const RelatedCompanies = ({ company, all }: RelatedCompaniesProps) => {
  const related = useMemo(() => {
    if (!all) return [];
    return all
      .filter((c) => c.id !== company.id)
      .map((c) => {
        let score = 0;
        const reasons: string[] = [];
        for (const { key, weight, reason } of WEIGHTS) {
          const shared = overlap(companyValues(company, key), companyValues(c, key));
          if (shared.length > 0) {
            score += shared.length * weight;
            reasons.push(reason);
          }
        }
        // Complementary ecosystem roles: same space, different job.
        const myRoles = companyValues(company, 'ecosystem_roles');
        const theirRoles = companyValues(c, 'ecosystem_roles');
        if (score > 0 && myRoles.length && theirRoles.length && overlap(myRoles, theirRoles).length === 0) {
          score += 3;
          reasons.push('Complementary ecosystem role');
        }
        return { company: c, score, reasons: reasons.slice(0, 2) };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [all, company]);

  if (related.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6 pb-16">
      <div className="w-12 h-1 bg-asentio-red mb-4" />
      <h2 className="text-xl font-semibold text-foreground mb-1">Related companies</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Companies sharing activities, capabilities, interfaces or industries with {company.name}.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map(({ company: c, reasons }) => (
          <Link
            key={c.id}
            to={`/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`}
            className="group rounded-xl border border-border bg-card p-4 hover:border-asentio-red/40 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              {c.logo_url ? (
                <img src={c.logo_url} alt={`${c.name} logo`} loading="lazy" className="w-9 h-9 object-contain rounded bg-muted p-1" />
              ) : (
                <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {c.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-foreground group-hover:text-asentio-red transition-colors">{c.name}</span>
            </div>
            {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px]">{r}</Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedCompanies;
