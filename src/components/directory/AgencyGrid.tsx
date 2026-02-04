import { XRAgency } from '@/hooks/useXRAgencies';
import AgencyCard from './AgencyCard';
import { Loader2 } from 'lucide-react';

interface AgencyGridProps {
  agencies: XRAgency[] | undefined;
  isLoading: boolean;
}

const AgencyGrid = ({ agencies, isLoading }: AgencyGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!agencies || agencies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No agencies found matching your criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const editorsPicks = agencies.filter(a => a.is_editors_pick);
  const regularAgencies = agencies.filter(a => !a.is_editors_pick);

  return (
    <div className="space-y-12">
      {/* Editor's Picks Section */}
      {editorsPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-asentio-blue rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">Featured Agencies</h2>
            <span className="text-sm text-muted-foreground">({editorsPicks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorsPicks.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        </section>
      )}

      {/* All Agencies Section */}
      {regularAgencies.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">All Agencies</h2>
            <span className="text-sm text-muted-foreground">({regularAgencies.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularAgencies.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AgencyGrid;
