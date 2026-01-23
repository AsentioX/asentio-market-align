import { CheckCircle } from "lucide-react";

interface EngagementCardProps {
  title: string;
  duration?: string;
  description: string;
  includes: string[];
  pricingAnchor: string;
  isSelective?: boolean;
}

const EngagementCard = ({ title, duration, description, includes, pricingAnchor, isSelective }: EngagementCardProps) => {
  return (
    <div className={`relative bg-card p-6 md:p-8 rounded-xl border transition-all duration-300 hover:shadow-lg ${
      isSelective 
        ? 'border-asentio-red/30 hover:border-asentio-red/50' 
        : 'border-border hover:border-asentio-blue/30'
    }`}>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {isSelective && (
            <span className="bg-asentio-red text-white text-xs font-medium px-3 py-1 rounded-full">
              Selective
            </span>
          )}
          {duration && (
            <span className="text-xs bg-asentio-blue/10 text-asentio-blue px-2 py-1 rounded-full font-medium">
              {duration}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Includes</p>
        <ul className="space-y-1.5">
          {includes.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-3.5 w-3.5 text-asentio-red mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground/80 italic">{pricingAnchor}</p>
      </div>
    </div>
  );
};

export default EngagementCard;
