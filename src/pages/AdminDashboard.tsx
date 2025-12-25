import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  BarChart3,
  Tag,
  Shield,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Truck
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardCardSkeleton } from "@/components/ui/dashboard-skeletons";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, hasRole, isLoading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && (!user || !hasRole('admin'))) {
      toast.error("Access denied. Admin role required.");
      navigate('/');
      return;
    }

    if (user && hasRole('admin')) {
      fetchData();
    }
  }, [user, authLoading, hasRole]);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const [profilesRes, productsRes, ordersRes, categoriesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: status as Database['public']['Enums']['order_status'] })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success("Order status updated");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      confirmed: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      shipped: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      delivered: "bg-success/20 text-success border-success/30",
      cancelled: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return styles[status] || styles.pending;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
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
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  // Mock analytics data
  const analytics = {
    dailyVisitors: 1247,
    conversionRate: 3.2,
    avgOrderValue: Math.round(totalRevenue / Math.max(orders.length, 1)),
    growth: 12.5,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-primary" />
                <Badge variant="outline" className="text-xs">Admin Panel</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Platform management and analytics</p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Users", value: profiles.length, icon: Users, color: "text-blue-500", change: "+12%" },
              { label: "Total Products", value: products.length, icon: Package, color: "text-purple-500", change: "+8%" },
              { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-success", change: "+23%" },
              { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-amber-500", change: "+15%" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-card border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-success text-xs">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Platform Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Daily Visitors</span>
                      <span className="font-semibold">{analytics.dailyVisitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Conversion Rate</span>
                      <span className="font-semibold">{analytics.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Avg Order Value</span>
                      <span className="font-semibold">₹{analytics.avgOrderValue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">Month-over-Month Growth</span>
                      <span className="font-semibold text-success">+{analytics.growth}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Order Status Distribution
                  </h3>
                  <div className="space-y-4">
                    {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
                      const count = orders.filter(o => o.status === status).length;
                      const percentage = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{status}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                status === 'pending' ? 'bg-amber-500' :
                                status === 'confirmed' ? 'bg-blue-500' :
                                status === 'shipped' ? 'bg-purple-500' :
                                status === 'delivered' ? 'bg-success' : 'bg-destructive'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4">All Users ({profiles.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <tr key={profile.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                {profile.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-medium">{profile.full_name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{profile.phone || 'No phone'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{profile.location || 'N/A'}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4">All Products ({products.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                🌾
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">₹{product.price.toLocaleString("en-IN")}/{product.unit}</td>
                          <td className="py-3 px-4">{product.quantity_available}</td>
                          <td className="py-3 px-4">
                            {product.is_organic ? (
                              <Badge className="bg-success/20 text-success">Organic</Badge>
                            ) : (
                              <Badge variant="outline">Regular</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4">All Orders ({orders.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</td>
                          <td className="py-3 px-4 font-semibold">₹{order.total_amount.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-4">
                            <Badge className={getOrderStatusBadge(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {order.status === 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                  title="Confirm"
                                >
                                  <CheckCircle className="h-4 w-4 text-success" />
                                </Button>
                              )}
                              {order.status === 'confirmed' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                                  title="Mark Shipped"
                                >
                                  <Truck className="h-4 w-4 text-purple-500" />
                                </Button>
                              )}
                              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  title="Cancel"
                                >
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                <h3 className="font-display text-lg font-bold mb-4">Categories ({categories.length})</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">{category.slug}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
