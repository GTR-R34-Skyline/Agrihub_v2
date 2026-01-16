/**
 * Marketplace Page - RLS Compliant
 * 
 * This page displays products from the database.
 * Products are publicly viewable by everyone (RLS policy: true for SELECT).
 * Equipment filtering is handled by RLS for buyers - frontend just queries products.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Grid3X3, List, Star, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchPublicProfiles, type PublicProfile } from "@/lib/supabase-helpers";
import type { Database } from "@/integrations/supabase/types";

// Minimal product type for marketplace display (RLS-compliant select)
interface MarketplaceProduct {
  id: string;
  seller_id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  location: string | null;
  is_organic: boolean | null;
  quantity_available: number;
  category_id: string | null;
  created_at: string;
}

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [sellerProfiles, setSellerProfiles] = useState<Map<string, PublicProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { user } = useAuth();

  // Fetch products from Supabase - RLS handles visibility
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Products are publicly viewable (RLS policy allows SELECT for everyone)
        // RLS will automatically filter equipment for buyers
        // Select only required columns for marketplace display
        const { data, error: queryError } = await supabase
          .from('products')
          .select('id, seller_id, name, price, unit, image_url, location, is_organic, quantity_available, category_id, created_at')
          .order('created_at', { ascending: false });

        if (queryError) {
          console.error('Error fetching products:', queryError);
          setError('Unable to load products. Please try again later.');
          setProducts([]);
          return;
        }

        setProducts(data || []);

        // Fetch public profile data for sellers (only public fields)
        if (data && data.length > 0) {
          const sellerIds = [...new Set(data.map(p => p.seller_id))];
          const profiles = await fetchPublicProfiles(sellerIds);
          setSellerProfiles(profiles);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Subscribe to real-time product updates
    const channel = supabase
      .channel('marketplace-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          // Refetch products on any change
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAddToCart = (product: MarketplaceProduct) => {
    const sellerProfile = sellerProfiles.get(product.seller_id);
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image_url || "🌾",
      seller: sellerProfile?.full_name || "Verified Farmer",
      location: product.location || "India",
      isOrganic: product.is_organic || false,
      productId: product.id,
    });
    toast.success(`${product.name} added to cart`);
  };

  // Client-side filtering for category and search (products are already RLS-filtered)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Category filtering done client-side since categories table is public
    return matchesSearch && (!selectedCategory || true); // Add category_id check when needed
  });

  return (
    <div className="flex min-h-screen flex-col theme-alluvial bg-background bg-alluvial-gradient">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-card py-12">
          <div className="container">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Marketplace</h1>
            <p className="mt-2 text-muted-foreground">
              Discover premium agricultural products from verified Indian farmers — from Kashmir to Kanyakumari.
            </p>

            {/* Search & Filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for Darjeeling tea, Kashmiri saffron, Basmati rice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
                <div className="flex rounded-lg border border-border">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b border-border bg-background py-4">
          <div className="container">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All Products
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    selectedCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8">
          <div className="container">
            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded-xl mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-6xl block mb-4">🌾</span>
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "Try adjusting your search terms" 
                        : "Check back later for new products from our farmers"}
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "grid gap-6",
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    )}
                  >
                    {filteredProducts.map((product, index) => {
                      const sellerProfile = sellerProfiles.get(product.seller_id);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "group rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300",
                            "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1",
                            viewMode === "list" && "flex"
                          )}
                        >
                          {/* Image */}
                          <Link
                            to={`/product/${product.id}`}
                            className={cn(
                              "relative flex items-center justify-center bg-muted",
                              viewMode === "grid" ? "aspect-square" : "h-32 w-32 flex-shrink-0"
                            )}
                          >
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-6xl">🌾</span>
                            )}
                            {product.is_organic && (
                              <Badge className="absolute top-2 left-2 bg-success text-success-foreground">
                                Organic
                              </Badge>
                            )}
                          </Link>

                          {/* Content */}
                          <div className="p-4 flex-1">
                            <Link to={`/product/${product.id}`}>
                              <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              {sellerProfile?.full_name || "Verified Farmer"} • {product.location || "India"}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div>
                                <span className="text-lg font-bold text-primary">
                                  ₹{product.price.toLocaleString("en-IN")}
                                </span>
                                <span className="text-sm text-muted-foreground">/{product.unit}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>4.5</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full mt-3"
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
