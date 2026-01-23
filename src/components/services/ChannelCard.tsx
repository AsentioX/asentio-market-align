interface ChannelCardProps {
  title: string;
  description: string;
  bestFor: string;
  whyItMatters?: string;
}

const ChannelCard = ({ title, description, bestFor, whyItMatters }: ChannelCardProps) => {
  return (
    <div className="group bg-card p-6 rounded-xl border border-border hover:border-asentio-blue/30 transition-all duration-300 h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">{description}</p>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground/80 italic">
          <span className="font-medium text-foreground not-italic">Best for:</span> {bestFor}
        </p>
        {whyItMatters && (
          <p className="text-xs text-muted-foreground/80 italic">
            <span className="font-medium text-foreground not-italic">Why it matters:</span> {whyItMatters}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChannelCard;
