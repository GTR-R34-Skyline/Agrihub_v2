import { Heart, MessageCircle, Share2, Plus, TrendingUp, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const posts = [
  {
    id: "1",
    author: "Lakshmi Devi",
    avatar: "👩‍🌾",
    title: "Best practices for organic rice farming in Kharif season",
    content: "I've been experimenting with SRI (System of Rice Intensification) methods this season and the results are amazing! Here are my top tips for fellow rice farmers...",
    category: "Tips & Tricks",
    likes: 128,
    comments: 45,
    timeAgo: "2 hours ago",
  },
  {
    id: "2",
    author: "Venkat Rao",
    avatar: "👨‍🌾",
    title: "How I increased my tomato yield by 40%",
    content: "After attending the Agrihub advisory session with Dr. Deshmukh, I implemented drip irrigation and proper pruning techniques. The difference is incredible!",
    category: "Success Stories",
    likes: 256,
    comments: 89,
    timeAgo: "5 hours ago",
  },
  {
    id: "3",
    author: "Dr. Meera Krishnan",
    avatar: "👩‍🔬",
    title: "Understanding soil pH levels for different crops",
    content: "Many farmers overlook the importance of soil pH. Here's a comprehensive guide on testing and adjusting your soil's acidity for optimal crop growth...",
    category: "Education",
    likes: 342,
    comments: 67,
    timeAgo: "1 day ago",
  },
  {
    id: "4",
    author: "Kisaan Farms",
    avatar: "🌾",
    title: "Looking for buyers: Fresh harvest coming next week!",
    content: "We have 500kg of premium organic Basmati rice ready for harvest next Monday. Looking for direct buyers. Location: Punjab. DM for pricing!",
    category: "Marketplace",
    likes: 45,
    comments: 23,
    timeAgo: "3 hours ago",
  },
];

const categories = [
  "All Posts",
  "Tips & Tricks",
  "Success Stories",
  "Education",
  "Marketplace",
  "Questions",
];

const Community = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-card py-12">
          <div className="container">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Community</h1>
                <p className="mt-2 text-muted-foreground">
                  Connect, share, and learn with fellow farmers and agricultural experts.
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </div>

            {/* Categories */}
            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category, index) => (
                <button
                  key={category}
                  className={cn(
                    "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    index === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="py-8">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Sort Options */}
                <div className="mb-6 flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 font-medium text-primary">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Clock className="h-4 w-4" />
                    Latest
                  </button>
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <article
                      key={post.id}
                      className={cn(
                        "rounded-2xl border border-border bg-card p-6 transition-all duration-300",
                        "hover:border-primary/30 hover:shadow-md",
                        "animate-fade-up opacity-0"
                      )}
                      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
                    >
                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                          {post.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{post.author}</div>
                          <div className="text-xs text-muted-foreground">{post.timeAgo}</div>
                        </div>
                        <span className="ml-auto rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                          {post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="mt-4 font-display text-lg font-semibold hover:text-primary transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-muted-foreground line-clamp-2">{post.content}</p>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Trending Topics */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Trending Topics</h3>
                  <div className="mt-4 space-y-3">
                    {["#KharifSeason", "#OrganicFarming", "#MSP2024", "#CropPrices", "#FarmTech"].map((topic) => (
                      <div key={topic} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-primary hover:underline cursor-pointer">{topic}</span>
                        <span className="text-muted-foreground">125 posts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Members */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Top Contributors</h3>
                  <div className="mt-4 space-y-4">
                    {[
                      { name: "Lakshmi Devi", posts: 45, avatar: "👩‍🌾" },
                      { name: "Dr. Anita Deshmukh", posts: 38, avatar: "👩‍🔬" },
                      { name: "Venkat Rao", posts: 32, avatar: "👨‍🌾" },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.posts} posts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
