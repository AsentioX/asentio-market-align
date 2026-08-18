import { Link } from 'react-router-dom';
import { XRCompany } from '@/hooks/useXRCompanies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Star } from 'lucide-react';

interface CompanyCardProps {
  company: XRCompany;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  const interfaces = (company.human_interface || []).slice(0, 2);
  const aiCaps = (company.ai_capabilities || []).slice(0, 2);
  const industries = (company.industry_focus || []).slice(0, 2);
  const detailPath = `/hai-directory/company/${encodeURIComponent(company.slug || company.name)}`;

  return (
    <Link to={detailPath} className="block h-full">
    <Card className="group relative h-full hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-asentio-red/40 overflow-hidden">
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
              <span className="font-semibold text-foreground group-hover:text-asentio-red transition-colors truncate">
                {company.name}
              </span>
              {company.is_editors_pick && (
                <Star className="w-3.5 h-3.5 text-asentio-red fill-asentio-red flex-shrink-0" />
              )}
            </div>
            {company.hq_location && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {company.hq_location}
              </span>
            )}
          </div>
        </div>

        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{company.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {interfaces.map((v) => (
            <Badge key={`i-${v}`} variant="outline" className="text-[11px] border-asentio-blue/40 text-asentio-blue">
              {v}
            </Badge>
          ))}
          {aiCaps.map((v) => (
            <Badge key={`a-${v}`} variant="secondary" className="text-[11px]">
              {v}
            </Badge>
          ))}
          {industries.map((v) => (
            <Badge key={`m-${v}`} variant="outline" className="text-[11px] text-muted-foreground">
              {v}
            </Badge>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            {(company.ecosystem_roles || [])[0] && <span>{(company.ecosystem_roles || [])[0]}</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-asentio-blue font-medium group-hover:underline">
              Profile
            </span>
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
    </Link>
  );
};

export default CompanyCard;
