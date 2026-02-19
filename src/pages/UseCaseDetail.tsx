import { useParams, Link } from 'react-router-dom';
import { useXRUseCase } from '@/hooks/useXRUseCases';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Monitor, Building2, Sparkles, Layers } from 'lucide-react';

const UseCaseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: useCase, isLoading, error } = useXRUseCase(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !useCase) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Use case not found</h1>
        <Link to="/xr-directory?tab=use-cases">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 pt-24">
        <Link to="/xr-directory?tab=use-cases" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Use Cases
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {useCase.image_url ? (
                  <img src={useCase.image_url} alt={useCase.title} className="w-full rounded-lg mb-4 object-cover aspect-video" />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Layers className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}

                <h1 className="text-2xl font-bold mb-2">{useCase.title}</h1>

                {useCase.is_editors_pick && (
                  <div className="flex items-center gap-1 text-primary mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Editor's Pick</span>
                  </div>
                )}

                {useCase.client_name && (
                  <p className="text-sm text-muted-foreground mb-2">Client: {useCase.client_name}</p>
                )}

                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">
                  <Monitor className="w-3 h-3 mr-1" /> {useCase.device}
                </Badge>

                {useCase.editors_note && (
                  <p className="text-sm text-primary bg-primary/10 p-3 rounded-lg mb-4 italic">{useCase.editors_note}</p>
                )}

                {useCase.description && (
                  <p className="text-muted-foreground">{useCase.description}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-2 space-y-6">
            {useCase.tech_stack && useCase.tech_stack.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {useCase.tech_stack.map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {useCase.agency && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Agency</h2>
                  <Link to={`/xr-directory/agencies/${useCase.agency.slug}`} className="flex items-center gap-3 hover:bg-muted p-3 rounded-lg transition-colors">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-primary">{useCase.agency.name}</p>
                      {useCase.agency.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{useCase.agency.description}</p>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseDetail;
