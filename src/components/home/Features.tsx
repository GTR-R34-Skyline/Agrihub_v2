import { ShoppingCart, Users, Scan, MessageCircle, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ShoppingCart,
    title: "Fresh Marketplace",
    description: "Buy and sell agricultural products directly from verified farmers and suppliers with secure transactions.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    title: "Expert Advisory",
    description: "Connect with certified agronomists for personalized farming guidance and real-time consultations.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Scan,
    title: "AI Crop Diagnostics",
    description: "Upload photos of your crops to detect diseases early and receive AI-powered treatment recommendations.",
    color: "bg-info/10 text-info",
  },
  {
    icon: MessageCircle,
    title: "Community Hub",
    description: "Join a thriving community of farmers sharing knowledge, tips, and experiences from the field.",
    color: "bg-success/10 text-success",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Real-time price updates and market trends to help you make informed buying and selling decisions.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Protected transactions with escrow services ensuring safe payments for buyers and sellers alike.",
    color: "bg-primary/10 text-primary",
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Everything You Need to{" "}
            <span className="text-gradient">Succeed</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Agrihub combines powerful tools and a supportive community to help modern farmers thrive in the digital age.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg hover:-translate-y-1",
                "animate-fade-up opacity-0"
              )}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              {/* Icon */}
              <div className={cn("mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl", feature.color)}>
                <feature.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-muted-foreground">{feature.description}</p>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-8 right-8 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-primary to-secondary transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
