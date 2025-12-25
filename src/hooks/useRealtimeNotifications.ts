import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRealtimeNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new orders (for farmers)
    const ordersChannel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          // Check if this user is a farmer with products in this order
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_id")
            .eq("order_id", payload.new.id);

          if (orderItems && orderItems.length > 0) {
            const productIds = orderItems.map((item) => item.product_id).filter(Boolean);
            
            const { data: myProducts } = await supabase
              .from("products")
              .select("id")
              .eq("seller_id", user.id)
              .in("id", productIds);

            if (myProducts && myProducts.length > 0) {
              // Insert notification for farmer
              await supabase.from("notifications").insert({
                user_id: user.id,
                type: "new_order",
                title: "New Order Received! 🛒",
                message: `You have a new order for ${myProducts.length} of your products.`,
                data: { orderId: payload.new.id },
              });

              toast.success("New order received!", {
                description: "Check your dashboard for details.",
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new reviews (for farmers)
    const reviewsChannel = supabase
      .channel("realtime-reviews")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews" },
        async (payload) => {
          // Check if this review is for the user's product
          const { data: product } = await supabase
            .from("products")
            .select("id, name")
            .eq("id", payload.new.product_id)
            .eq("seller_id", user.id)
            .maybeSingle();

          if (product) {
            // Insert notification for farmer
            await supabase.from("notifications").insert({
              user_id: user.id,
              type: "new_review",
              title: "New Review! ⭐",
              message: `Someone left a ${payload.new.rating}-star review on your product "${product.name}".`,
              data: { productId: product.id, reviewId: payload.new.id },
            });

            toast.success("New review on your product!", {
              description: `${payload.new.rating} star review received.`,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to order status updates (for buyers)
    const orderUpdatesChannel = supabase
      .channel("realtime-order-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` },
        async (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new.status;

          if (oldStatus !== newStatus) {
            const statusMessages: Record<string, string> = {
              confirmed: "Your order has been confirmed! 🎉",
              shipped: "Your order is on the way! 🚚",
              delivered: "Your order has been delivered! 📦",
              cancelled: "Your order has been cancelled.",
            };

            const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;

            await supabase.from("notifications").insert({
              user_id: user.id,
              type: "order_update",
              title: "Order Update",
              message,
              data: { orderId: payload.new.id, status: newStatus },
            });

            toast.info("Order Update", { description: message });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(orderUpdatesChannel);
    };
  }, [user]);
}
