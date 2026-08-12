import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XRCompany } from '@/hooks/useXRCompanies';
import { PartnerGroup, PartnerMatchResult } from '@/lib/haiMatching';

const FitStars = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-0.5 flex-shrink-0" aria-label={`Match score ${rating} of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i <= rating ? 'fill-asentio-red text-asentio-red' : 'text-muted-foreground/30'}`}
      />
    ))}
  </span>
);

export const PartnerCard = ({ match }: { match: PartnerMatchResult }) => {
  const c: XRCompany = match.item;
  const provides =
    c.description ||
    (c.ai_capabilities || []).join(', ') ||
    (c.ecosystem_roles || []).join(', ');
  const why =
    match.reasons.find((r) => r.startsWith('Different') || r.startsWith('Fills')) ||
    match.reasons[0] ||
    (match.matches[0] ? `${match.matches[0].label}: ${match.matches[0].values.join(', ')}` : '');

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 hover:border-asentio-red/40 hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-3">
        {c.logo_url ? (
          <img
            src={c.logo_url}
            alt={`${c.name} logo`}
            loading="lazy"
            className="w-10 h-10 object-contain rounded-lg bg-muted p-1 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
            {c.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground leading-tight truncate">{c.name}</p>
          <FitStars rating={match.rating} />
        </div>
      </div>

      {provides && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{provides}</p>}

      {match.sharedUseCases.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {match.sharedUseCases.slice(0, 3).map((uc) => (
            <Link key={uc.id} to={`/hai-directory/solutions/${uc.slug}`}>
              <Badge variant="secondary" className="text-[10px] hover:bg-asentio-red hover:text-primary-foreground transition-colors">
                {uc.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {why && (
        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-asentio-red/40 pl-3 mb-4">
          {why}
        </p>
      )}

      <div className="mt-auto">
        <Link to={`/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`}>
          <Button variant="ghost" size="sm" className="px-0 text-asentio-blue hover:text-asentio-red">
            View company <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

interface Props {
  companyName: string;
  groups: PartnerGroup[];
}

/** "Who should they work with?" — complementary partners, grouped by what they add. */
const CompanyPartners = ({ companyName, groups }: Props) => {
  if (groups.length === 0) return null;

  return (
    <section id="partners" className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Who should they work with?</h2>
        <p className="text-muted-foreground max-w-2xl mb-10">
          Companies that complete what {companyName} cannot deliver alone — matched on complementary
          capabilities, not similarity.
        </p>

        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-asentio-red mb-4">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.partners.map((m) => (
                  <PartnerCard key={m.item.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link to="/hai-directory/partner-finder">
            <Button className="bg-asentio-blue hover:bg-asentio-blue/90">
              Explore all partner matches <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompanyPartners;
