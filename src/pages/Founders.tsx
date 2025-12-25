import { Target, Eye, Heart, Linkedin, Twitter, GraduationCap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const founders = [
  {
    name: "M. Shashank",
    role: "CEO & Co-Founder",
    bio: "Visionary leader with deep expertise in agricultural technology and rural development. Passionate about empowering Indian farmers through innovation and sustainable practices.",
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
];

const mentor = {
  name: "Dr. S. Poorani",
  role: "Faculty Mentor & Advisor",
  bio: "Distinguished agricultural scientist and educator with extensive research experience. Provides invaluable guidance combining deep domain knowledge with modern innovation practices.",
  avatar: "👩‍🔬",
  institution: "VIT Chennai",
  linkedin: "#",
};

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Founders = () => {
  return (
    <div className="flex min-h-screen flex-col theme-laterite bg-background" style={{ background: 'hsl(25 45% 95%)' }}>
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--forest-soil)/0.3),transparent_70%)]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container relative"
          >
            <div className="mx-auto max-w-3xl text-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20"
              >
                <Sparkles className="h-4 w-4" />
                About AgriHub
              </motion.span>
              <h1 className="mt-6 font-display text-4xl font-bold md:text-5xl lg:text-6xl">
                Building the Future of{" "}
                <span className="bg-gradient-to-r from-primary via-primary/80 to-success bg-clip-text text-transparent">
                  Indian Agriculture
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                We started AgriHub with a simple belief: technology should empower farmers, 
                not complicate their lives. Our platform brings together the best of modern 
                technology and traditional agricultural wisdom.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl"
            >
              <h2 className="font-display text-2xl font-bold md:text-3xl flex items-center gap-3">
                <span className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-success" />
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  AgriHub was born in 2023 when two passionate individuals with diverse backgrounds—agriculture 
                  and technology—came together with a shared vision: to create a platform 
                  that truly serves the farming community of India.
                </p>
                <p>
                  We saw farmers struggling to find fair prices for their produce, buyers searching 
                  endlessly for quality agricultural products, and a disconnect between traditional 
                  farming knowledge and modern agricultural science.
                </p>
                <p>
                  Under the mentorship of Dr. S. Poorani from VIT Chennai, we've built AgriHub to 
                  connect over 10,000 farmers with buyers across the country, provide AI-powered 
                  crop diagnostics, and host a thriving community where knowledge is freely shared.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-card/50">
          <div className="container">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center font-display text-2xl font-bold md:text-3xl"
            >
              Our Values
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-12 grid gap-8 md:grid-cols-3"
            >
              {values.map((value) => (
                <motion.div
                  key={value.title}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl border border-border bg-background p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 shadow-inner">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{value.title}</h3>
                  <p className="mt-3 text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Founders */}
        <section className="py-16 md:py-24">
          <div className="container">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center font-display text-2xl font-bold md:text-3xl"
            >
              Meet the Founders
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-12 grid gap-8 md:grid-cols-2 max-w-3xl mx-auto"
            >
              {founders.map((founder) => (
                <motion.div
                  key={founder.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-success/20 text-6xl shadow-lg"
                  >
                    {founder.avatar}
                  </motion.div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{founder.name}</h3>
                  <p className="text-sm font-medium text-primary">{founder.role}</p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{founder.bio}</p>
                  <div className="mt-6 flex justify-center gap-4">
                    <a
                      href={founder.linkedin}
                      className="p-2 rounded-lg text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href={founder.twitter}
                      className="p-2 rounded-lg text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Mentor Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-card/50 to-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success border border-success/20 mb-4">
                <GraduationCap className="h-4 w-4" />
                Faculty Mentorship
              </div>
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                Guided by Excellence
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-3xl border-2 border-success/20 bg-gradient-to-br from-success/5 to-primary/5 p-8 md:p-12 text-center shadow-xl">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-success/20 to-primary/20 text-7xl shadow-lg border-4 border-background"
                >
                  {mentor.avatar}
                </motion.div>
                <h3 className="mt-6 font-display text-2xl font-semibold">{mentor.name}</h3>
                <p className="text-primary font-medium">{mentor.role}</p>
                <p className="text-sm text-muted-foreground">{mentor.institution}</p>
                <p className="mt-6 text-muted-foreground leading-relaxed max-w-lg mx-auto">
                  {mentor.bio}
                </p>
                <div className="mt-6">
                  <a
                    href={mentor.linkedin}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                  >
                    <Linkedin className="h-4 w-4" />
                    Connect on LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-gradient-to-r from-primary via-primary/90 to-success">
          <div className="container">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {[
                { value: "2023", label: "Founded" },
                { value: "10K+", label: "Farmers" },
                { value: "28+", label: "States" },
                { value: "₹15Cr+", label: "Transactions" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="text-center"
                >
                  <div className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-primary-foreground/80 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Founders;
