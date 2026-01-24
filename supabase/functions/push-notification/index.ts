import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID keys for Web Push (generate with: npx web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:support@islakayd.com";

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

// Web Push implementation using native crypto
async function sendWebPush(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Import web-push compatible library
    const webPush = await import("https://esm.sh/web-push@3.6.6");
    
    webPush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 86400, // 24 hours
        urgency: "normal",
      }
    );

    return true;
  } catch (error) {
    console.error("Push notification error:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...data } = await req.json();

    switch (action) {
      case "subscribe": {
        // Register push subscription for a user
        const { userId, subscription, deviceInfo } = data;

        const { error } = await supabase
          .from("push_subscriptions")
          .upsert({
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            device_info: deviceInfo || {},
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "endpoint",
          });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: "Subscription registered" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "unsubscribe": {
        // Remove push subscription
        const { endpoint } = data;

        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", endpoint);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: "Subscription removed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send": {
        // Send notification to specific user(s)
        const { userId, userIds, notification } = data;
        
        const targetUserIds = userIds || (userId ? [userId] : []);
        
        if (targetUserIds.length === 0) {
          throw new Error("No target users specified");
        }

        // Get all subscriptions for target users
        const { data: subscriptions, error } = await supabase
          .from("push_subscriptions")
          .select("*")
          .in("user_id", targetUserIds);

        if (error) throw error;

        if (!subscriptions || subscriptions.length === 0) {
          return new Response(
            JSON.stringify({ success: false, message: "No subscriptions found", sent: 0 }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prepare notification payload
        const payload: NotificationPayload = {
          title: notification.title || "Islakayd",
          body: notification.body || "",
          icon: notification.icon || "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          image: notification.image,
          tag: notification.tag || `notification-${Date.now()}`,
          data: {
            url: notification.url || "/",
            ...notification.data,
          },
          actions: notification.actions || [
            { action: "view", title: "View" },
            { action: "dismiss", title: "Dismiss" },
          ],
          requireInteraction: notification.requireInteraction || false,
        };

        // Send to all subscriptions
        const results = await Promise.allSettled(
          subscriptions.map(async (sub) => {
            const subscription: PushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            };

            const success = await sendWebPush(subscription, payload);

            // If push failed (expired subscription), clean it up
            if (!success) {
              await supabase
                .from("push_subscriptions")
                .delete()
                .eq("id", sub.id);
            }

            return success;
          })
        );

        const sentCount = results.filter(r => r.status === "fulfilled" && r.value).length;

        // Log notification
        await supabase.from("notification_logs").insert({
          user_ids: targetUserIds,
          title: payload.title,
          body: payload.body,
          sent_count: sentCount,
          total_subscriptions: subscriptions.length,
          created_at: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            sent: sentCount, 
            total: subscriptions.length 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "broadcast": {
        // Send notification to all users (admin only)
        const { notification, filters } = data;

        let query = supabase.from("push_subscriptions").select("*");

        // Apply filters if provided
        if (filters?.is_verified) {
          query = query.eq("user_id.is_verified", true);
        }

        const { data: subscriptions, error } = await query;

        if (error) throw error;

        const payload: NotificationPayload = {
          title: notification.title || "Islakayd Announcement",
          body: notification.body || "",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          tag: `broadcast-${Date.now()}`,
          data: {
            url: notification.url || "/",
            type: "broadcast",
          },
        };

        const results = await Promise.allSettled(
          (subscriptions || []).map(async (sub) => {
            const subscription: PushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            };
            return sendWebPush(subscription, payload);
          })
        );

        const sentCount = results.filter(r => r.status === "fulfilled" && r.value).length;

        return new Response(
          JSON.stringify({ 
            success: true, 
            sent: sentCount, 
            total: subscriptions?.length || 0 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get-vapid-key": {
        // Return public VAPID key for client-side subscription
        return new Response(
          JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
