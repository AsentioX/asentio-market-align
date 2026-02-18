import { XRCompany } from '@/hooks/useXRCompanies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, MapPin, Calendar, Users, Rocket, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CompanyCardProps {
  company: XRCompany;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-asentio-blue/30 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4 mb-3">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={`${company.name} logo`}
              className="w-12 h-12 object-contain rounded-md bg-muted p-1 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-muted-foreground">{company.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-asentio-blue transition-colors truncate">
              {company.name}
            </h3>
            {company.hq_location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {company.hq_location}
              </p>
            )}
          </div>
        </div>

        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{company.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {company.sectors?.slice(0, 3).map((sector) => (
            <Badge key={sector} variant="secondary" className="text-xs">
              {sector}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            {company.founded_year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {company.founded_year}
              </span>
            )}
            {company.company_size && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {company.company_size}
              </span>
            )}
            {company.launch_date && (
              <span className="flex items-center gap-1">
                <Rocket className="w-3 h-3" />
                {format(new Date(company.launch_date), 'MMM yyyy')}
              </span>
            )}
            {company.end_of_life_date && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="w-3 h-3" />
                {format(new Date(company.end_of_life_date), 'MMM yyyy')}
              </span>
            )}
          </div>
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

        {company.is_editors_pick && company.editors_note && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs italic text-muted-foreground">✨ {company.editors_note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
