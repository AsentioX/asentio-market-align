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
    editors_note: '',
    open_ecosystem_score: null as number | null,
    ai_access_score: null as number | null,
    spatial_capability_score: null as number | null,
    monetization_score: null as number | null,
    platform_viability_score: null as number | null,
    developer_resources_url: '',
    // Platform & Software
    operating_system: '',
    standalone_or_tethered: '',
    sdk_availability: '',
    developer_docs_url: '',
    openxr_compatible: null as boolean | null,
    app_store_availability: '',
    sideloading_allowed: null as boolean | null,
    // Display & Optics
    optics_type: '',
    field_of_view: '',
    resolution_per_eye: '',
    refresh_rate: '',
    brightness_nits: '',
    // Sensors & Tracking
    tracking_type: '',
    slam_support: null as boolean | null,
    hand_tracking: null as boolean | null,
    eye_tracking: null as boolean | null,
    camera_access_for_devs: null as boolean | null,
    // AI & Compute
    soc_processor: '',
    ram: '',
    on_device_ai: null as boolean | null,
    voice_assistant: '',
    cloud_dependency: '',
    // Hardware & Connectivity
    battery_life: '',
    weight: '',
    wifi_bluetooth_version: '',
    cellular_5g: null as boolean | null,
    additional_images: [] as string[],
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
        editors_note: existingProduct.editors_note || '',
        open_ecosystem_score: existingProduct.open_ecosystem_score ?? null,
        ai_access_score: existingProduct.ai_access_score ?? null,
        spatial_capability_score: existingProduct.spatial_capability_score ?? null,
        monetization_score: existingProduct.monetization_score ?? null,
        platform_viability_score: existingProduct.platform_viability_score ?? null,
        developer_resources_url: existingProduct.developer_resources_url || '',
        operating_system: existingProduct.operating_system || '',
        standalone_or_tethered: existingProduct.standalone_or_tethered || '',
        sdk_availability: existingProduct.sdk_availability || '',
        developer_docs_url: existingProduct.developer_docs_url || '',
        openxr_compatible: existingProduct.openxr_compatible ?? null,
        app_store_availability: existingProduct.app_store_availability || '',
        sideloading_allowed: existingProduct.sideloading_allowed ?? null,
        optics_type: existingProduct.optics_type || '',
        field_of_view: existingProduct.field_of_view || '',
        resolution_per_eye: existingProduct.resolution_per_eye || '',
        refresh_rate: existingProduct.refresh_rate || '',
        brightness_nits: existingProduct.brightness_nits || '',
        tracking_type: existingProduct.tracking_type || '',
        slam_support: existingProduct.slam_support ?? null,
        hand_tracking: existingProduct.hand_tracking ?? null,
        eye_tracking: existingProduct.eye_tracking ?? null,
        camera_access_for_devs: existingProduct.camera_access_for_devs ?? null,
        soc_processor: existingProduct.soc_processor || '',
        ram: existingProduct.ram || '',
        on_device_ai: existingProduct.on_device_ai ?? null,
        voice_assistant: existingProduct.voice_assistant || '',
        cloud_dependency: existingProduct.cloud_dependency || '',
        battery_life: existingProduct.battery_life || '',
        weight: existingProduct.weight || '',
        wifi_bluetooth_version: existingProduct.wifi_bluetooth_version || '',
        cellular_5g: existingProduct.cellular_5g ?? null,
        additional_images: existingProduct.additional_images || [],
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
        open_ecosystem_score: formData.open_ecosystem_score,
        ai_access_score: formData.ai_access_score,
        spatial_capability_score: formData.spatial_capability_score,
        monetization_score: formData.monetization_score,
        platform_viability_score: formData.platform_viability_score,
        developer_resources_url: formData.developer_resources_url || null,
        operating_system: formData.operating_system || null,
        standalone_or_tethered: formData.standalone_or_tethered || null,
        sdk_availability: formData.sdk_availability || null,
        developer_docs_url: formData.developer_docs_url || null,
        openxr_compatible: formData.openxr_compatible,
        app_store_availability: formData.app_store_availability || null,
        sideloading_allowed: formData.sideloading_allowed,
        optics_type: formData.optics_type || null,
        field_of_view: formData.field_of_view || null,
        resolution_per_eye: formData.resolution_per_eye || null,
        refresh_rate: formData.refresh_rate || null,
        brightness_nits: formData.brightness_nits || null,
        tracking_type: formData.tracking_type || null,
        slam_support: formData.slam_support,
        hand_tracking: formData.hand_tracking,
        eye_tracking: formData.eye_tracking,
        camera_access_for_devs: formData.camera_access_for_devs,
        soc_processor: formData.soc_processor || null,
        ram: formData.ram || null,
        on_device_ai: formData.on_device_ai,
        voice_assistant: formData.voice_assistant || null,
        cloud_dependency: formData.cloud_dependency || null,
        battery_life: formData.battery_life || null,
        weight: formData.weight || null,
        wifi_bluetooth_version: formData.wifi_bluetooth_version || null,
        cellular_5g: formData.cellular_5g,
        additional_images: formData.additional_images.filter(u => u && u.trim()).length > 0 ? formData.additional_images.filter(u => u && u.trim()) : null,
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




              {/* Image URLs */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Main Image URL (optional)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="space-y-2">
                    <Label>Additional Image {idx + 1}</Label>
                    <Input
                      type="url"
                      value={formData.additional_images[idx] || ''}
                      onChange={(e) => {
                        const updated = [...formData.additional_images];
                        updated[idx] = e.target.value;
                        setFormData(prev => ({ ...prev, additional_images: updated }));
                      }}
                      placeholder={`https://example.com/image-${idx + 2}.jpg`}
                    />
                  </div>
                ))}
              </div>

              {/* Developer Readiness Scores */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label className="text-base font-semibold">Developer Readiness Score</Label>
                  <p className="text-sm text-muted-foreground">Rate each dimension from 1 (lowest) to 5 (highest)</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {([
                    { key: 'open_ecosystem_score', label: 'Open Ecosystem Score' },
                    { key: 'ai_access_score', label: 'AI Access Score' },
                    { key: 'spatial_capability_score', label: 'Spatial Capability Score' },
                    { key: 'monetization_score', label: 'Monetization Score' },
                    { key: 'platform_viability_score', label: 'Platform Viability Score' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label} (1–5)</Label>
                      <Select
                        value={formData[key]?.toString() || ''}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, [key]: value ? parseInt(value) : null }))}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg">
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Resources URL */}
              <div className="space-y-2">
                <Label htmlFor="developer_resources_url">Developer Resources URL</Label>
                <Input
                  id="developer_resources_url"
                  type="url"
                  value={formData.developer_resources_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, developer_resources_url: e.target.value }))}
                  placeholder="https://developer.example.com"
                />
              </div>

              {/* 🧠 Platform & Software */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-semibold">🧠 Platform & Software</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operating_system">Operating System</Label>
                    <Input id="operating_system" value={formData.operating_system} onChange={(e) => setFormData(prev => ({ ...prev, operating_system: e.target.value }))} placeholder="Android XR, custom OS, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="standalone_or_tethered">Standalone or Tethered</Label>
                    <Input id="standalone_or_tethered" value={formData.standalone_or_tethered} onChange={(e) => setFormData(prev => ({ ...prev, standalone_or_tethered: e.target.value }))} placeholder="Standalone, Tethered, Both" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sdk_availability">SDK Availability</Label>
                    <Input id="sdk_availability" value={formData.sdk_availability} onChange={(e) => setFormData(prev => ({ ...prev, sdk_availability: e.target.value }))} placeholder="Unity, Unreal, OpenXR" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developer_docs_url">Developer Docs URL</Label>
                    <Input id="developer_docs_url" type="url" value={formData.developer_docs_url} onChange={(e) => setFormData(prev => ({ ...prev, developer_docs_url: e.target.value }))} placeholder="https://docs.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app_store_availability">App Store Availability</Label>
                    <Input id="app_store_availability" value={formData.app_store_availability} onChange={(e) => setFormData(prev => ({ ...prev, app_store_availability: e.target.value }))} placeholder="Google Play, proprietary, etc." />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="openxr_compatible">OpenXR Compatible</Label>
                    <Switch id="openxr_compatible" checked={formData.openxr_compatible ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, openxr_compatible: checked }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="sideloading_allowed">Sideloading Allowed</Label>
                    <Switch id="sideloading_allowed" checked={formData.sideloading_allowed ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sideloading_allowed: checked }))} />
                  </div>
                </div>
              </div>

              {/* 👁 Display & Optics */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-semibold">👁 Display & Optics</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="optics_type">Optics Type</Label>
                    <Input id="optics_type" value={formData.optics_type} onChange={(e) => setFormData(prev => ({ ...prev, optics_type: e.target.value }))} placeholder="Waveguide, Birdbath, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field_of_view">Field of View</Label>
                    <Input id="field_of_view" value={formData.field_of_view} onChange={(e) => setFormData(prev => ({ ...prev, field_of_view: e.target.value }))} placeholder="50°" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resolution_per_eye">Resolution per Eye</Label>
                    <Input id="resolution_per_eye" value={formData.resolution_per_eye} onChange={(e) => setFormData(prev => ({ ...prev, resolution_per_eye: e.target.value }))} placeholder="1920x1080" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refresh_rate">Refresh Rate</Label>
                    <Input id="refresh_rate" value={formData.refresh_rate} onChange={(e) => setFormData(prev => ({ ...prev, refresh_rate: e.target.value }))} placeholder="90Hz" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brightness_nits">Brightness (nits)</Label>
                    <Input id="brightness_nits" value={formData.brightness_nits} onChange={(e) => setFormData(prev => ({ ...prev, brightness_nits: e.target.value }))} placeholder="2000 nits" />
                  </div>
                </div>
              </div>

              {/* 📡 Sensors & Tracking */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-semibold">📡 Sensors & Tracking</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tracking_type">Tracking Type</Label>
                    <Input id="tracking_type" value={formData.tracking_type} onChange={(e) => setFormData(prev => ({ ...prev, tracking_type: e.target.value }))} placeholder="6DoF, 3DoF" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="slam_support">SLAM Support</Label>
                    <Switch id="slam_support" checked={formData.slam_support ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, slam_support: checked }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="hand_tracking">Hand Tracking</Label>
                    <Switch id="hand_tracking" checked={formData.hand_tracking ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hand_tracking: checked }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="eye_tracking">Eye Tracking</Label>
                    <Switch id="eye_tracking" checked={formData.eye_tracking ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, eye_tracking: checked }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="camera_access_for_devs">Camera Access for Devs</Label>
                    <Switch id="camera_access_for_devs" checked={formData.camera_access_for_devs ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, camera_access_for_devs: checked }))} />
                  </div>
                </div>
              </div>

              {/* 🤖 AI & Compute */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-semibold">🤖 AI & Compute</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="soc_processor">SoC / Processor</Label>
                    <Input id="soc_processor" value={formData.soc_processor} onChange={(e) => setFormData(prev => ({ ...prev, soc_processor: e.target.value }))} placeholder="Snapdragon XR2 Gen 2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ram">RAM</Label>
                    <Input id="ram" value={formData.ram} onChange={(e) => setFormData(prev => ({ ...prev, ram: e.target.value }))} placeholder="12GB" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voice_assistant">Voice Assistant</Label>
                    <Input id="voice_assistant" value={formData.voice_assistant} onChange={(e) => setFormData(prev => ({ ...prev, voice_assistant: e.target.value }))} placeholder="Gemini, Alexa, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cloud_dependency">Cloud Dependency</Label>
                    <Input id="cloud_dependency" value={formData.cloud_dependency} onChange={(e) => setFormData(prev => ({ ...prev, cloud_dependency: e.target.value }))} placeholder="Required, Optional" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="on_device_ai">On-device AI</Label>
                    <Switch id="on_device_ai" checked={formData.on_device_ai ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, on_device_ai: checked }))} />
                  </div>
                </div>
              </div>

              {/* 🔋 Hardware & Connectivity */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Label className="text-base font-semibold">🔋 Hardware & Connectivity</Label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="battery_life">Battery Life</Label>
                    <Input id="battery_life" value={formData.battery_life} onChange={(e) => setFormData(prev => ({ ...prev, battery_life: e.target.value }))} placeholder="3 hours" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" value={formData.weight} onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))} placeholder="226g" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wifi_bluetooth_version">WiFi / Bluetooth</Label>
                    <Input id="wifi_bluetooth_version" value={formData.wifi_bluetooth_version} onChange={(e) => setFormData(prev => ({ ...prev, wifi_bluetooth_version: e.target.value }))} placeholder="WiFi 6E, BT 5.3" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="cellular_5g">5G / Cellular</Label>
                    <Switch id="cellular_5g" checked={formData.cellular_5g ?? false} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, cellular_5g: checked }))} />
                  </div>
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
