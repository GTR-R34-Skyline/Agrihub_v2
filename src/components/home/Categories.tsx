import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Categories() {
  return (
    <section className="bg-card py-20 md:py-28">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
              Categories
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Find exactly what you need from our wide range of agricultural products and services.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View All Categories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.slug}
              to={`/marketplace?category=${category.slug}`}
              className={cn(
                "group flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-6 text-center transition-all duration-300",
                "hover:border-primary/30 hover:shadow-md hover:-translate-y-1",
                "animate-fade-up opacity-0"
              )}
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
            >
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                {category.icon}
              </span>
              <span className="text-sm font-medium text-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
