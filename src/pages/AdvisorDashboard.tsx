import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CheckCircle, XCircle, MessageCircle, Users, Star, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/shared/WeatherWidget";

interface Consultation {
  id: string;
  farmer_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  topic: string;
  notes: string | null;
  status: string;
  created_at: string;
  farmer_name?: string;
}

const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { user, hasRole, profile, isLoading: authLoading } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [advisorInfo, setAdvisorInfo] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || !hasRole("agronomist"))) {
      toast.error("Access denied. Agronomist role required.");
      navigate("/");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get advisor record
      const { data: advisor } = await supabase
        .from("advisors")
        .select("id, display_name, specialization, rating, total_consultations, hourly_rate")
        .eq("user_id", user.id)
        .single();

      setAdvisorInfo(advisor);

      if (advisor) {
        // Fetch consultations
        const { data: consults } = await (supabase.from("consultations" as any) as any)
          .select("id, farmer_id, scheduled_date, scheduled_time, duration_minutes, topic, notes, status, created_at")
          .eq("advisor_id", advisor.id)
          .order("scheduled_date", { ascending: false });

        if (consults && consults.length > 0) {
          const farmerIds = [...new Set(consults.map((c: any) => c.farmer_id))] as string[];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", farmerIds);

          const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name ?? "Farmer"]) ?? []);
          setConsultations(consults.map((c: any) => ({ ...c, farmer_name: nameMap.get(c.farmer_id) ?? "Farmer" })));
        }
      }
    } catch (err) {
      console.error("Error fetching advisor data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (id: string, status: string) => {
    try {
      const { error } = await (supabase.from("consultations" as any) as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Consultation ${status}.`);
      setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const pending = consultations.filter((c) => c.status === "pending");
  const upcoming = consultations.filter((c) => c.status === "confirmed" && c.scheduled_date >= today);
  const past = consultations.filter((c) => c.status === "completed" || c.scheduled_date < today);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Advisor Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage your consultations and profile</p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Consultations", value: advisorInfo?.total_consultations ?? 0, icon: Users, color: "text-blue-500" },
              { label: "Rating", value: advisorInfo ? `${Number(advisorInfo.rating).toFixed(1)} ⭐` : "N/A", icon: Star, color: "text-warning" },
              { label: "Pending Requests", value: pending.length, icon: Clock, color: "text-amber-500" },
              { label: "Hourly Rate", value: `₹${advisorInfo?.hourly_rate ?? 0}`, icon: Calendar, color: "text-primary" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                <div className={`h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Pending Requests */}
              {pending.length > 0 && (
                <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Pending Requests ({pending.length})
                  </h2>
                  <div className="space-y-4">
                    {pending.map((c) => (
                      <div key={c.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{c.topic}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              From: <span className="font-medium">{c.farmer_name}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(c.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at {c.scheduled_time} • {c.duration_minutes} min
                            </p>
                            {c.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{c.notes}"</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updateConsultationStatus(c.id, "confirmed")} className="gap-1">
                              <CheckCircle className="h-4 w-4" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateConsultationStatus(c.id, "cancelled")} className="gap-1 text-destructive">
                              <XCircle className="h-4 w-4" /> Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming */}
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Sessions
                </h2>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No upcoming sessions.</p>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((c) => (
                      <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border p-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{c.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            {c.farmer_name} • {new Date(c.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {c.scheduled_time}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Confirmed</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past */}
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Past Sessions
                </h2>
                {past.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No past sessions.</p>
                ) : (
                  <div className="space-y-3">
                    {past.slice(0, 10).map((c) => (
                      <div key={c.id} className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
                        <div className="flex-1">
                          <p className="font-medium">{c.topic}</p>
                          <p className="text-sm text-muted-foreground">
                            {c.farmer_name} • {new Date(c.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          {c.status === "completed" ? "Completed" : c.status === "cancelled" ? "Cancelled" : "Past"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <WeatherWidget location={profile?.location ?? "India"} />

              {/* Profile Summary */}
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold mb-4">Your Profile</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{advisorInfo?.display_name ?? profile?.full_name ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Specializations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(advisorInfo?.specialization ?? []).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdvisorDashboard;
