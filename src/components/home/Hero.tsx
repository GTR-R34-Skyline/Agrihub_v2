import { Link } from "react-router-dom";
import { ArrowRight, Play, Leaf, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Smooth scroll to Features section
const scrollToFeatures = () => {
  const featuresSection = document.getElementById("features");
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: "smooth" });
  }
};
import heroImage from "@/assets/hero-indian-farm.jpg";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Indian farmer in golden wheat fields of Punjab"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container relative z-10 flex min-h-[90vh] flex-col items-start justify-center py-20">
        {/* Badge */}
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-primary">
          <Leaf className="h-4 w-4" />
          <span>भारत की कृषि क्रांति | India's Agri Revolution</span>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-up stagger-1 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
          Empowering{" "}
          <span className="text-gradient">Indian Farmers</span>{" "}
          to Grow & Prosper
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-up stagger-2 mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
          From the wheat fields of Punjab to the spice gardens of Kerala — connect directly with buyers, 
          access expert agronomists, and diagnose crop diseases with AI.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up stagger-3 mt-10 flex flex-col gap-4 sm:flex-row">
          <Link to="/marketplace">
            <Button variant="hero" size="xl" className="gap-2">
              Explore Marketplace
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="xl" 
            className="gap-2 bg-background/50 backdrop-blur-sm border-foreground/20 hover:bg-background/70 cursor-pointer"
            onClick={scrollToFeatures}
            aria-label="Learn more about AgriHub features"
          >
            <Play className="h-5 w-5" />
            Watch How It Works
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="animate-fade-up stagger-4 mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-12">
          <div className="flex flex-col gap-2 rounded-xl bg-background/60 backdrop-blur-sm p-4 border border-border/50">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <TrendingUp className="h-6 w-6 text-primary" />
              25K+
            </div>
            <span className="text-sm text-muted-foreground">Farmers Across India</span>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-background/60 backdrop-blur-sm p-4 border border-border/50">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <Leaf className="h-6 w-6 text-primary" />
              1 Lakh+
            </div>
            <span className="text-sm text-muted-foreground">Products Listed</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-2 rounded-xl bg-background/60 backdrop-blur-sm p-4 border border-border/50">
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
              <Users className="h-6 w-6 text-primary" />
              800+
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
