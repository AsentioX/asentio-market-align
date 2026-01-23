import { LucideIcon, CheckCircle } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  includes: string[];
  outcome: string;
}

const ServiceCard = ({ title, description, icon: Icon, includes, outcome }: ServiceCardProps) => {
  return (
    <div className="group relative bg-card p-8 rounded-xl border border-border hover:border-asentio-red/30 transition-all duration-300 hover:shadow-xl hover:shadow-asentio-red/5">
      <div className="absolute left-0 top-0 w-1 h-0 bg-asentio-red rounded-l-xl transition-all duration-300 group-hover:h-full" />
      
      <div className="mb-6">
        <div className="w-14 h-14 mb-4 bg-asentio-blue/10 rounded-lg flex items-center justify-center group-hover:bg-asentio-red/10 transition-colors">
          <Icon className="h-7 w-7 text-asentio-blue group-hover:text-asentio-red transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Includes</p>
        <ul className="space-y-2">
          {includes.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-4 w-4 text-asentio-red mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="pt-4 border-t border-border">
        <p className="text-sm font-semibold text-foreground mb-1">Outcome</p>
        <p className="text-sm text-asentio-blue font-medium">{outcome}</p>
      </div>
    </div>
  );
};

export default ServiceCard;
