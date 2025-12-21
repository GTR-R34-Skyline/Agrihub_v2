import { Target, Eye, Heart, Linkedin, Twitter } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const founders = [
  {
    name: "M. Shashank",
    role: "CEO & Co-Founder",
    bio: "Visionary leader with deep expertise in agricultural technology and rural development. Passionate about empowering Indian farmers through innovation.",
    avatar: "👨‍💼",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "K. Vishva",
    role: "CTO & Co-Founder",
    bio: "Full-stack developer and AI specialist. Built enterprise solutions for leading tech companies before dedicating skills to revolutionizing agritech in India.",
    avatar: "👨‍💻",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "Dr. S. Poorani",
    role: "COO & Co-Founder",
    bio: "Agricultural scientist with extensive research experience. Combines deep domain knowledge with modern business practices to drive sustainable farming.",
    avatar: "👩‍🔬",
    linkedin: "#",
    twitter: "#",
  },
];

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We're committed to empowering farmers with technology that makes a real difference in their lives and livelihoods.",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "Every feature we build starts with understanding the real needs of our farming community.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "We believe in fair pricing, honest communication, and building trust through transparency.",
  },
];

const Founders = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                About Agrihub
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl lg:text-5xl">
                Building the Future of{" "}
                <span className="text-gradient">Agriculture</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                We started Agrihub with a simple belief: technology should empower farmers, 
                not complicate their lives. Our platform brings together the best of modern 
                technology and traditional agricultural wisdom.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Our Story</h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  Agrihub was born in 2023 when three friends with diverse backgrounds—agriculture, 
                  technology, and business—came together with a shared vision: to create a platform 
                  that truly serves the farming community.
                </p>
                <p>
                  We saw farmers struggling to find fair prices for their produce, buyers searching 
                  endlessly for quality agricultural products, and a disconnect between traditional 
                  farming knowledge and modern agricultural science.
                </p>
                <p>
                  Today, Agrihub connects over 10,000 farmers with buyers across the country, 
                  provides AI-powered crop diagnostics, and hosts a thriving community where 
                  knowledge is freely shared. But we're just getting started.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-card py-16 md:py-24">
          <div className="container">
            <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
              Our Values
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className={cn(
                    "rounded-2xl border border-border bg-background p-8 text-center",
                    "animate-fade-up opacity-0"
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{value.title}</h3>
                  <p className="mt-2 text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founders */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="text-center font-display text-2xl font-bold md:text-3xl">
              Meet the Founders
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {founders.map((founder, index) => (
                <div
                  key={founder.name}
                  className={cn(
                    "group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300",
                    "hover:border-primary/30 hover:shadow-lg",
                    "animate-fade-up opacity-0"
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-5xl transition-transform group-hover:scale-110">
                    {founder.avatar}
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{founder.name}</h3>
                  <p className="text-sm font-medium text-primary">{founder.role}</p>
                  <p className="mt-4 text-sm text-muted-foreground">{founder.bio}</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <a
                      href={founder.linkedin}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href={founder.twitter}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary py-16">
          <div className="container">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: "2023", label: "Founded" },
                { value: "10K+", label: "Farmers" },
                { value: "28+", label: "States" },
                { value: "₹15Cr+", label: "Transactions" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-primary-foreground/80">{stat.label}</div>
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

export default Founders;
