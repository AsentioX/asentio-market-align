import { useParams, Link } from 'react-router-dom';
import { useXRAgency } from '@/hooks/useXRAgencies';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Building2, Globe, Sparkles } from 'lucide-react';

const AgencyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: agency, isLoading, error } = useXRAgency(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Agency not found</h1>
        <Link to="/xr-directory?tab=agencies">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link to="/xr-directory?tab=agencies" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Agencies
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {agency.logo_url ? (
                    <img src={agency.logo_url} alt={agency.name} className="w-16 h-16 object-contain rounded-lg border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{agency.name}</h1>
                    {agency.is_editors_pick && (
                      <div className="flex items-center gap-1 text-primary mt-1">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Editor's Pick</span>
                      </div>
                    )}
                  </div>
                </div>

                {agency.editors_note && (
                  <p className="text-sm text-primary bg-primary/10 p-3 rounded-lg mb-4 italic">{agency.editors_note}</p>
                )}

                {agency.description && (
                  <p className="text-muted-foreground mb-4">{agency.description}</p>
                )}

                {agency.website && (
                  <a href={agency.website} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2">
                      <ExternalLink className="w-4 h-4" /> Visit Website
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-6">
            {agency.services && agency.services.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {agency.services.map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">{service}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {agency.regions && agency.regions.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Regions</h2>
                  <div className="flex flex-wrap gap-2">
                    {agency.regions.map((region, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm gap-1">
                        <Globe className="w-3 h-3" /> {region}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDetail;
