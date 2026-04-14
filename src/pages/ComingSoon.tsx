import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20 pb-16">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
          <Construction className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-3">Coming Soon</h1>
        <p className="text-lg text-muted-foreground mb-8">
          We're building something exciting. Check back soon for updates.
        </p>
        <Link to="/">
          <Button variant="default" className="bg-asentio-blue hover:bg-asentio-blue/90">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
