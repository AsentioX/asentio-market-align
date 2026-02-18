import { XRCompany } from '@/hooks/useXRCompanies';
import CompanyCard from './CompanyCard';
import { Loader2 } from 'lucide-react';

interface CompanyGridProps {
  companies: XRCompany[] | undefined;
  isLoading: boolean;
}

const CompanyGrid = ({ companies, isLoading }: CompanyGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No companies found matching your criteria.</p>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  const editorsPicks = companies.filter(c => c.is_editors_pick);
  const regularCompanies = companies.filter(c => !c.is_editors_pick);

  return (
    <div className="space-y-12">
      {editorsPicks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-asentio-blue rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">Featured Companies</h2>
            <span className="text-sm text-muted-foreground">({editorsPicks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorsPicks.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </section>
      )}

      {regularCompanies.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-muted-foreground rounded-full" />
            <h2 className="text-xl font-semibold text-foreground">All Companies</h2>
            <span className="text-sm text-muted-foreground">({regularCompanies.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CompanyGrid;
