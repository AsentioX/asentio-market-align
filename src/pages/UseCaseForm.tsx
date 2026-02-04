import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useXRUseCase, useCreateUseCase, useUpdateUseCase, USE_CASE_DEVICES, TECH_STACK_OPTIONS } from '@/hooks/useXRUseCases';
import { useXRAgencies } from '@/hooks/useXRAgencies';
import { ArrowLeft, Loader2 } from 'lucide-react';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const UseCaseForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const { data: existingUseCase, isLoading: useCaseLoading } = useXRUseCase(id || '');
  const { data: agencies } = useXRAgencies();
  const createUseCase = useCreateUseCase();
  const updateUseCase = useUpdateUseCase();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    device: 'Meta Quest 3',
    tech_stack: [] as string[],
    agency_id: '',
    image_url: '',
    client_name: '',
    is_editors_pick: false,
    editors_note: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing use case data
  useEffect(() => {
    if (existingUseCase) {
      setFormData({
        title: existingUseCase.title,
        slug: existingUseCase.slug,
        description: existingUseCase.description || '',
        device: existingUseCase.device,
        tech_stack: existingUseCase.tech_stack || [],
        agency_id: existingUseCase.agency_id || '',
        image_url: existingUseCase.image_url || '',
        client_name: existingUseCase.client_name || '',
        is_editors_pick: existingUseCase.is_editors_pick,
        editors_note: existingUseCase.editors_note || ''
      });
    }
  }, [existingUseCase]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title, isEditing]);

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

  if (isEditing && useCaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter(t => t !== tech)
        : [...prev.tech_stack, tech]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const useCaseData = {
        ...formData,
        description: formData.description || null,
        agency_id: formData.agency_id || null,
        image_url: formData.image_url || null,
        client_name: formData.client_name || null,
        editors_note: formData.editors_note || null,
        tech_stack: formData.tech_stack.length > 0 ? formData.tech_stack : []
      };

      if (isEditing) {
        await updateUseCase.mutateAsync({ id, ...useCaseData });
        toast({
          title: 'Use Case Updated',
          description: `${formData.title} has been updated successfully.`
        });
      } else {
        await createUseCase.mutateAsync(useCaseData);
        toast({
          title: 'Use Case Created',
          description: `${formData.title} has been added to the directory.`
        });
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save use case',
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
            <CardTitle>{isEditing ? 'Edit Use Case' : 'Add New Use Case'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enterprise VR Training"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="enterprise-vr-training"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Fortune 500 Company"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Device *</Label>
                  <Select
                    value={formData.device}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, device: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg max-h-60">
                      {USE_CASE_DEVICES.map((device) => (
                        <SelectItem key={device} value={device}>{device}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Agency */}
              <div className="space-y-2">
                <Label>Implementing Agency</Label>
                <Select
                  value={formData.agency_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, agency_id: value }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select an agency..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="">No agency</SelectItem>
                    {agencies?.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>{agency.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the use case, its goals, and outcomes..."
                  rows={3}
                />
              </div>

              {/* Tech Stack */}
              <div className="space-y-3">
                <Label>Tech Stack</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TECH_STACK_OPTIONS.map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tech-${tech}`}
                        checked={formData.tech_stack.includes(tech)}
                        onCheckedChange={() => toggleTechStack(tech)}
                      />
                      <Label htmlFor={`tech-${tech}`} className="text-sm font-normal cursor-pointer">
                        {tech}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/use-case-image.jpg"
                />
              </div>

              {/* Editor's Pick */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="editors_pick">Featured Use Case</Label>
                    <p className="text-sm text-muted-foreground">Highlight this use case at the top of the directory</p>
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
                      placeholder="Why this use case stands out..."
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
                    'Update Use Case'
                  ) : (
                    'Create Use Case'
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

export default UseCaseForm;
