import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { CATEGORIES, AI_INTEGRATIONS, SHIPPING_STATUSES, ProductFilters } from '@/hooks/useXRProducts';

interface DirectoryFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
}

const DirectoryFilters = ({ filters, onFilterChange }: DirectoryFiltersProps) => {
  return (
    <div className="bg-white border-b border-border sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, companies..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>
            
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => onFilterChange({ ...filters, category: value })}
            >
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.ai_integration || 'all'}
              onValueChange={(value) => onFilterChange({ ...filters, ai_integration: value })}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="AI Integration" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">All AI Types</SelectItem>
                {AI_INTEGRATIONS.map((ai) => (
                  <SelectItem key={ai} value={ai}>AI: {ai}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.shipping_status || 'all'}
              onValueChange={(value) => onFilterChange({ ...filters, shipping_status: value })}
            >
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg">
                <SelectItem value="all">All Statuses</SelectItem>
                {SHIPPING_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectoryFilters;
