import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatPartner {
  user_id: string;
  name: string;
  lastMessage?: string;
  lastTime?: string;
  unread: number;
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientName?: string;
}

export const ChatDrawer = ({ open, onClose, recipientId, recipientName }: ChatDrawerProps) => {
  const { user, profile } = useAuth();
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [activePartner, setActivePartner] = useState<string | null>(recipientId ?? null);
  const [activeName, setActiveName] = useState(recipientName ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipientId) {
      setActivePartner(recipientId);
      setActiveName(recipientName ?? "User");
    }
  }, [recipientId, recipientName]);

  useEffect(() => {
    if (!user || !open) return;
    fetchPartners();

    // Realtime subscription
    const channel = supabase
      .channel("chat-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          if (msg.sender_id === activePartner || msg.receiver_id === activePartner) {
            setMessages((prev) => [...prev, msg]);
          }
          fetchPartners();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, open, activePartner]);

  useEffect(() => {
    if (activePartner && user) fetchMessages(activePartner);
  }, [activePartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchPartners = async () => {
    if (!user) return;
    // Get all unique conversation partners
    const { data } = await (supabase.from("messages" as any) as any)
      .select("sender_id, receiver_id, content, created_at, is_read")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!data) return;

    const partnerMap = new Map<string, { lastMessage: string; lastTime: string; unread: number }>();
    (data as Message[]).forEach((msg) => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          lastMessage: msg.content,
          lastTime: msg.created_at,
          unread: !msg.is_read && msg.receiver_id === user.id ? 1 : 0,
        });
      } else if (!msg.is_read && msg.receiver_id === user.id) {
        const existing = partnerMap.get(partnerId)!;
        existing.unread++;
      }
    });

    // Fetch partner names
    const partnerIds = [...partnerMap.keys()];
    if (partnerIds.length === 0) { setPartners([]); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", partnerIds);

    const nameMap = new Map(profiles?.map((p: any) => [p.user_id, p.full_name ?? "User"]) ?? []);

    setPartners(
      partnerIds.map((id) => ({
        user_id: id,
        name: nameMap.get(id) ?? "User",
        ...partnerMap.get(id)!,
      }))
    );
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase.from("messages" as any) as any)
      .select("id, sender_id, receiver_id, content, is_read, created_at")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(100);

    setMessages((data as Message[]) ?? []);
    setLoading(false);

    // Mark as read
    await (supabase.from("messages" as any) as any)
      .update({ is_read: true })
      .eq("sender_id", partnerId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  };

  const sendMessage = async () => {
    if (!user || !activePartner || !newMessage.trim()) return;
    try {
      const { error } = await (supabase.from("messages" as any) as any).insert({
        sender_id: user.id,
        receiver_id: activePartner,
        content: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send message.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            {activePartner ? activeName : "Messages"}
          </h2>
          <div className="flex items-center gap-2">
            {activePartner && (
              <Button variant="ghost" size="sm" onClick={() => { setActivePartner(null); setActiveName(""); }}>
                Back
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!activePartner ? (
          <div className="flex-1 overflow-y-auto">
            {partners.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto opacity-40 mb-4" />
                <p>No conversations yet.</p>
                <p className="text-xs mt-1">Start a chat from a product page.</p>
              </div>
            ) : (
              partners.map((p) => (
                <button
                  key={p.user_id}
                  onClick={() => { setActivePartner(p.user_id); setActiveName(p.name); }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">👤</div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{p.name}</span>
                      {p.unread > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {p.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{p.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      msg.sender_id === user?.id
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-4 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
