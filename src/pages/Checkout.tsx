import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CreditCard, Truck, CheckCircle, ArrowLeft, Package } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Shipping", icon: MapPin },
  { id: 2, title: "Payment", icon: CreditCard },
  { id: 3, title: "Confirmation", icon: CheckCircle },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const shipping = totalPrice >= 500 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax;

  const handleShippingSubmit = () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    setCurrentStep(2);
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to complete your order");
      navigate("/auth");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const shippingAddress = `${shippingInfo.fullName}\n${shippingInfo.address}\n${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}\nPhone: ${shippingInfo.phone}`;
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          total_amount: grandTotal,
          shipping_address: shippingAddress,
          notes: shippingInfo.notes || null,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: null, // Mock products don't have real IDs
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "order_update",
        title: "Order Placed Successfully!",
        message: `Your order #${order.id.slice(0, 8)} has been placed and is being processed.`,
        data: { orderId: order.id },
      });

      setOrderId(order.id);
      setCurrentStep(3);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && currentStep !== 3) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-alluvial">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Shipping */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-bold">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      placeholder="House/Flat No., Street Name, Landmark"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input
                      id="pincode"
                      value={shippingInfo.pincode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                      placeholder="400001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={handleShippingSubmit}>
                  Continue to Payment
                </Button>
              </div>

              {/* Order Summary Sidebar */}
              <div className="bg-card rounded-2xl border border-border p-6 h-fit">
                <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-2xl">{item.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-success" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (GST 5%)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-xl mx-auto"
            >
              <Button
                variant="ghost"
                className="mb-6"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shipping
              </Button>

              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="font-display text-2xl font-bold mb-6">Payment Method</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </div>
                      <span className="font-medium">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 ml-8">
                      Pay when your order is delivered
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      <span className="font-medium">Online Payment</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Coming Soon</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted mb-6">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">3-5 business days</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Amount to Pay</span>
                  <span className="text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto text-center"
            >
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto h-24 w-24 rounded-full bg-success/10 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="h-12 w-12 text-success" />
                </motion.div>
                <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground">
                  Thank you for your order. We'll send you a confirmation email shortly.
                </p>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 mb-8 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-medium">Order Details</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono">{orderId?.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-amber-500 font-medium">Processing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Delivery</span>
                    <span>3-5 business days</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Total Paid</span>
                    <span className="text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/account")}
                >
                  View Orders
                </Button>
                <Button className="flex-1" onClick={() => navigate("/marketplace")}>
                  Continue Shopping
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
