import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useXRAgency, useCreateAgency, useUpdateAgency, AGENCY_SERVICES, AGENCY_REGIONS } from '@/hooks/useXRAgencies';
import { ArrowLeft, Loader2 } from 'lucide-react';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const AgencyForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const { data: existingAgency, isLoading: agencyLoading } = useXRAgency(id || '');
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    logo_url: '',
    description: '',
    services: [] as string[],
    regions: [] as string[],
    is_editors_pick: false,
    editors_note: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing agency data
  useEffect(() => {
    if (existingAgency) {
      setFormData({
        name: existingAgency.name,
        slug: existingAgency.slug,
        website: existingAgency.website || '',
        logo_url: existingAgency.logo_url || '',
        description: existingAgency.description || '',
        services: existingAgency.services || [],
        regions: existingAgency.regions || [],
        is_editors_pick: existingAgency.is_editors_pick,
        editors_note: existingAgency.editors_note || ''
      });
    }
  }, [existingAgency]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, isEditing]);

  // Redirect if not admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate('/admin');
    return null;
  }

  if (isEditing && agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const agencyData = {
        ...formData,
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        description: formData.description || null,
        editors_note: formData.editors_note || null,
        services: formData.services.length > 0 ? formData.services : [],
        regions: formData.regions.length > 0 ? formData.regions : []
      };

      if (isEditing) {
        await updateAgency.mutateAsync({ id, ...agencyData });
        toast({
          title: 'Agency Updated',
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        await createAgency.mutateAsync(agencyData);
        toast({
          title: 'Agency Created',
          description: `${formData.name} has been added to the directory.`
        });
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save agency',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Agency' : 'Add New Agency'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="4D Pipeline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="4d-pipeline"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://4dpipeline.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the agency and its capabilities..."
                  rows={3}
                />
              </div>

              {/* Services */}
              <div className="space-y-3">
                <Label>Services</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AGENCY_SERVICES.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => toggleService(service)}
                      />
                      <Label htmlFor={`service-${service}`} className="text-sm font-normal cursor-pointer">
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regions */}
              <div className="space-y-3">
                <Label>Regions</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AGENCY_REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={formData.regions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <Label htmlFor={`region-${region}`} className="text-sm font-normal cursor-pointer">
                        {region}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor's Pick */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="editors_pick">Featured Agency</Label>
                    <p className="text-sm text-muted-foreground">Highlight this agency at the top of the directory</p>
                  </div>
                  <Switch
                    id="editors_pick"
                    checked={formData.is_editors_pick}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_editors_pick: checked }))}
                  />
                </div>
                {formData.is_editors_pick && (
                  <div className="space-y-2">
                    <Label htmlFor="editors_note">Editor's Note</Label>
                    <Input
                      id="editors_note"
                      value={formData.editors_note}
                      onChange={(e) => setFormData(prev => ({ ...prev, editors_note: e.target.value }))}
                      placeholder="Why this agency stands out..."
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-asentio-blue hover:bg-asentio-blue/90" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    'Update Agency'
                  ) : (
                    'Create Agency'
                  )}
                </Button>
                <Link to="/admin/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyForm;
