import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { XRCompany, companyValues } from '@/hooks/useXRCompanies';
import { HAIUseCase } from '@/hooks/useHAIUseCases';
import { MatchResult } from '@/lib/haiMatching';

interface Props {
  company: XRCompany;
  companyName: string;
  useCases: MatchResult<HAIUseCase>[];
}

const Step = ({ label, values }: { label: string; values: string[] }) => (
  <div className="flex-1 min-w-[140px]">
    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-medium text-foreground">{values.join(' + ') || '—'}</p>
  </div>
);

/** "How this company fits into Human + AI" — the intelligence behind the matches. */
const CompanySolutionFit = ({ company, companyName, useCases }: Props) => {
  const rows = useCases.slice(0, 3);
  if (rows.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="w-12 h-1 bg-asentio-red mb-4" />
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
        How {companyName} fits into Human + AI
      </h2>
      <p className="text-sm text-muted-foreground max-w-2xl mb-8">
        Why this company appears in these use cases and partner searches.
      </p>

      <div className="space-y-3">
        {rows.map(({ item: uc, matches }) => {
          const pick = (key: string) =>
            matches.find((m) => m.key === key)?.values.slice(0, 2) ||
            companyValues(company, key as never).slice(0, 2);
          return (
            <Link
              key={uc.id}
              to={`/hai-directory/solutions/${uc.slug}`}
              className="group flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-2 rounded-xl border border-border bg-card px-5 py-4 hover:border-asentio-red/40 transition-colors"
            >
              <div className="lg:w-56 flex-shrink-0">
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Human use case</p>
                <p className="font-semibold text-foreground group-hover:text-asentio-red transition-colors">
                  {uc.name}
                </p>
              </div>
              <ChevronRight className="hidden lg:block w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <Step label="Human capabilities" values={pick('human_capabilities')} />
              <ChevronRight className="hidden lg:block w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <Step label="AI capabilities" values={pick('ai_capabilities')} />
              <ChevronRight className="hidden lg:block w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <Step label="Human interfaces" values={pick('human_interface')} />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CompanySolutionFit;
