import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-alluvial">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Discover fresh produce from farmers across India
            </p>
            <Link to="/marketplace">
              <Button className="gap-2">
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
    <div className="flex min-h-screen flex-col bg-gradient-alluvial">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground">{totalItems} items in your cart</p>
            </div>
            <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
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
                  className="flex gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center text-4xl flex-shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.seller}</p>
                        <p className="text-xs text-muted-foreground">{item.location}</p>
                      </div>
                      {item.isOrganic && (
                        <Badge className="bg-success/10 text-success border-success/20 flex-shrink-0">
                          Organic
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <div className="rounded-2xl bg-card border border-border p-6 shadow-lg">
                <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className={totalPrice >= 500 ? "text-success" : ""}>
                      {totalPrice >= 500 ? "FREE" : "₹50"}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (GST 5%)</span>
                    <span>₹{Math.round(totalPrice * 0.05).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{(totalPrice + (totalPrice >= 500 ? 0 : 50) + Math.round(totalPrice * 0.05)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {totalPrice < 500 && (
                  <p className="text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted">
                    Add ₹{(500 - totalPrice).toLocaleString("en-IN")} more for free shipping!
                  </p>
                )}

                <Link to="/checkout" className="block">
                  <Button size="lg" className="w-full gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link to="/marketplace" className="block mt-4">
                  <Button variant="ghost" size="lg" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                  </Button>
                </Link>
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
