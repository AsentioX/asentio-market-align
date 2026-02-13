import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useXRProduct, useXRProductById, useCreateProduct, useUpdateProduct, CATEGORIES, AI_INTEGRATIONS, SHIPPING_STATUSES } from '@/hooks/useXRProducts';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const { data: existingProduct, isLoading: productLoading } = useXRProductById(id || '');
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    company: '',
    company_hq: '',
    category: 'AR Glasses',
    ai_integration: 'No',
    price_range: '',
    shipping_status: 'Available',
    region: '',
    description: '',
    key_features: [] as string[],
    link: '',
    image_url: '',
    is_editors_pick: false,
    editors_note: ''
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing product data
  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        slug: existingProduct.slug,
        company: existingProduct.company,
        company_hq: existingProduct.company_hq || '',
        category: existingProduct.category,
        ai_integration: existingProduct.ai_integration,
        price_range: existingProduct.price_range || '',
        shipping_status: existingProduct.shipping_status,
        region: existingProduct.region,
        description: existingProduct.description || '',
        key_features: existingProduct.key_features || [],
        link: existingProduct.link || '',
        image_url: existingProduct.image_url || '',
        is_editors_pick: existingProduct.is_editors_pick,
        editors_note: existingProduct.editors_note || ''
      });
    }
  }, [existingProduct]);

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

  if (isEditing && productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        key_features: [...prev.key_features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      key_features: prev.key_features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        price_range: formData.price_range || null,
        description: formData.description || null,
        link: formData.link || null,
        image_url: formData.image_url || null,
        editors_note: formData.editors_note || null,
        key_features: formData.key_features.length > 0 ? formData.key_features : null,
        company_hq: formData.company_hq || null,
      };

      if (isEditing) {
        await updateProduct.mutateAsync({ id, ...productData });
        toast({
          title: 'Product Updated',
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        await createProduct.mutateAsync(productData);
        toast({
          title: 'Product Created',
          description: `${formData.name} has been added to the directory.`
        });
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
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
            <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Editor's Pick */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="editors_pick">Editor's Pick</Label>
                    <p className="text-sm text-muted-foreground">Feature this product at the top of the directory</p>
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
                      placeholder="Why this product stands out..."
                    />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="XREAL One Pro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="xreal-one-pro"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="XREAL"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_hq">Company HQ</Label>
                  <Input
                    id="company_hq"
                    value={formData.company_hq}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_hq: e.target.value }))}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    placeholder="Global"
                    required
                  />
                </div>
              </div>

              {/* Selects */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shipping Status *</Label>
                  <Select
                    value={formData.shipping_status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, shipping_status: value }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg">
                      {SHIPPING_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>



              {/* Price & Link */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_range">Price</Label>
                  <Input
                    id="price_range"
                    value={formData.price_range}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_range: e.target.value }))}
                    placeholder="$299–$399"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Product Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com"
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
                  placeholder="Describe the product..."
                  rows={3}
                />
              </div>




              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
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
                    'Update Product'
                  ) : (
                    'Create Product'
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

export default ProductForm;
