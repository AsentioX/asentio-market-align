import { ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CaseStudyCardProps {
  company: string;
  website?: string;
  description: string;
  image: string;
  imageZoom?: number;
  imagePosition?: string;
  challenge?: string;
  whatWeDid?: string;
  tags?: string[];
  expanded?: boolean;
  onToggle?: () => void;
}

const CaseStudyCard = ({ company, website, description, image, imageZoom = 1, imagePosition = "center", challenge, whatWeDid, tags, expanded, onToggle }: CaseStudyCardProps) => {
  const hasDetails = challenge || whatWeDid;

  if (expanded && hasDetails) {
    return (
      <div className="group bg-card/50 rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 flex-shrink-0 h-48 md:h-auto overflow-hidden">
            <img
              src={image}
              alt={company}
              className="w-full h-full object-cover"
              style={{ transform: `scale(${imageZoom})`, objectPosition: imagePosition }}
            />
          </div>
          <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="md:w-1/3">
              <h3 className="text-lg font-bold text-foreground mb-1">{company}</h3>
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-asentio-blue hover:underline mb-2">
                  <ExternalLink className="w-3 h-3" />Visit website
                </a>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
            {challenge && (
              <div className="md:w-1/3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Challenge</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{challenge}</p>
              </div>
            )}
            {whatWeDid && (
              <div className="md:w-1/3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">What We Did</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{whatWeDid}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group bg-card rounded-xl border border-border hover:border-asentio-blue/30 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row sm:h-40",
        hasDetails && "cursor-pointer"
      )}
      onClick={onToggle}
    >
      <div className="sm:w-2/5 flex-shrink-0 h-32 sm:h-full overflow-hidden">
        <img
          src={image}
          alt={company}
          className="w-full h-full object-cover"
          style={{ transform: `scale(${imageZoom})`, objectPosition: imagePosition }}
        />
      </div>
      <div className="p-5 sm:p-6 flex flex-col justify-center sm:w-3/5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 group-hover:text-asentio-blue transition-colors">
              {company}
            </h3>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          {hasDetails && (
            <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default CaseStudyCard;
