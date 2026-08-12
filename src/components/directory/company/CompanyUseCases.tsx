import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { XRCompany } from '@/hooks/useXRCompanies';
import { HAIUseCase } from '@/hooks/useHAIUseCases';
import { MatchResult } from '@/lib/haiMatching';
import { UseCaseIcon } from '@/components/directory/UseCaseSolutionCard';

interface Props {
  companyName: string;
  company: XRCompany;
  useCases: MatchResult<HAIUseCase>[];
}

/** "What They Enable" — concrete human use cases, the front door to the page. */
const CompanyUseCases = ({ companyName, useCases }: Props) => {
  if (useCases.length === 0) return null;

  return (
    <section id="use-cases" className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="w-12 h-1 bg-asentio-red mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">What they enable</h2>
        <p className="text-muted-foreground max-w-2xl mb-8">
          Real-world problems {companyName}'s technology helps solve. Open one to see every company,
          product and technology that contributes to the solution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.slice(0, 8).map(({ item: uc }) => (
            <Link
              key={uc.id}
              to={`/hai-directory/solutions/${uc.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-asentio-red/50 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-asentio-blue group-hover:bg-asentio-red/10 group-hover:text-asentio-red transition-colors">
                  <UseCaseIcon name={uc.icon} className="w-5 h-5" />
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-foreground leading-snug mb-1.5 group-hover:text-asentio-red transition-colors">
                {uc.name}
              </h3>
              {uc.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">{uc.summary}</p>
              )}
              <p className="mt-4 text-[11px] uppercase tracking-wide text-muted-foreground">{uc.domain}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyUseCases;
