import { XRUseCase } from '@/hooks/useXRUseCases';
import UseCaseCard from './UseCaseCard';
import { Loader2 } from 'lucide-react';

interface UseCaseGridProps {
  useCases: XRUseCase[] | undefined;
  isLoading: boolean;
}

const UseCaseGrid = ({ useCases, isLoading }: UseCaseGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!useCases || useCases.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No use cases found matching your criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const editorsPicks = useCases.filter(u => u.is_editors_pick);
  const regularUseCases = useCases.filter(u => !u.is_editors_pick);

  return (
    <div className="space-y-12">
      {/* Editor's Picks Section */}
      {editorsPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-asentio-blue rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">Featured Use Cases</h2>
            <span className="text-sm text-muted-foreground">({editorsPicks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorsPicks.map((useCase) => (
              <UseCaseCard key={useCase.id} useCase={useCase} />
            ))}
          </div>
        </section>
      )}

      {/* All Use Cases Section */}
      {regularUseCases.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">All Use Cases</h2>
            <span className="text-sm text-muted-foreground">({regularUseCases.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularUseCases.map((useCase) => (
              <UseCaseCard key={useCase.id} useCase={useCase} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default UseCaseGrid;
