import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { HAIUseCase } from '@/hooks/useHAIUseCases';

export const UseCaseIcon = ({ name, className }: { name?: string | null; className?: string }) => {
  const Fallback = Icons.Circle;
  const Comp = (name && (Icons as unknown as Record<string, typeof Fallback>)[name]) || Fallback;
  return <Comp className={className} />;
};

interface Props {
  useCase: HAIUseCase;
  companyCount?: number;
}

const UseCaseSolutionCard = ({ useCase, companyCount }: Props) => (
  <Link
    to={`/hai-directory?tab=companies&useCase=${useCase.slug}`}
    className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-asentio-red/50 hover:shadow-lg"
  >
    <div className="flex items-start justify-between mb-4">
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-muted text-asentio-blue group-hover:bg-asentio-red/10 group-hover:text-asentio-red transition-colors">
        <UseCaseIcon name={useCase.icon} className="w-5 h-5" />
      </span>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <h3 className="text-lg font-semibold text-foreground leading-snug mb-2">{useCase.name}</h3>
    {useCase.summary && (
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{useCase.summary}</p>
    )}

    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wide text-muted-foreground">
      {(useCase.human_activities || []).slice(0, 3).map((a) => (
        <span key={a}>{a}</span>
      ))}
      {typeof companyCount === 'number' && companyCount > 0 && (
        <span className="text-asentio-red font-semibold normal-case tracking-normal">
          {companyCount} companies
        </span>
      )}
    </div>
  </Link>
);

export default UseCaseSolutionCard;
