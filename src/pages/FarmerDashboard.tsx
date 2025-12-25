import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  ShoppingBag, 
  TrendingUp, 
  Bell, 
  Star,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  X
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardCardSkeleton } from "@/components/ui/dashboard-skeletons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    unit: "kg",
    quantity_available: "",
    location: "",
    is_organic: false,
  });

  useEffect(() => {
    if (!authLoading && (!user || !hasRole('farmer'))) {
      toast.error("Access denied. Farmer role required.");
      navigate('/');
      return;
    }

    if (user && hasRole('farmer')) {
      fetchData();
      setupRealtimeSubscriptions();
    }
  }, [user, authLoading, hasRole]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch farmer's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (productsData) setProducts(productsData);

      // Fetch orders for farmer's products
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersData) setOrders(ordersData);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsData) setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    const channel = supabase
      .channel('farmer-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 5));
          toast.info((payload.new as Notification).title);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddProduct = async () => {
    if (!user) return;
    if (!productForm.name || !productForm.price || !productForm.quantity_available) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase.from('products').insert({
        seller_id: user.id,
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        quantity_available: parseInt(productForm.quantity_available),
        location: productForm.location || null,
        is_organic: productForm.is_organic,
      });

      if (error) throw error;

      toast.success("Product added successfully!");
      setShowAddProduct(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productForm.name,
          description: productForm.description || null,
          price: parseFloat(productForm.price),
          unit: productForm.unit,
          quantity_available: parseInt(productForm.quantity_available),
          location: productForm.location || null,
          is_organic: productForm.is_organic,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success("Product deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      unit: "kg",
      quantity_available: "",
      location: "",
      is_organic: false,
    });
  };

  const startEdit = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      unit: product.unit,
      quantity_available: product.quantity_available.toString(),
      location: product.location || "",
      is_organic: product.is_organic || false,
    });
    setEditingProduct(product);
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <X className="h-4 w-4 text-destructive" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col theme-laterite" style={{ background: 'hsl(25 45% 95%)', color: 'hsl(25 40% 12%)' }}>
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="flex min-h-screen flex-col theme-laterite pattern-grain" style={{ background: 'hsl(25 45% 95%)', color: 'hsl(25 40% 12%)' }}>
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Farmer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your products and track orders</p>
            </div>
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 bg-laterite-accent hover:bg-laterite-accent/90">
                  <Plus className="h-5 w-5" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g., Organic Basmati Rice"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Describe your product..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Unit *</Label>
                      <Input
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        placeholder="kg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantity Available *</Label>
                      <Input
                        type="number"
                        value={productForm.quantity_available}
                        onChange={(e) => setProductForm({ ...productForm, quantity_available: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={productForm.location}
                        onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={productForm.is_organic}
                      onCheckedChange={(checked) => setProductForm({ ...productForm, is_organic: checked })}
                    />
                    <Label>Organic Certified</Label>
                  </div>
                  <Button className="w-full" onClick={handleAddProduct}>
                    Add Product
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Products", value: products.length, icon: Package, color: "text-blue-500" },
              { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-success" },
              { label: "Pending Orders", value: pendingOrders, icon: ShoppingBag, color: "text-amber-500" },
              { label: "Notifications", value: notifications.filter(n => !n.is_read).length, icon: Bell, color: "text-purple-500" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-laterite-surface border border-border/20 p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-laterite-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-laterite-surface border border-border/20 p-6 shadow-lg">
                <h2 className="font-display text-xl font-bold mb-6 text-laterite-text flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Your Products
                </h2>
                
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No products yet. Add your first product!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-3xl">
                          🌾
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            {product.is_organic && (
                              <Badge className="bg-success/20 text-success text-xs">Organic</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price.toLocaleString("en-IN")}/{product.unit} • {product.quantity_available} in stock
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Orders */}
              <div className="rounded-2xl bg-laterite-surface border border-border/20 p-6 shadow-lg">
                <h2 className="font-display text-lg font-bold mb-4 text-laterite-text flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Recent Orders
                </h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                        {getOrderStatusIcon(order.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          ₹{order.total_amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="rounded-2xl bg-laterite-surface border border-border/20 p-6 shadow-lg">
                <h2 className="font-display text-lg font-bold mb-4 text-laterite-text flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h2>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3 rounded-lg ${notif.is_read ? 'bg-muted/10' : 'bg-laterite-accent/10 border border-laterite-accent/20'}`}
                      >
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Product Dialog */}
          <Dialog open={!!editingProduct} onOpenChange={() => { setEditingProduct(null); resetForm(); }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Unit *</Label>
                    <Input
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity Available *</Label>
                    <Input
                      type="number"
                      value={productForm.quantity_available}
                      onChange={(e) => setProductForm({ ...productForm, quantity_available: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={productForm.location}
                      onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={productForm.is_organic}
                    onCheckedChange={(checked) => setProductForm({ ...productForm, is_organic: checked })}
                  />
                  <Label>Organic Certified</Label>
                </div>
                <Button className="w-full" onClick={handleUpdateProduct}>
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
