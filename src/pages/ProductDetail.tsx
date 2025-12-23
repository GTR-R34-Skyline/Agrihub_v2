import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, User, ShoppingCart, Truck, Shield, MessageSquare, Plus, Minus } from "lucide-react";
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

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  user_id: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  location: string | null;
  is_organic: boolean | null;
  quantity_available: number;
  seller_id: string;
  category_id: string | null;
}

// Mock product data for now (will be replaced with Supabase data when products exist)
const mockProducts: Record<string, any> = {
  "1": {
    id: "1",
    name: "Kashmiri Saffron (Kesar)",
    description: "Premium grade A1 Kashmiri saffron from the valleys of Pampore. Our saffron is hand-picked at dawn and sun-dried using traditional methods passed down through generations. Known for its deep red color, intense aroma, and exceptional coloring strength. Each strand is carefully selected to ensure the highest quality. Perfect for biryanis, kheer, and traditional Indian sweets.",
    price: 45000,
    unit: "100g",
    image: "🌸",
    location: "Pampore, Kashmir",
    seller: "Kashmir Valley Farms",
    sellerId: "seller-1",
    isOrganic: true,
    rating: 4.9,
    reviewCount: 128,
    quantityAvailable: 50,
    category: "spices"
  },
  "2": {
    id: "2",
    name: "Kerala Malabar Black Pepper",
    description: "Authentic Malabar black pepper from the spice gardens of Wayanad, Kerala. Sun-dried using traditional methods to preserve the natural oils and pungent flavor. Grade: TGSEB (Tellicherry Garbled Special Extra Bold). Our pepper has a complex flavor profile with notes of citrus and wood.",
    price: 850,
    unit: "kg",
    image: "🌶️",
    location: "Wayanad, Kerala",
    seller: "Spice Garden Coop",
    sellerId: "seller-2",
    isOrganic: true,
    rating: 4.8,
    reviewCount: 89,
    quantityAvailable: 200,
    category: "spices"
  },
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      // Try to fetch from Supabase first
      const { data: dbProduct, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (dbProduct) {
        setProduct({
          ...dbProduct,
          image: "🌾",
          rating: 4.5,
          reviewCount: 0,
        });
      } else {
        // Fall back to mock data
        setProduct(mockProducts[id] || null);
      }
      setLoading(false);
    };

    const fetchReviews = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false });
      
      if (data) setReviews(data);
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
        image: product.image || product.image_url || "🌾",
        seller: product.seller || "Farmer",
        location: product.location || "India",
        isOrganic: product.isOrganic || product.is_organic,
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
    const { error } = await supabase.from("reviews").insert({
      product_id: id,
      user_id: user.id,
      rating: newReview.rating,
      title: newReview.title || null,
      content: newReview.content || null,
    });

    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted successfully!");
      setNewReview({ rating: 5, title: "", content: "" });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-alluvial">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-alluvial">
        <Navbar />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <span className="text-6xl">🔍</span>
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-alluvial">
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
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-[12rem] shadow-2xl border border-border/50">
                {product.image || product.image_url || "🌾"}
              </div>
              {(product.isOrganic || product.is_organic) && (
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
                          star <= Math.floor(product.rating || 4.5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted"
                        )}
                      />
                    ))}
                    <span className="ml-2 font-medium">{product.rating || 4.5}</span>
                    <span className="text-muted-foreground">({product.reviewCount || reviews.length} reviews)</span>
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
                {product.description}
              </p>

              {/* Seller Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{product.seller || "Verified Farmer"}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {product.location}
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
