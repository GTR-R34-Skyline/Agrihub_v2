import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Leaf, MapPin } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { CartItemSkeleton } from "@/components/ui/dashboard-skeletons";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart, isLoading } = useCart();

  const shipping = totalPrice >= 500 ? 0 : 50;
  const platformFee = Math.round(totalPrice * 0.02); // 2% platform fee
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + platformFee + tax;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col theme-black-soil bg-black-soil-bg">
        <Navbar />
        <main className="flex-1">
          <div className="container py-8">
            <div className="h-12 bg-muted rounded animate-pulse w-48 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <CartItemSkeleton />
                <CartItemSkeleton />
                <CartItemSkeleton />
              </div>
              <div className="h-96 bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col theme-black-soil bg-black-soil-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto h-28 w-28 rounded-full bg-black-soil-surface flex items-center justify-center mb-6 shadow-lg">
              <ShoppingCart className="h-14 w-14 text-black-soil-accent" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-3 text-black-soil-text">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Discover fresh produce directly from farmers across India. From Kashmir saffron to Kerala spices.
            </p>
            <Link to="/marketplace">
              <Button size="lg" className="gap-2 bg-black-soil-accent hover:bg-black-soil-accent/90">
                <ArrowLeft className="h-4 w-4" />
                Browse Marketplace
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col theme-black-soil bg-black-soil-bg pattern-grain">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-black-soil-text">Shopping Cart</h1>
              <p className="text-muted-foreground mt-1">{totalItems} items from verified farmers</p>
            </div>
            <Button 
              variant="ghost" 
              onClick={clearCart} 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 p-5 rounded-2xl bg-black-soil-surface border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-28 w-28 rounded-xl bg-muted/20 flex items-center justify-center text-5xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg text-black-soil-text truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.seller}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </div>
                      </div>
                      {item.isOrganic && (
                        <Badge className="bg-success/20 text-success border-success/30 flex-shrink-0 gap-1">
                          <Leaf className="h-3 w-3" />
                          Organic
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border/30 rounded-xl overflow-hidden bg-background/50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-3 hover:bg-muted/50 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-5 font-semibold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-3 hover:bg-muted/50 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="font-bold text-xl text-black-soil-accent">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            ₹{item.price.toLocaleString("en-IN")}/{item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-24 h-fit"
            >
              <div className="rounded-3xl bg-gradient-to-b from-black-soil-surface to-black-soil-bg border border-border/20 p-6 shadow-2xl">
                <h2 className="font-display text-xl font-bold mb-6 text-black-soil-text">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-success font-medium" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee (2%)</span>
                    <span>₹{platformFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (GST 5%)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-px bg-border/30" />
                  <div className="flex justify-between text-xl font-bold text-black-soil-text">
                    <span>Total</span>
                    <span className="text-black-soil-accent">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {totalPrice < 500 && (
                  <div className="text-sm text-muted-foreground mb-4 p-4 rounded-xl bg-muted/10 border border-border/20">
                    <span className="text-success font-medium">Free shipping</span> on orders over ₹500!
                    <br />Add ₹{(500 - totalPrice).toLocaleString("en-IN")} more to qualify.
                  </div>
                )}

                <Link to="/checkout" className="block">
                  <Button size="lg" className="w-full gap-2 bg-black-soil-accent hover:bg-black-soil-accent/90 text-background font-semibold">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/marketplace" className="block mt-4">
                  <Button variant="ghost" size="lg" className="w-full gap-2 border border-border/20">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>

                {/* Trust indicators */}
                <div className="mt-6 pt-4 border-t border-border/20 text-center text-xs text-muted-foreground">
                  <p>🔒 Secure checkout • 🌱 Farm fresh guarantee</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
