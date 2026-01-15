import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

// Role options for signup form
const roleOptions: { value: AppRole; label: string; icon: string; description: string }[] = [
  { value: "farmer", label: "Farmer", icon: "👨‍🌾", description: "Sell your produce and get expert advice" },
  { value: "buyer", label: "Buyer", icon: "🛒", description: "Purchase fresh agricultural products" },
  { value: "agronomist", label: "Agronomist", icon: "👩‍🔬", description: "Provide expert advisory services" },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>("farmer");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    location: "",
  });

  const { signIn, signUp, user, roles: userRoles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Role-based redirect helper
  const getRedirectPath = (userRoles: string[]) => {
    if (userRoles.includes("admin")) return "/admin-dashboard";
    if (userRoles.includes("farmer")) return "/farmer-dashboard";
    return "/";
  };

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (user && userRoles.length > 0) {
      const redirectPath = getRedirectPath(userRoles);
      navigate(redirectPath);
    }
  }, [user, userRoles, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Welcome back!", description: "You've successfully logged in." });
          // Redirect will happen via useEffect when roles are loaded
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, selectedRole);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Account created!", description: "Welcome to AgriHub." });
          // Redirect based on selected role after signup
          const redirectPath = getRedirectPath([selectedRole]);
          navigate(redirectPath);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16 bg-background"
      >
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-110">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">{APP_NAME}</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Join thousands of farmers and buyers on AgriHub"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((role) => (
                      <motion.button
                        key={role.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRole(role.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                          selectedRole === role.value
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <span className="text-2xl">{role.icon}</span>
                        <span className="text-xs font-medium">{role.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="Your full name" 
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="+91 98765 43210" 
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="location" 
                      placeholder="City, State" 
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border cursor-pointer" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                {/* Forgot password - shows toast with instructions since password reset flow requires additional setup */}
                <button
                  type="button"
                  onClick={() => toast({
                    title: "Password Reset",
                    description: "Please contact support@agrihub.com to reset your password.",
                  })}
                  className="font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>

      {/* Right Panel - Image/Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="hidden bg-hero-gradient lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 pattern-grain opacity-30" />
        <div className="max-w-md text-center text-primary-foreground relative z-10">
          <motion.div 
            className="mb-8 text-7xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🌾
          </motion.div>
          <h2 className="font-display text-3xl font-bold">Grow with AgriHub</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join our community of farmers, buyers, and agricultural experts. 
            Together, we're building a more connected and sustainable farming future for India.
          </p>
          <div className="mt-8 flex justify-center gap-8">
            {[
              { value: "10L+", label: "Farmers" },
              { value: "50L+", label: "Products" },
              { value: "28+", label: "States" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
