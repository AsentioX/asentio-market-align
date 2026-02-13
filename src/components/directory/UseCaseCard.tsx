import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Monitor, Building2, Layers } from 'lucide-react';
import { XRUseCase } from '@/hooks/useXRUseCases';

interface UseCaseCardProps {
  useCase: XRUseCase;
}

const UseCaseCard = ({ useCase }: UseCaseCardProps) => {
  return (
    <Link to={`/xr-directory/use-cases/${useCase.slug}`} className="block">
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 border ${
      useCase.is_editors_pick ? 'border-asentio-blue/30 bg-gradient-to-br from-blue-50/50 to-white' : 'border-border'
    }`}>
      {/* Image */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {useCase.image_url ? (
          <img
            src={useCase.image_url}
            alt={useCase.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Layers className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        {useCase.is_editors_pick && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-asentio-blue text-white px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-semibold">Editor's Pick</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-3">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-asentio-blue transition-colors line-clamp-1">
              {useCase.title}
            </h3>
          {useCase.client_name && (
            <p className="text-sm text-muted-foreground">{useCase.client_name}</p>
          )}
        </div>
        
        {/* Device Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <Monitor className="w-3 h-3 mr-1" />
            {useCase.device}
          </Badge>
        </div>
        
        {/* Editor's Note */}
        {useCase.editors_note && (
          <p className="text-sm text-asentio-blue bg-blue-50 p-2 rounded mb-3 italic">
            {useCase.editors_note}
          </p>
        )}
        
        {/* Description */}
        {useCase.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {useCase.description}
          </p>
        )}
        
        {/* Tech Stack */}
        {useCase.tech_stack && useCase.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {useCase.tech_stack.slice(0, 4).map((tech, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                {tech}
              </span>
            ))}
            {useCase.tech_stack.length > 4 && (
              <span className="text-xs px-2 py-1 text-muted-foreground">
                +{useCase.tech_stack.length - 4} more
              </span>
            )}
          </div>
        )}
        
        {/* Agency Footer */}
        {useCase.agency && (
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <Link 
              to={`/xr-directory/agencies/${useCase.agency.slug}`}
              className="text-sm font-medium text-asentio-blue hover:underline"
            >
              {useCase.agency.name}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
};

export default UseCaseCard;
