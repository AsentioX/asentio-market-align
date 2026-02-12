import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseStudyCardProps {
  company: string;
  description: string;
  image: string;
  imageZoom?: number;
  imagePosition?: string;
  challenge?: string;
  whatWeDid?: string;
}

const CaseStudyCard = ({ company, description, image, imageZoom = 1, imagePosition = "center", challenge, whatWeDid }: CaseStudyCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = challenge || whatWeDid;

  return (
    <div
      className={cn(
        "group bg-card rounded-xl border border-border hover:border-asentio-blue/30 transition-all duration-300 overflow-hidden flex flex-col",
        hasDetails && "cursor-pointer"
      )}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      <div className="flex flex-col sm:flex-row sm:h-40">
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
              <ChevronDown className={cn("w-4 h-4 mt-1 flex-shrink-0 text-muted-foreground transition-transform duration-300", expanded && "rotate-180")} />
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>

      {hasDetails && (
        <div className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}>
          <div className="overflow-hidden">
            <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-border space-y-3">
              {challenge && (
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Challenge</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{challenge}</p>
                </div>
              )}
              {whatWeDid && (
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">What We Did</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{whatWeDid}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudyCard;
