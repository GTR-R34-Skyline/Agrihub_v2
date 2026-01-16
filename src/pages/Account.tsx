/**
 * Account Page - RLS Compliant
 * 
 * Displays the logged-in user's profile and orders.
 * All data is fetched from the database using RLS-compliant queries.
 * Redirects to login if unauthenticated.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Edit2, Package, Heart, Settings, LogOut, AlertCircle, Loader2, Clock, CheckCircle, Truck, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

// Minimal order type for account display (RLS-compliant select)
interface AccountOrder {
  id: string;
  buyer_id: string;
  status: Database['public']['Enums']['order_status'];
  total_amount: number;
  created_at: string;
  shipping_address: string | null;
}

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
];

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, roles, isLoading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderStats, setOrderStats] = useState({ total: 0, delivered: 0, pending: 0 });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch user's orders (RLS: buyer_id = auth.uid())
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoadingOrders(true);

      try {
        // Query orders where buyer_id = user.id (RLS enforced)
        const { data, error } = await supabase
          .from('orders')
          .select('id, buyer_id, status, total_amount, created_at, shipping_address')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42501' || error.message?.includes('policy')) {
            console.log('No orders access - user may not have any orders');
            setOrders([]);
          } else {
            console.error('Error fetching orders:', error);
            toast.error('Unable to load orders');
          }
        } else {
          setOrders(data || []);
          // Calculate stats
          const delivered = (data || []).filter(o => o.status === 'delivered').length;
          const pending = (data || []).filter(o => o.status === 'pending').length;
          setOrderStats({ total: (data || []).length, delivered, pending });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'cancelled': return <X className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'delivered': return 'bg-success/10 text-success border-success/30';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Determine user role for display
  const primaryRole = roles.includes('admin') ? 'Admin' : 
                      roles.includes('farmer') ? 'Farmer' : 
                      roles.includes('agronomist') ? 'Agronomist' : 'Buyer';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-border bg-card p-6">
                {/* Profile Summary */}
                <div className="mb-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      primaryRole === 'Farmer' ? '👨‍🌾' : primaryRole === 'Admin' ? '🛡️' : '👤'
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold">
                    {profile?.full_name || 'User'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {primaryRole} • {profile?.location || 'India'}
                  </p>
                  {roles.includes('farmer') && (
                    <span className="mt-2 inline-block rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      Verified Seller
                    </span>
                  )}
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                  <button 
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Section */}
              {activeTab === "profile" && (
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold">Profile Information</h2>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.full_name || 'Not set'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.phone || 'Not set'}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Location</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.location || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Bio</label>
                    <p className="text-muted-foreground">
                      {profile?.bio || 'No bio added yet.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {activeTab === "orders" && (
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold">My Orders</h2>
                  </div>

                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                      <Button onClick={() => navigate('/marketplace')}>
                        Browse Marketplace
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              {getOrderStatusIcon(order.status)}
                            </div>
                            <div>
                              <div className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{order.total_amount.toLocaleString('en-IN')}</div>
                            <span className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize border",
                              getStatusBadgeClass(order.status)
                            )}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Section */}
              {activeTab === "wishlist" && (
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <h2 className="font-display text-xl font-semibold mb-6">Wishlist</h2>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground">Save products you like to see them here</p>
                  </div>
                </div>
              )}

              {/* Settings Section */}
              {activeTab === "settings" && (
                <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                  <h2 className="font-display text-xl font-semibold mb-6">Settings</h2>
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Settings coming soon</h3>
                    <p className="text-muted-foreground">Account settings and preferences will be available here</p>
                  </div>
                </div>
              )}

              {/* Stats (shown on profile tab) */}
              {activeTab === "profile" && (
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <Package className="mx-auto h-8 w-8 text-primary mb-2" />
                    <div className="text-2xl font-bold">{orderStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <CheckCircle className="mx-auto h-8 w-8 text-success mb-2" />
                    <div className="text-2xl font-bold">{orderStats.delivered}</div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <Clock className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                    <div className="text-2xl font-bold">{orderStats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;