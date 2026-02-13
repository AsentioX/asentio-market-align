import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Building2, Sparkles, Globe } from 'lucide-react';
import { XRAgency } from '@/hooks/useXRAgencies';

interface AgencyCardProps {
  agency: XRAgency;
}

const AgencyCard = ({ agency }: AgencyCardProps) => {
  return (
    <Link to={`/xr-directory/agencies/${agency.slug}`} className="block">
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border ${
      agency.is_editors_pick ? 'border-asentio-blue/30 bg-gradient-to-br from-blue-50/50 to-white' : 'border-border'
    }`}>
      {/* Logo/Header */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {agency.logo_url ? (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Building2 className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        {agency.is_editors_pick && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-asentio-blue text-white px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-semibold">Editor's Pick</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-asentio-blue transition-colors line-clamp-1">
                {agency.name}
              </h3>
          </div>
          
          {agency.website && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(agency.website!, '_blank', 'noopener,noreferrer');
              }}
              className="p-2 rounded-full bg-muted hover:bg-asentio-blue hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </span>
          )}
        </div>
        
        {/* Editor's Note */}
        {agency.editors_note && (
          <p className="text-sm text-asentio-blue bg-blue-50 p-2 rounded mb-3 italic">
            {agency.editors_note}
          </p>
        )}
        
        {/* Description */}
        {agency.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {agency.description}
          </p>
        )}
        
        {/* Services */}
        {agency.services && agency.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agency.services.slice(0, 3).map((service, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
            {agency.services.length > 3 && (
              <span className="text-xs px-2 py-1 text-muted-foreground">
                +{agency.services.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        {agency.regions && agency.regions.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-border text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span>{agency.regions.join(', ')}</span>
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
};

export default AgencyCard;
