import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useXRCompany, useCreateCompany, useUpdateCompany, COMPANY_SECTORS, COMPANY_SIZES } from '@/hooks/useXRCompanies';
import { useXRProducts } from '@/hooks/useXRProducts';
import { ArrowLeft, Loader2, ExternalLink, MapPin } from 'lucide-react';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const CompanyForm = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = rawId ? decodeURIComponent(rawId) : '';
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const { data: existingCompany, isLoading: companyLoading } = useXRCompany(id || '');
  const { data: allProducts } = useXRProducts({});
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const companyProducts = useMemo(() => {
    if (!allProducts || !id) return [];
    return allProducts
      .filter(p => p.company === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, id]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    logo_url: '',
    description: '',
    hq_location: '',
    founded_year: '',
    company_size: '',
    sectors: [] as string[],
    launch_date: '',
    end_of_life_date: '',
    is_editors_pick: false,
    editors_note: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingCompany) {
      setFormData({
        name: existingCompany.name,
        slug: existingCompany.slug,
        website: existingCompany.website || '',
        logo_url: existingCompany.logo_url || '',
        description: existingCompany.description || '',
        hq_location: existingCompany.hq_location || '',
        founded_year: existingCompany.founded_year?.toString() || '',
        company_size: existingCompany.company_size || '',
        sectors: existingCompany.sectors || [],
        launch_date: existingCompany.launch_date || '',
        end_of_life_date: existingCompany.end_of_life_date || '',
        is_editors_pick: existingCompany.is_editors_pick,
        editors_note: existingCompany.editors_note || ''
      });
    } else if (isEditing && !companyLoading) {
      // Company name from URL but no xr_companies record yet — pre-fill name
      setFormData(prev => ({ ...prev, name: id, slug: generateSlug(id) }));
    }
  }, [existingCompany, isEditing, companyLoading, id]);

  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, isEditing]);

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

  if (isEditing && companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  const toggleSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const companyData = {
        name: formData.name,
        slug: formData.slug,
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        description: formData.description || null,
        hq_location: formData.hq_location || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        company_size: formData.company_size || null,
        sectors: formData.sectors.length > 0 ? formData.sectors : [],
        launch_date: formData.launch_date || null,
        end_of_life_date: formData.end_of_life_date || null,
        is_editors_pick: formData.is_editors_pick,
        editors_note: formData.editors_note || null,
      };

      if (existingCompany) {
        await updateCompany.mutateAsync({ id: existingCompany.id, ...companyData });
        toast({ title: 'Company Updated', description: `${formData.name} has been updated successfully.` });
      } else {
        await createCompany.mutateAsync(companyData);
        toast({ title: 'Company Created', description: `${formData.name} has been added to the directory.` });
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save company', variant: 'destructive' });
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
            <CardTitle>{isEditing ? 'Edit Company' : 'Add New Company'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Editor's Pick */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="editors_pick">Featured Company</Label>
                    <p className="text-sm text-muted-foreground">Highlight this company at the top of the directory</p>
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
                      placeholder="Why this company stands out..."
                    />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Meta"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="meta"
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
                    placeholder="https://meta.com"
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

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hq_location">HQ Location</Label>
                  <Input
                    id="hq_location"
                    value={formData.hq_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, hq_location: e.target.value }))}
                    placeholder="Menlo Park, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded_year">Founded Year</Label>
                  <Input
                    id="founded_year"
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value }))}
                    placeholder="2004"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select value={formData.company_size} onValueChange={(val) => setFormData(prev => ({ ...prev, company_size: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the company and its XR initiatives..."
                  rows={3}
                />
              </div>

              {/* Sectors */}
              <div className="space-y-3">
                <Label>Sectors</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COMPANY_SECTORS.map((sector) => (
                    <div key={sector} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sector-${sector}`}
                        checked={formData.sectors.includes(sector)}
                        onCheckedChange={() => toggleSector(sector)}
                      />
                      <Label htmlFor={`sector-${sector}`} className="text-sm font-normal cursor-pointer">
                        {sector}
                      </Label>
                    </div>
                  ))}
                </div>
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
                    'Update Company'
                  ) : (
                    'Create Company'
                  )}
                </Button>
                <Link to="/admin/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Product List */}
        {isEditing && companyProducts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Products ({companyProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Product</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm hidden md:table-cell">Category</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm hidden md:table-cell">Status</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm hidden md:table-cell">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {product.image_url && (
                              <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            )}
                            <span className="font-medium text-sm text-foreground">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          <Badge variant="secondary" className="text-xs">{product.shipping_status}</Badge>
                        </td>
                        <td className="py-2 px-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{product.price_range || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyForm;
