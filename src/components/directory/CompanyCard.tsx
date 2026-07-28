import { Link } from 'react-router-dom';
import { XRCompany } from '@/hooks/useXRCompanies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Sparkles, Cpu, Hand, Star } from 'lucide-react';

interface CompanyCardProps {
  company: XRCompany;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  const capabilities = company.ai_capabilities || [];
  const interfaces = company.human_interface || [];
  const categories = [company.primary_category, ...(company.subcategories || [])].filter(Boolean) as string[];

  return (
    <Card className="group relative h-full hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-asentio-red/40 overflow-hidden">
      {/* Red accent on hover */}
      <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red transition-all duration-300 group-hover:h-full" />

      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-3">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              loading="lazy"
              className="w-12 h-12 object-contain rounded-md bg-muted p-1 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-muted-foreground">{company.name.charAt(0)}</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/hai-directory/company/${encodeURIComponent(company.slug || company.name)}`}
                className="font-semibold text-foreground group-hover:text-asentio-red transition-colors truncate"
              >
                {company.name}
              </Link>
              {company.is_editors_pick && (
                <Star className="w-3.5 h-3.5 text-asentio-red fill-asentio-red flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {company.company_type && (
                <span className="text-xs font-medium text-asentio-blue">{company.company_type}</span>
              )}
              {company.hq_location && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {company.hq_location}
                </span>
              )}
            </div>
          </div>
        </div>

        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{company.description}</p>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="secondary" className="text-xs">+{categories.length - 3}</Badge>
            )}
          </div>
        )}

        {(capabilities.length > 0 || interfaces.length > 0) && (
          <div className="space-y-1.5 mb-3 text-xs">
            {capabilities.length > 0 && (
              <div className="flex items-start gap-1.5 text-muted-foreground">
                <Cpu className="w-3.5 h-3.5 mt-0.5 text-asentio-blue flex-shrink-0" />
                <span className="line-clamp-1">{capabilities.slice(0, 3).join(' · ')}</span>
              </div>
            )}
            {interfaces.length > 0 && (
              <div className="flex items-start gap-1.5 text-muted-foreground">
                <Hand className="w-3.5 h-3.5 mt-0.5 text-asentio-blue flex-shrink-0" />
                <span className="line-clamp-1">{interfaces.slice(0, 4).join(' · ')}</span>
              </div>
            )}
          </div>
        )}

        {company.asentio_take && (
          <div className="mb-3 pl-3 border-l-2 border-asentio-red/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-asentio-red mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Asentio Take
            </p>
            <p className="text-xs italic text-muted-foreground line-clamp-2">{company.asentio_take}</p>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            {company.funding_stage && <span>{company.funding_stage}</span>}
            {company.founded_year && <span>Founded {company.founded_year}</span>}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/hai-directory/company/${encodeURIComponent(company.slug || company.name)}`}
              className="text-asentio-blue hover:underline font-medium"
            >
              Profile
            </Link>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-asentio-blue hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
