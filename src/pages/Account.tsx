import { User, Mail, Phone, MapPin, Edit2, Package, Heart, Settings, LogOut } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "settings", label: "Settings", icon: Settings },
];

const orders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "Delivered",
    total: 1250,
    items: 3,
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "Shipped",
    total: 890,
    items: 2,
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    status: "Processing",
    total: 2100,
    items: 5,
  },
];

const Account = () => {
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
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">
                    👨‍🌾
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold">Juan Dela Cruz</h2>
                  <p className="text-sm text-muted-foreground">Farmer • Nueva Ecija</p>
                  <span className="mt-2 inline-block rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                    Verified Seller
                  </span>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                  <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Section */}
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
                      <span>Juan Dela Cruz</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>juan@example.com</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+63 912 345 6789</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Location</label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Cabanatuan, Nueva Ecija</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Bio</label>
                  <p className="text-muted-foreground">
                    Third-generation rice farmer with 15 years of experience. 
                    Specializing in organic and sustainable farming practices.
                  </p>
                </div>
              </div>

              {/* Orders Section */}
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items} items • {order.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₱{order.total.toLocaleString()}</div>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                            order.status === "Delivered" && "bg-success/10 text-success",
                            order.status === "Shipped" && "bg-info/10 text-info",
                            order.status === "Processing" && "bg-warning/10 text-warning"
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { label: "Total Orders", value: "24", icon: Package },
                  { label: "Products Listed", value: "8", icon: "🌾" },
                  { label: "Total Sales", value: "₱45,000", icon: "💰" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-card p-6 text-center"
                  >
                    <div className="mx-auto mb-2 text-3xl">
                      {typeof stat.icon === "string" ? stat.icon : <stat.icon className="mx-auto h-8 w-8 text-primary" />}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
