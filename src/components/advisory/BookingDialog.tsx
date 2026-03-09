import { useState } from "react";
import { Calendar, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Advisor {
  id: string;
  display_name: string | null;
  hourly_rate: number;
  specialization: string[];
}

interface BookingDialogProps {
  advisor: Advisor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

export const BookingDialog = ({ advisor, open, onOpenChange }: BookingDialogProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (!user || !advisor) return;
    if (!date || !time || !topic.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("consultations").insert({
        farmer_id: user.id,
        advisor_id: advisor.id,
        scheduled_date: date,
        scheduled_time: time,
        topic: topic.trim(),
        notes: notes.trim() || null,
        duration_minutes: 60,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Consultation booked successfully! The advisor will confirm shortly.");
      onOpenChange(false);
      setDate("");
      setTime("");
      setTopic("");
      setNotes("");
    } catch (err: any) {
      console.error("Booking error:", err);
      toast.error(err.message ?? "Failed to book consultation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!advisor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Book a Consultation</DialogTitle>
          <DialogDescription>
            Schedule a session with{" "}
            <span className="font-semibold text-foreground">
              {advisor.display_name ?? "Advisor"}
            </span>{" "}
            — ₹{Number(advisor.hourly_rate)}/hour
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-date">
              <Calendar className="mr-1 inline h-4 w-4" />
              Date *
            </Label>
            <Input
              id="booking-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Clock className="mr-1 inline h-4 w-4" />
              Time Slot *
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-topic">Topic *</Label>
            <Input
              id="booking-topic"
              placeholder="e.g. Rice pest issue, Soil testing advice"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-notes">Additional Notes</Label>
            <Textarea
              id="booking-notes"
              placeholder="Any details the advisor should know beforehand..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
