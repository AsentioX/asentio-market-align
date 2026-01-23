interface ChannelCardProps {
  title: string;
  description: string;
  bestFor: string;
}

const ChannelCard = ({ title, description, bestFor }: ChannelCardProps) => {
  return (
    <div className="group bg-card p-6 rounded-xl border border-border hover:border-asentio-blue/30 transition-all duration-300">
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>
      <p className="text-xs text-muted-foreground/80 italic">
        <span className="font-medium text-foreground not-italic">Best for:</span> {bestFor}
      </p>
    </div>
  );
};

export default ChannelCard;
