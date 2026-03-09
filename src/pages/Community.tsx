import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Plus, TrendingUp, Clock, Send, X, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_name?: string;
}

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

const categories = ["All Posts", "Tips & Tricks", "Success Stories", "Education", "Marketplace", "Questions"];

const Community = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [sortBy, setSortBy] = useState<"trending" | "latest">("latest");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
    if (user) fetchUserLikes();
  }, [activeCategory, sortBy, user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = (supabase.from("posts" as any) as any)
        .select("id, author_id, title, content, category, likes_count, comments_count, created_at")
        .order(sortBy === "trending" ? "likes_count" : "created_at", { ascending: false })
        .limit(50);

      if (activeCategory !== "All Posts") {
        query = query.eq("category", activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author names
      if (data && data.length > 0) {
        const authorIds = [...new Set(data.map((p: any) => p.author_id))] as string[];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", authorIds);

        const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name]) ?? []);
        setPosts(data.map((p: any) => ({ ...p, author_name: nameMap.get(p.author_id) ?? "User" })));
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await (supabase.from("post_likes" as any) as any)
      .select("post_id")
      .eq("user_id", user.id);
    if (data) setUserLikes(new Set(data.map((l: any) => l.post_id)));
  };

  const handleCreatePost = async () => {
    if (!user) { toast.error("Please sign in to create a post."); return; }
    if (!newPost.title.trim() || !newPost.content.trim()) { toast.error("Title and content are required."); return; }
    setSubmitting(true);
    try {
      const { error } = await (supabase.from("posts" as any) as any).insert({
        author_id: user.id,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
      });
      if (error) throw error;
      toast.success("Post created!");
      setShowCreatePost(false);
      setNewPost({ title: "", content: "", category: "General" });
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) { toast.error("Please sign in to like posts."); return; }
    const liked = userLikes.has(postId);
    try {
      if (liked) {
        await (supabase.from("post_likes" as any) as any).delete().eq("post_id", postId).eq("user_id", user.id);
        setUserLikes(prev => { const s = new Set(prev); s.delete(postId); return s; });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p));
      } else {
        await (supabase.from("post_likes" as any) as any).insert({ post_id: postId, user_id: user.id });
        setUserLikes(prev => new Set(prev).add(postId));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const fetchComments = async (postId: string) => {
    const { data } = await (supabase.from("comments" as any) as any)
      .select("id, post_id, author_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map((c: any) => c.author_id))] as string[];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds);
      const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name]) ?? []);
      setComments(prev => ({ ...prev, [postId]: data.map((c: any) => ({ ...c, author_name: nameMap.get(c.author_id) ?? "User" })) }));
    } else {
      setComments(prev => ({ ...prev, [postId]: [] }));
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) { toast.error("Please sign in to comment."); return; }
    if (!newComment.trim()) return;
    try {
      const { error } = await (supabase.from("comments" as any) as any).insert({
        post_id: postId,
        author_id: user.id,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
      fetchComments(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (err: any) {
      toast.error(err.message ?? "Failed to comment.");
    }
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) fetchComments(postId);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

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
              <Button className="gap-2" onClick={() => {
                if (!user) { toast.error("Please sign in to create a post."); return; }
                setShowCreatePost(true);
              }}>
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </div>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activeCategory === category
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
              <div className="lg:col-span-2">
                <div className="mb-6 flex items-center gap-4 text-sm">
                  <button
                    onClick={() => setSortBy("trending")}
                    className={cn("flex items-center gap-1", sortBy === "trending" ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground")}
                  >
                    <TrendingUp className="h-4 w-4" /> Trending
                  </button>
                  <button
                    onClick={() => setSortBy("latest")}
                    className={cn("flex items-center gap-1", sortBy === "latest" ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Clock className="h-4 w-4" /> Latest
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">
                    <MessageCircle className="mx-auto h-12 w-12 opacity-40 mb-4" />
                    <p>No posts yet. Be the first to share!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post, index) => (
                      <article
                        key={post.id}
                        className={cn(
                          "rounded-2xl border border-border bg-card p-6 transition-all duration-300",
                          "hover:border-primary/30 hover:shadow-md",
                          "animate-fade-up opacity-0"
                        )}
                        style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xl">
                            👤
                          </div>
                          <div>
                            <div className="font-medium">{post.author_name}</div>
                            <div className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</div>
                          </div>
                          <span className="ml-auto rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                            {post.category}
                          </span>
                        </div>

                        <h3 className="mt-4 font-display text-lg font-semibold">{post.title}</h3>
                        <p className="mt-2 text-muted-foreground line-clamp-3">{post.content}</p>

                        <div className="mt-4 flex items-center gap-6 border-t border-border pt-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={cn(
                              "flex items-center gap-2 text-sm transition-colors",
                              userLikes.has(post.id) ? "text-destructive" : "text-muted-foreground hover:text-primary"
                            )}
                          >
                            <Heart className={cn("h-4 w-4", userLikes.has(post.id) && "fill-current")} />
                            {post.likes_count}
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {post.comments_count}
                          </button>
                          <button
                            onClick={() => { navigator.clipboard.writeText(window.location.origin + `/community#${post.id}`); toast.success("Link copied!"); }}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
                          >
                            <Share2 className="h-4 w-4" /> Share
                          </button>
                        </div>

                        {/* Comments section */}
                        {expandedPost === post.id && (
                          <div className="mt-4 border-t border-border pt-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {(comments[post.id] ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">No comments yet.</p>
                              ) : (
                                (comments[post.id] ?? []).map((c) => (
                                  <div key={c.id} className="flex gap-2">
                                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-xs">👤</div>
                                    <div>
                                      <div className="text-xs">
                                        <span className="font-medium">{c.author_name}</span>
                                        <span className="text-muted-foreground ml-2">{timeAgo(c.created_at)}</span>
                                      </div>
                                      <p className="text-sm mt-0.5">{c.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            {user && (
                              <div className="mt-3 flex gap-2">
                                <Input
                                  placeholder="Write a comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                  className="text-sm"
                                />
                                <Button size="icon" onClick={() => handleComment(post.id)}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Trending Topics</h3>
                  <div className="mt-4 space-y-3">
                    {["#KharifSeason", "#OrganicFarming", "#MSP2026", "#CropPrices", "#FarmTech"].map((topic) => (
                      <div key={topic} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-primary cursor-pointer">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">Community Guidelines</h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>• Be respectful to all community members</li>
                    <li>• Share knowledge and experiences freely</li>
                    <li>• No spam or promotional content</li>
                    <li>• Ask questions — no question is too simple</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Create a Post</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                placeholder="What's on your mind?"
                value={newPost.title}
                onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Content *</Label>
              <Textarea
                placeholder="Share your thoughts, tips, or questions..."
                rows={5}
                value={newPost.content}
                onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))}
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={newPost.category}
                onChange={(e) => setNewPost(p => ({ ...p, category: e.target.value }))}
              >
                {categories.filter(c => c !== "All Posts").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" onClick={handleCreatePost} disabled={submitting}>
              {submitting ? "Posting..." : "Publish Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Community;
