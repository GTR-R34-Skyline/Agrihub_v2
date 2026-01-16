/**
 * ProductDetail Page - RLS Compliant
 * 
 * Products are publicly viewable.
 * Reviews are publicly viewable.
 * Seller info is fetched from public profile fields only.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, User, ShoppingCart, Truck, Shield, MessageSquare, Plus, Minus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fetchPublicProfile, type PublicProfile } from "@/lib/supabase-helpers";
import type { Database } from "@/integrations/supabase/types";

type Review = Database['public']['Tables']['reviews']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        // Products are publicly viewable (RLS policy allows SELECT for everyone)
        const { data: dbProduct, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (productError) {
          console.error("Error fetching product:", productError);
          setError("Unable to load product details.");
          return;
        }

        if (!dbProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(dbProduct);

        // Fetch seller's public profile (only public fields)
        const profile = await fetchPublicProfile(dbProduct.seller_id);
        setSellerProfile(profile);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      
      // Reviews are publicly viewable (RLS policy allows SELECT for everyone)
      const { data, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (!reviewError && data) {
        setReviews(data);
      }
    };

    fetchProduct();
    fetchReviews();

    // Subscribe to new reviews
    const channel = supabase
      .channel(`reviews-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews", filter: `product_id=eq.${id}` },
        (payload) => {
          setReviews((prev) => [payload.new as Review, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
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
    }
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleSubmitReview = async () => {
    if (!user || !id) {
      toast.error("Please sign in to leave a review");
      return;
    }

    setIsSubmitting(true);
    
    // Users can create reviews (RLS policy: auth.uid() = user_id)
    const { error } = await supabase.from("reviews").insert({
      product_id: id,
      user_id: user.id,
      rating: newReview.rating,
      title: newReview.title || null,
      content: newReview.content || null,
    });

    if (error) {
      console.error("Review submission error:", error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error("You don't have permission to submit a review. Please ensure you're logged in.");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    } else {
      toast.success("Review submitted successfully!");
      setNewReview({ rating: 5, title: "", content: "" });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col theme-black-soil" style={{ background: 'hsl(220 15% 12%)' }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col theme-black-soil" style={{ background: 'hsl(220 15% 12%)' }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          {error ? (
            <>
              <AlertCircle className="h-16 w-16 text-destructive" />
              <h1 className="text-2xl font-bold">{error}</h1>
            </>
          ) : (
            <>
              <span className="text-6xl">🔍</span>
              <h1 className="text-2xl font-bold">Product not found</h1>
            </>
          )}
          <Link to="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 4.5;

  return (
    <div className="flex min-h-screen flex-col theme-black-soil" style={{ background: 'hsl(220 15% 12%)' }}>
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-2xl border border-border/50 overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[12rem]">🌾</span>
                )}
              </div>
              {product.is_organic && (
                <Badge className="absolute top-4 left-4 bg-success text-success-foreground text-lg px-4 py-2">
                  🌿 Organic Certified
                </Badge>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-5 w-5",
                          star <= Math.floor(averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        )}
                      />
                    ))}
                    <span className="ml-2 font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-lg text-muted-foreground">/{product.unit}</span>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description || "Premium quality product from verified Indian farmers."}
              </p>

              {/* Seller Info - Using public profile data only */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {sellerProfile?.avatar_url ? (
                    <img 
                      src={sellerProfile.avatar_url} 
                      alt={sellerProfile.full_name || "Seller"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{sellerProfile?.full_name || "Verified Farmer"}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {product.location || "India"}
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">Verified Seller</Badge>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>

              {/* Stock Info */}
              <div className="text-sm text-muted-foreground">
                {product.quantity_available > 0 ? (
                  <span className="text-success">✓ In stock ({product.quantity_available} available)</span>
                ) : (
                  <span className="text-destructive">Out of stock</span>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Free shipping over ₹500</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Quality guaranteed</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="font-display text-2xl font-bold flex items-center gap-2 mb-6">
              <MessageSquare className="h-6 w-6" />
              Customer Reviews
            </h2>

            {/* Write Review */}
            {user && (
              <div className="mb-8 p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-medium mb-4">Write a Review</h3>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          star <= newReview.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted hover:text-amber-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="mb-4"
                />
                <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted"
                          )}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && <h4 className="font-medium">{review.title}</h4>}
                    {review.content && <p className="text-muted-foreground mt-1">{review.content}</p>}
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
