import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseStudyCardProps {
  company: string;
  description: string;
  image: string;
  imageZoom?: number;
  imagePosition?: string;
  challenge?: string;
  whatWeDid?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

const CaseStudyCard = ({ company, description, image, imageZoom = 1, imagePosition = "center", challenge, whatWeDid, expanded, onToggle }: CaseStudyCardProps) => {
  const hasDetails = challenge || whatWeDid;

  if (expanded && hasDetails) {
    return (
      <div
        className="group bg-card/50 rounded-lg overflow-hidden cursor-pointer animate-fade-in"
        onClick={onToggle}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 flex-shrink-0 h-48 md:h-auto overflow-hidden">
            <img
              src={image}
              alt={company}
              className="w-full h-full object-cover"
              style={{ transform: `scale(${imageZoom})`, objectPosition: imagePosition }}
            />
          </div>
          <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="md:w-1/3 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-foreground mb-2">{company}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
            {challenge && (
              <div className="md:w-1/3 flex flex-col justify-center">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Challenge</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{challenge}</p>
              </div>
            )}
            {whatWeDid && (
              <div className="md:w-1/3 flex flex-col justify-center">
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
          <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-asentio-blue transition-colors">
            {company}
          </h3>
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
