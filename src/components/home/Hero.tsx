import { Link } from "react-router-dom";
import { ArrowRight, Play, Leaf, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-hero-pattern">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      {/* Decorative Elements */}
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative z-10 flex min-h-[90vh] flex-col items-center justify-center py-20 text-center">
        {/* Badge */}
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
          <Leaf className="h-4 w-4" />
          <span>The Future of Agriculture is Here</span>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-up stagger-1 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
          Grow Smarter,{" "}
          <span className="text-gradient">Trade Better,</span>{" "}
          Harvest More
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up stagger-2 mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Connect with buyers, access expert agronomists, diagnose crop diseases with AI, 
          and join a thriving community of modern farmers—all in one platform.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up stagger-3 mt-10 flex flex-col gap-4 sm:flex-row">
          <Link to="/marketplace">
            <Button variant="hero" size="xl" className="gap-2">
              Explore Marketplace
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button variant="outline" size="xl" className="gap-2">
            <Play className="h-5 w-5" />
            Watch How It Works
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="animate-fade-up stagger-4 mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <TrendingUp className="h-6 w-6 text-primary" />
              10K+
            </div>
            <span className="text-sm text-muted-foreground">Active Farmers</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <Leaf className="h-6 w-6 text-primary" />
              50K+
            </div>
            <span className="text-sm text-muted-foreground">Products Listed</span>
          </div>
          <div className="col-span-2 flex flex-col items-center gap-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <Users className="h-6 w-6 text-primary" />
              500+
            </div>
            <span className="text-sm text-muted-foreground">Expert Agronomists</span>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
