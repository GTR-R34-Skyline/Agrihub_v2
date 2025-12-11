import { STATS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Stats() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-hero-pattern opacity-10" />

      <div className="container relative z-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "text-center animate-fade-up opacity-0"
              )}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
            >
              <div className="font-display text-4xl font-bold text-primary-foreground md:text-5xl lg:text-6xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-primary-foreground/80 md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
