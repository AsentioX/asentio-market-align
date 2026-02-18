import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { XRProduct } from '@/hooks/useXRProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Loader2 } from 'lucide-react';

interface DerivedCompany {
  name: string;
  hq: string | null;
  productCount: number;
  categories: string[];
  logoUrl: string | null;
}

interface DerivedCompanyGridProps {
  products: XRProduct[] | undefined;
  isLoading: boolean;
}

const DerivedCompanyGrid = ({ products, isLoading }: DerivedCompanyGridProps) => {
  const companies = useMemo(() => {
    if (!products) return [];
    const map = new Map<string, DerivedCompany>();
    products.forEach((p) => {
      const existing = map.get(p.company);
      if (existing) {
        existing.productCount++;
        if (p.category && !existing.categories.includes(p.category)) existing.categories.push(p.category);
        if (!existing.hq && p.company_hq) existing.hq = p.company_hq;
        if (!existing.logoUrl && p.image_url) existing.logoUrl = p.image_url;
      } else {
        map.set(p.company, {
          name: p.company,
          hq: p.company_hq,
          productCount: 1,
          categories: p.category ? [p.category] : [],
          logoUrl: p.image_url,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.productCount - a.productCount);
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">No companies found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <Link key={company.name} to={`/xr-directory/company/${encodeURIComponent(company.name)}`}>
          <Card className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-asentio-blue/30 h-full">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-muted-foreground">{company.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-asentio-blue transition-colors truncate">
                    {company.name}
                  </h3>
                  {company.hq && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {company.hq}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {company.categories.slice(0, 3).map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="w-3 h-3" />
                {company.productCount} product{company.productCount !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default DerivedCompanyGrid;
