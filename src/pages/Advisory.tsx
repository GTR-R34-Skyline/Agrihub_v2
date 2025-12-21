import { Calendar, Clock, Star, Award, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const advisors = [
  {
    id: "1",
    name: "Dr. Anita Deshmukh",
    specialization: ["Rice Cultivation", "Pest Management"],
    experience: 15,
    rating: 4.9,
    consultations: 342,
    hourlyRate: 800,
    avatar: "👩‍🔬",
  },
  {
    id: "2",
    name: "Er. Vikram Singh",
    specialization: ["Irrigation Systems", "Farm Automation"],
    experience: 12,
    rating: 4.8,
    consultations: 256,
    hourlyRate: 1000,
    avatar: "👨‍🔧",
  },
  {
    id: "3",
    name: "Dr. Kavitha Nair",
    specialization: ["Organic Farming", "Soil Health"],
    experience: 10,
    rating: 4.9,
    consultations: 198,
    hourlyRate: 900,
    avatar: "👩‍🌾",
  },
  {
    id: "4",
    name: "Prof. Raghunath Iyer",
    specialization: ["Livestock Management", "Veterinary"],
    experience: 20,
    rating: 4.7,
    consultations: 412,
    hourlyRate: 1200,
    avatar: "👨‍⚕️",
  },
];

const Advisory = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Expert Advisory
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                Get Guidance from{" "}
                <span className="text-gradient">Agricultural Experts</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect with certified agronomists and specialists for personalized advice 
                on crops, livestock, equipment, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Advisors Grid */}
        <section className="py-12 md:py-20">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Available Experts</h2>
              <Button variant="outline">Filter by Specialty</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {advisors.map((advisor, index) => (
                <div
                  key={advisor.id}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-6 transition-all duration-300",
                    "hover:border-primary/30 hover:shadow-lg",
                    "animate-fade-up opacity-0"
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-4xl">
                      {advisor.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold">{advisor.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {advisor.specialization.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-primary" />
                          {advisor.experience} years exp.
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {advisor.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {advisor.consultations} consultations
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <span className="text-2xl font-bold text-primary">₹{advisor.hourlyRate}</span>
                      <span className="text-sm text-muted-foreground">/hour</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-card py-16">
          <div className="container">
            <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
              How Advisory Works
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { step: "1", title: "Choose an Expert", desc: "Browse our verified agronomists and find the right specialist for your needs." },
                { step: "2", title: "Book a Session", desc: "Select a convenient time slot and book your consultation online." },
                { step: "3", title: "Get Expert Advice", desc: "Connect via video call or chat and receive personalized guidance." },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={cn("text-center animate-fade-up opacity-0")}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Advisory;
