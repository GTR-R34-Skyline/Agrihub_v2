import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Consultation {
  id: string;
  advisor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  topic: string;
  notes: string | null;
  status: string;
  created_at: string;
  advisor_name?: string;
}

interface MyConsultationsProps {
  userId: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Confirmed" },
  completed: { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Completed" },
  cancelled: { icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20", label: "Cancelled" },
};

export const MyConsultations = ({ userId }: MyConsultationsProps) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, [userId]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      // Fetch consultations with advisor info
      const { data, error } = await (supabase.from("consultations" as any) as any)
        .select("id, advisor_id, scheduled_date, scheduled_time, duration_minutes, topic, notes, status, created_at")
        .eq("farmer_id", userId)
        .order("scheduled_date", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch advisor names for display
      if (data && data.length > 0) {
        const advisorIds = [...new Set(data.map((c: any) => c.advisor_id))] as string[];
        const { data: advisors } = await supabase
          .from("advisors")
          .select("id, display_name")
          .in("id", advisorIds);

        const advisorMap = new Map(advisors?.map((a: any) => [a.id, a.display_name]) ?? []);
        const enriched = data.map((c: any) => ({
          ...c,
          advisor_name: advisorMap.get(c.advisor_id) ?? "Advisor",
        }));
        setConsultations(enriched);
      } else {
        setConsultations([]);
      }
    } catch (err) {
      console.error("Error fetching consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = consultations.filter(
    (c) => c.scheduled_date >= today && c.status !== "cancelled" && c.status !== "completed"
  );
  const past = consultations.filter(
    (c) => c.scheduled_date < today || c.status === "completed" || c.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="rounded-2xl bg-laterite-surface border border-border/20 p-6 shadow-lg">
        <h2 className="font-display text-xl font-bold mb-4 text-laterite-text flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Consultations
        </h2>
        <div className="animate-pulse text-sm text-muted-foreground py-4 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-laterite-surface border border-border/20 p-6 shadow-lg">
      <h2 className="font-display text-xl font-bold mb-6 text-laterite-text flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        My Consultations
      </h2>

      {consultations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No consultations booked yet.</p>
          <p className="text-xs mt-1">Visit the Advisory page to book one.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Upcoming</h3>
              <div className="space-y-3">
                {upcoming.map((c) => (
                  <ConsultationCard key={c.id} consultation={c} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Past</h3>
              <div className="space-y-3">
                {past.map((c) => (
                  <ConsultationCard key={c.id} consultation={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
  const config = statusConfig[consultation.status] ?? statusConfig.pending;
  const StatusIcon = config.icon;
  const dateStr = new Date(consultation.scheduled_date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Calendar className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate">{consultation.topic}</p>
          <Badge variant="outline" className={`text-xs ${config.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          with <span className="font-medium">{consultation.advisor_name}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span>{dateStr}</span>
          <span>•</span>
          <span>{consultation.scheduled_time}</span>
          <span>•</span>
          <span>{consultation.duration_minutes} min</span>
        </p>
      </div>
    </div>
  );
};
