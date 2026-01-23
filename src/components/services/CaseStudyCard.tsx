interface CaseStudyCardProps {
  company: string;
  description: string;
}

const CaseStudyCard = ({ company, description }: CaseStudyCardProps) => {
  return (
    <div className="group bg-card p-6 rounded-xl border border-border hover:border-asentio-blue/30 transition-all duration-300 text-center">
      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-asentio-blue transition-colors">
        {company}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default CaseStudyCard;
