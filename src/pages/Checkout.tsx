import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, Truck, CheckCircle, ArrowLeft, Package, Smartphone, Shield, Clock } from "lucide-react";
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
  const [showGPay, setShowGPay] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    village: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const shipping = totalPrice >= 500 ? 0 : 50;
  const platformFee = Math.round(totalPrice * 0.02);
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + platformFee + tax;

  const handleShippingSubmit = () => {
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.state || !shippingInfo.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (shippingInfo.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setCurrentStep(2);
  };

  const handleMockGPayPayment = () => {
    setShowGPay(true);
  };

  const handlePaymentComplete = async () => {
    if (!user) {
      toast.error("Please sign in to complete your order");
      navigate("/auth");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order
      const shippingAddress = `${shippingInfo.fullName}\n${shippingInfo.address}${shippingInfo.village ? `, ${shippingInfo.village}` : ''}\n${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.pincode}\nPhone: ${shippingInfo.phone}`;
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          total_amount: grandTotal,
          shipping_address: shippingAddress,
          notes: shippingInfo.notes || null,
          status: "confirmed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId || null,
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
        title: "Order Confirmed! 🎉",
        message: `Your order #${order.id.slice(0, 8).toUpperCase()} has been confirmed and will be shipped soon.`,
        data: { orderId: order.id },
      });

      setOrderId(order.id);
      setCurrentStep(3);
      clearCart();
      toast.success("Payment successful! Order placed.");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
      setShowGPay(false);
    }
  };

  if (items.length === 0 && currentStep !== 3) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col theme-red-soil bg-red-soil-bg pattern-grain">
      <Navbar />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          {/* Progress Steps */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: currentStep >= step.id ? 1 : 0.9 }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 shadow-lg",
                      currentStep >= step.id
                        ? "bg-red-soil-accent text-white"
                        : "bg-red-soil-surface text-muted-foreground"
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">{step.title}</span>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                      className={cn(
                        "w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 origin-left transition-all",
                        currentStep > step.id ? "bg-red-soil-accent" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid md:grid-cols-2 gap-8"
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-red-soil-text">Shipping Address</h2>
                    <p className="text-muted-foreground mt-1">Where should we deliver your farm-fresh products?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="bg-red-soil-surface border-border/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="bg-red-soil-surface border-border/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Street Address *</Label>
                      <Textarea
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        placeholder="House/Flat No., Street Name, Landmark"
                        className="bg-red-soil-surface border-border/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="village">Village/Town (Optional)</Label>
                      <Input
                        id="village"
                        value={shippingInfo.village}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, village: e.target.value })}
                        placeholder="Village or town name"
                        className="bg-red-soil-surface border-border/30"
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
                          className="bg-red-soil-surface border-border/30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          placeholder="Maharashtra"
                          className="bg-red-soil-surface border-border/30"
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
                        className="bg-red-soil-surface border-border/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                        placeholder="Any special instructions for delivery"
                        className="bg-red-soil-surface border-border/30"
                      />
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full bg-red-soil-accent hover:bg-red-soil-accent/90" 
                    onClick={handleShippingSubmit}
                  >
                    Continue to Payment
                  </Button>
                </div>

                {/* Order Summary Sidebar */}
                <div className="bg-red-soil-surface rounded-3xl border border-border/20 p-6 h-fit shadow-xl">
                  <h3 className="font-display text-lg font-bold mb-4 text-red-soil-text">Order Summary</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                        <span className="text-3xl">{item.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? "text-success" : ""}>
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>₹{platformFee.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (GST 5%)</span>
                      <span>₹{tax.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/30">
                      <span>Total</span>
                      <span className="text-red-soil-accent">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && !showGPay && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
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

                <div className="bg-red-soil-surface rounded-3xl border border-border/20 p-8 shadow-xl">
                  <h2 className="font-display text-2xl font-bold mb-2 text-red-soil-text">Payment Method</h2>
                  <p className="text-muted-foreground mb-6">Select your preferred payment method</p>
                  
                  <div className="space-y-4 mb-8">
                    {/* Google Pay Option */}
                    <button
                      onClick={handleMockGPayPayment}
                      className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-2xl font-bold" style={{ 
                            background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          }}>G</span>
                        </div>
                        <div>
                          <span className="font-semibold text-lg">Google Pay</span>
                          <p className="text-sm text-muted-foreground">Pay securely with UPI</p>
                        </div>
                        <div className="ml-auto h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </div>
                      </div>
                    </button>

                    {/* COD Option */}
                    <div className="p-4 rounded-xl border border-border/30 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-medium">Cash on Delivery</span>
                          <p className="text-sm text-muted-foreground">Pay when delivered</p>
                        </div>
                        <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">Coming Soon</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/20 border border-border/20 mb-6">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-red-soil-accent" />
                      <div>
                        <p className="font-medium">Estimated Delivery</p>
                        <p className="text-sm text-muted-foreground">3-5 business days</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold text-xl mb-6">
                    <span>Amount to Pay</span>
                    <span className="text-red-soil-accent">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mock Google Pay Modal */}
            {currentStep === 2 && showGPay && (
              <motion.div
                key="gpay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-sm mx-auto"
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  {/* GPay Header */}
                  <div className="bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 p-1">
                    <div className="bg-white rounded-t-2xl p-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold" style={{ 
                          background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>G</span>
                        <span className="text-xl font-semibold text-gray-800">Google Pay</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Payment Details */}
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Paying to</p>
                      <p className="text-gray-800 font-semibold text-lg">Agrihub Marketplace</p>
                      <p className="text-gray-500 text-xs">agrihub@upi</p>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-1">Amount</p>
                      <p className="text-4xl font-bold text-gray-800">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>Secured by UPI</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handlePaymentComplete}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Pay ₹{grandTotal.toLocaleString("en-IN")}
                          </div>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full text-gray-600"
                        onClick={() => setShowGPay(false)}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                    </div>

                    <p className="text-center text-xs text-gray-400">
                      This is a mock payment for demonstration purposes
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center"
              >
                <div className="mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto h-28 w-28 rounded-full bg-success/20 flex items-center justify-center mb-6 shadow-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <CheckCircle className="h-14 w-14 text-success" />
                    </motion.div>
                  </motion.div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="font-display text-3xl font-bold mb-2 text-red-soil-text"
                  >
                    Order Confirmed! 🎉
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground"
                  >
                    Thank you for supporting Indian farmers. Your order is on its way!
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-red-soil-surface rounded-3xl border border-border/20 p-6 mb-8 text-left shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="h-5 w-5 text-red-soil-accent" />
                    <span className="font-semibold text-red-soil-text">Order Details</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono font-semibold">{orderId?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg">
                      <span className="text-muted-foreground">Payment Status</span>
                      <span className="text-success font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Paid
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-muted/20">
                      <span className="text-muted-foreground">Order Status</span>
                      <span className="text-amber-500 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Processing
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg">
                      <span className="text-muted-foreground">Estimated Delivery</span>
                      <span>3-5 business days</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 mt-2 border-t border-border/30">
                      <span>Total Paid</span>
                      <span className="text-red-soil-accent">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link to="/account" className="flex-1">
                    <Button variant="outline" className="w-full border-red-soil-accent/30 hover:bg-red-soil-accent/10">
                      View My Orders
                    </Button>
                  </Link>
                  <Link to="/marketplace" className="flex-1">
                    <Button className="w-full bg-red-soil-accent hover:bg-red-soil-accent/90">
                      Continue Shopping
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
