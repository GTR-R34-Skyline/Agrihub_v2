/**
 * Real-time Notifications Hook - RLS Compliant
 * 
 * This hook subscribes to real-time changes for:
 * - New orders (for farmers with products in orders)
 * - New reviews (for farmers on their products)
 * - Order status updates (for buyers on their orders)
 * 
 * All queries are RLS-compliant and fail gracefully if permission is denied.
 */

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRealtimeNotifications() {
  const { user, roles } = useAuth();

  useEffect(() => {
    if (!user) return;

    const isFarmer = roles.includes('farmer');
    const isBuyer = roles.includes('buyer');

    // Subscribe to new orders (for farmers only)
    // RLS: order_items accessible if user's products are in the order
    let ordersChannel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isFarmer) {
      ordersChannel = supabase
        .channel("realtime-orders")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          async (payload) => {
            try {
              // Check if this user is a farmer with products in this order
              // RLS on order_items will filter to accessible items
              const { data: orderItems, error: itemsError } = await supabase
                .from("order_items")
                .select("product_id")
                .eq("order_id", payload.new.id);

              if (itemsError) {
                // Permission denied - user can't see this order's items
                console.log("Cannot access order items:", itemsError.message);
                return;
              }

              if (orderItems && orderItems.length > 0) {
                const productIds = orderItems.map((item) => item.product_id).filter(Boolean);

                // Check if any of these products belong to the farmer
                const { data: myProducts, error: productsError } = await supabase
                  .from("products")
                  .select("id")
                  .eq("seller_id", user.id)
                  .in("id", productIds as string[]);

                if (productsError) {
                  console.log("Cannot check products:", productsError.message);
                  return;
                }

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
            } catch (err) {
              console.error("Error processing order notification:", err);
            }
          }
        )
        .subscribe();
    }

    // Subscribe to new reviews (for farmers only)
    // RLS: reviews are publicly viewable, products filtered by seller_id
    let reviewsChannel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isFarmer) {
      reviewsChannel = supabase
        .channel("realtime-reviews")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "reviews" },
          async (payload) => {
            try {
              // Check if this review is for the user's product
              const { data: product, error: productError } = await supabase
                .from("products")
                .select("id, name")
                .eq("id", payload.new.product_id)
                .eq("seller_id", user.id)
                .maybeSingle();

              if (productError) {
                console.log("Cannot check product ownership:", productError.message);
                return;
              }

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
            } catch (err) {
              console.error("Error processing review notification:", err);
            }
          }
        )
        .subscribe();
    }

    // Subscribe to order status updates (for buyers only)
    // RLS: filter by buyer_id = auth.uid()
    let orderUpdatesChannel: ReturnType<typeof supabase.channel> | null = null;
    
    if (isBuyer) {
      orderUpdatesChannel = supabase
        .channel("realtime-order-updates")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` },
          async (payload) => {
            try {
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
            } catch (err) {
              console.error("Error processing order update notification:", err);
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (ordersChannel) supabase.removeChannel(ordersChannel);
      if (reviewsChannel) supabase.removeChannel(reviewsChannel);
      if (orderUpdatesChannel) supabase.removeChannel(orderUpdatesChannel);
    };
  }, [user, roles]);
}
