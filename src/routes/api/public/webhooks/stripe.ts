import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

function verify(payload: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k?.trim() ?? "", v.join("=")];
    }),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return new Response("Billing not configured", { status: 503 });

        const payload = await request.text();
        if (!verify(payload, request.headers.get("stripe-signature"), secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(payload) as StripeEvent;
        const object = event.data.object;
        const metadata = (object["metadata"] ?? {}) as Record<string, string>;
        const userId =
          metadata["user_id"] ?? (object["client_reference_id"] as string | undefined) ?? null;

        const relevant = [
          "checkout.session.completed",
          "customer.subscription.created",
          "customer.subscription.updated",
          "customer.subscription.deleted",
        ];
        if (!relevant.includes(event.type)) return new Response("ignored");
        if (!userId) return new Response("no user reference", { status: 202 });

        const deleted = event.type === "customer.subscription.deleted";
        const status = deleted ? "canceled" : ((object["status"] as string) ?? "active");
        const periodEnd = object["current_period_end"] as number | undefined;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: deleted || status === "canceled" ? "free" : "pro",
            status,
            stripe_customer_id: (object["customer"] as string | undefined) ?? null,
            stripe_subscription_id:
              (object["subscription"] as string | undefined) ??
              (object["id"] as string | undefined) ??
              null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            cancel_at_period_end: Boolean(object["cancel_at_period_end"]),
          },
          { onConflict: "user_id" },
        );
        if (error) {
          console.error("stripe webhook upsert failed", error.message);
          return new Response("db error", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
