import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CaseStudyCardProps {
  company: string;
  description: string;
  image: string;
}

const CaseStudyCard = ({ company, description, image }: CaseStudyCardProps) => {
  return (
    <div className="group bg-card rounded-xl border border-border hover:border-asentio-blue/30 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
      <div className="sm:w-2/5 flex-shrink-0">
        <AspectRatio ratio={4/3} className="bg-muted">
          <img 
            src={image} 
            alt={company} 
            className="w-full h-full object-cover"
          />
        </AspectRatio>
      </div>
      <div className="p-5 sm:p-6 flex flex-col justify-center sm:w-3/5">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-asentio-blue transition-colors">
          {company}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default CaseStudyCard;
