import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { XRCompany } from '@/hooks/useXRCompanies';
import { HAIUseCase } from '@/hooks/useHAIUseCases';
import { MatchResult, PartnerMatchResult } from '@/lib/haiMatching';
import { PartnerCard } from '@/components/directory/company/CompanyPartners';

const SimilarCard = ({ match }: { match: MatchResult<XRCompany> }) => {
  const c = match.item;
  return (
    <Link
      to={`/hai-directory/company/${encodeURIComponent(c.slug || c.name)}`}
      className="group rounded-2xl border border-border bg-card p-5 hover:border-asentio-red/40 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        {c.logo_url ? (
          <img
            src={c.logo_url}
            alt={`${c.name} logo`}
            loading="lazy"
            className="w-10 h-10 object-contain rounded-lg bg-muted p-1"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
            {c.name.charAt(0)}
          </div>
        )}
        <span className="font-semibold text-foreground group-hover:text-asentio-red transition-colors">
          {c.name}
        </span>
      </div>
      {c.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
      <div className="flex flex-wrap gap-1.5">
        {match.matches.slice(0, 2).map((m) => (
          <Badge key={m.key} variant="secondary" className="text-[10px]">
            {m.label}
          </Badge>
        ))}
      </div>
    </Link>
  );
};

const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-muted-foreground py-6">{text}</p>
);

interface Props {
  companyName: string;
  partners: PartnerMatchResult[];
  similar: MatchResult<XRCompany>[];
  solutionPartners: PartnerMatchResult[];
  useCases?: HAIUseCase[];
}

/** "Explore the ecosystem" — partners, look-alikes and full-solution combinations. */
const CompanyEcosystem = ({ companyName, partners, similar, solutionPartners }: Props) => {
  if (partners.length === 0 && similar.length === 0 && solutionPartners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="w-12 h-1 bg-asentio-red mb-4" />
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Explore the ecosystem</h2>
      <p className="text-muted-foreground max-w-2xl mb-8">
        Who complements {companyName}, who competes with it, and who combines with it to deliver a
        complete Human + AI solution.
      </p>

      <Tabs defaultValue="partners">
        <TabsList className="mb-6">
          <TabsTrigger value="partners">Potential partners</TabsTrigger>
          <TabsTrigger value="similar">Similar companies</TabsTrigger>
          <TabsTrigger value="solution">Solution partners</TabsTrigger>
        </TabsList>

        <TabsContent value="partners">
          <p className="text-sm text-muted-foreground mb-5">Companies providing complementary capabilities.</p>
          {partners.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {partners.map((m) => (
                <PartnerCard key={m.item.id} match={m} />
              ))}
            </div>
          ) : (
            <Empty text="No complementary companies in the directory yet." />
          )}
        </TabsContent>

        <TabsContent value="similar">
          <p className="text-sm text-muted-foreground mb-5">
            Companies offering similar products or capabilities — likely competitors.
          </p>
          {similar.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((m) => (
                <SimilarCard key={m.item.id} match={m} />
              ))}
            </div>
          ) : (
            <Empty text="No close look-alikes in the directory yet." />
          )}
        </TabsContent>

        <TabsContent value="solution">
          <p className="text-sm text-muted-foreground mb-5">
            Companies that combine with {companyName} to deliver a complete solution for a shared use case.
          </p>
          {solutionPartners.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {solutionPartners.map((m) => (
                <PartnerCard key={m.item.id} match={m} />
              ))}
            </div>
          ) : (
            <Empty text="No shared-use-case combinations found yet." />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default CompanyEcosystem;
