import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useXRProducts, useDeleteProduct, XRProduct } from '@/hooks/useXRProducts';
import { useXRAgencies, useDeleteAgency, XRAgency } from '@/hooks/useXRAgencies';
import { useXRUseCases, useDeleteUseCase, XRUseCase } from '@/hooks/useXRUseCases';
import { 
  Plus, LogOut, Search, Edit, Trash2, ExternalLink, 
  Sparkles, ArrowLeft, Loader2, LayoutGrid, Building2, Layers
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [productSearch, setProductSearch] = useState('');
  const [agencySearch, setAgencySearch] = useState('');
  const [useCaseSearch, setUseCaseSearch] = useState('');
  
  const { user, isAdmin, loading, signOut } = useAuth();
  const { data: products, isLoading: productsLoading } = useXRProducts({ search: productSearch });
  const { data: agencies, isLoading: agenciesLoading } = useXRAgencies({ search: agencySearch });
  const { data: useCases, isLoading: useCasesLoading } = useXRUseCases({ search: useCaseSearch });
  
  const deleteProduct = useDeleteProduct();
  const deleteAgency = useDeleteAgency();
  const deleteUseCase = useDeleteUseCase();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
      </div>
    );
  }

  const handleDeleteProduct = async (product: XRProduct) => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast({
        title: 'Product Deleted',
        description: `${product.name} has been removed from the directory.`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAgency = async (agency: XRAgency) => {
    try {
      await deleteAgency.mutateAsync(agency.id);
      toast({
        title: 'Agency Deleted',
        description: `${agency.name} has been removed from the directory.`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete agency',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUseCase = async (useCase: XRUseCase) => {
    try {
      await deleteUseCase.mutateAsync(useCase.id);
      toast({
        title: 'Use Case Deleted',
        description: `${useCase.title} has been removed from the directory.`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete use case',
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-muted/50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/xr-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">XR Directory Admin</h1>
            <p className="text-muted-foreground">Manage products, agencies, and use cases</p>
          </div>
          
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>


        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="agencies" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Agencies
            </TabsTrigger>
            <TabsTrigger value="use-cases" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Use Cases
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Products</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Link to="/admin/products/new">
                      <Button className="bg-asentio-blue hover:bg-asentio-blue/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">AI</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {product.is_editors_pick && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                                <div>
                                  <p className="font-medium text-foreground">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">{product.company}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <Badge variant="secondary">{product.category}</Badge>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <Badge className={
                                product.ai_integration === 'Yes' ? 'bg-emerald-100 text-emerald-700' 
                                : product.ai_integration === 'Partial' ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                              }>{product.ai_integration}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/admin/products/${product.id}/edit`}>
                                  <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteProduct(product)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found</p>
                    <Link to="/admin/products/new">
                      <Button className="mt-4 bg-asentio-blue hover:bg-asentio-blue/90">
                        <Plus className="w-4 h-4 mr-2" />Add Your First Product
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agencies Tab */}
          <TabsContent value="agencies">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Agencies</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search agencies..."
                        value={agencySearch}
                        onChange={(e) => setAgencySearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Link to="/admin/agencies/new">
                      <Button className="bg-asentio-blue hover:bg-asentio-blue/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {agenciesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
                  </div>
                ) : agencies && agencies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agency</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Services</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Regions</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agencies.map((agency) => (
                          <tr key={agency.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {agency.is_editors_pick && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                                <div>
                                  <p className="font-medium text-foreground">{agency.name}</p>
                                  {agency.website && (
                                    <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-sm text-asentio-blue hover:underline flex items-center gap-1">
                                      <ExternalLink className="w-3 h-3" />Website
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {agency.services?.slice(0, 2).map((service, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">{service}</Badge>
                                ))}
                                {(agency.services?.length || 0) > 2 && (
                                  <span className="text-xs text-muted-foreground">+{agency.services!.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">{agency.regions?.join(', ')}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/admin/agencies/${agency.id}/edit`}>
                                  <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Agency</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{agency.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteAgency(agency)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No agencies found</p>
                    <Link to="/admin/agencies/new">
                      <Button className="mt-4 bg-asentio-blue hover:bg-asentio-blue/90">
                        <Plus className="w-4 h-4 mr-2" />Add Your First Agency
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Use Cases Tab */}
          <TabsContent value="use-cases">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Use Cases</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search use cases..."
                        value={useCaseSearch}
                        onChange={(e) => setUseCaseSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Link to="/admin/use-cases/new">
                      <Button className="bg-asentio-blue hover:bg-asentio-blue/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {useCasesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-asentio-blue" />
                  </div>
                ) : useCases && useCases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Use Case</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Device</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Agency</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {useCases.map((useCase) => (
                          <tr key={useCase.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {useCase.is_editors_pick && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                                <div>
                                  <p className="font-medium text-foreground">{useCase.title}</p>
                                  {useCase.client_name && <p className="text-sm text-muted-foreground">{useCase.client_name}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <Badge variant="secondary">{useCase.device}</Badge>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">{useCase.agency?.name || '—'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/admin/use-cases/${useCase.id}/edit`}>
                                  <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Use Case</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{useCase.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUseCase(useCase)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No use cases found</p>
                    <Link to="/admin/use-cases/new">
                      <Button className="mt-4 bg-asentio-blue hover:bg-asentio-blue/90">
                        <Plus className="w-4 h-4 mr-2" />Add Your First Use Case
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
