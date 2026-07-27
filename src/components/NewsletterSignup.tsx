import { useState } from 'react';
import { useSubscribe } from '@/hooks/useAsentioContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface NewsletterSignupProps {
  source?: string;
  variant?: 'light' | 'dark';
  title?: string;
  description?: string;
  compact?: boolean;
}

const NewsletterSignup = ({
  source = 'website',
  variant = 'light',
  title = 'The Human Interface Briefing',
  description = 'A regular read on where XR, AI and wearables converge — new companies, shifting categories and what it means for product and market strategy.',
  compact = false,
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const subscribe = useSubscribe();

  const dark = variant === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    try {
      await subscribe.mutateAsync({ email, source });
      setDone(true);
      setEmail('');
      toast({ title: "You're subscribed", description: 'Watch for the next briefing in your inbox.' });
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    }
  };

  if (done) {
    return (
      <div className={`flex items-center gap-2 ${dark ? 'text-primary-foreground' : 'text-foreground'}`}>
        <CheckCircle2 className="w-5 h-5 text-asentio-red" />
        <span className="font-medium">Subscribed — thank you.</span>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'max-w-2xl'}>
      {!compact && (
        <>
          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${dark ? 'text-primary-foreground' : 'text-foreground'}`}>
            {title}
          </h3>
          <p className={`mb-6 leading-relaxed ${dark ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-label="Email address"
          className={dark ? 'bg-background/10 border-background/30 text-primary-foreground placeholder:text-primary-foreground/50' : ''}
        />
        <Button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-asentio-red hover:bg-asentio-red/90 text-white whitespace-nowrap"
        >
          {subscribe.isPending ? 'Subscribing…' : 'Subscribe'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );
};

export default NewsletterSignup;
