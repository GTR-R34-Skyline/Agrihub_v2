import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "Agrihub transformed how I sell my produce. I now reach buyers across India and get fair prices for my crops.",
    author: "Ramesh Patel",
    role: "Rice Farmer, Punjab",
    rating: 5,
  },
  {
    quote: "The crop diagnostics feature saved my entire tomato harvest. The AI detected blight early and recommended the perfect treatment.",
    author: "Suresh Reddy",
    role: "Vegetable Farmer, Andhra Pradesh",
    rating: 5,
  },
  {
    quote: "As a buyer, I love the verified seller system. I know exactly where my products come from and can trust the quality.",
    author: "Priya Sharma",
    role: "Restaurant Owner, Mumbai",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Testimonials
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Loved by Farmers{" "}
            <span className="text-gradient">Everywhere</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how Agrihub is making a difference in agricultural communities.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={cn(
                "relative rounded-2xl border border-border bg-card p-8 transition-all duration-300",
                "hover:border-primary/30 hover:shadow-lg",
                "animate-fade-up opacity-0"
              )}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              {/* Quote Icon */}
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/20" />

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground">{testimonial.quote}</p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-semibold text-primary">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
