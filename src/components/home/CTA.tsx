import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
      <div className="absolute inset-0 bg-hero-pattern opacity-10" />
      
      {/* Decorative circles */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary-foreground/5" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            Ready to Transform Your Farming Experience?
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Join thousands of farmers who are already growing smarter, trading better, and harvesting more with Agrihub.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/auth">
              <Button variant="hero-outline" size="xl" className="gap-2">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button 
                size="xl" 
                className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Explore Marketplace
              </Button>
            </Link>
          </div>

          {/* Trust text */}
          <p className="mt-8 text-sm text-primary-foreground/60">
            No credit card required • Free forever for basic features • Join 10,000+ farmers
          </p>
        </div>
      </div>
    </section>
  );
}
