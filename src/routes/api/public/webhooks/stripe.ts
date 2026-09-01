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
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret)
          return new Response("Billing not configured", { status: 503 });

        const payload = await request.text();
        if (!verify(payload, request.headers.get("stripe-signature"), secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(payload) as StripeEvent;
        const object = event.data.object;
        const metadata = (object["metadata"] ?? {}) as Record<string, string>;
        const userId =
          metadata["user_id"] ??
          (object["client_reference_id"] as string | undefined) ??
          null;

        const relevant = [
          "checkout.session.completed",
          "customer.subscription.created",
          "customer.subscription.updated",
          "customer.subscription.deleted",
        ];
        if (!relevant.includes(event.type)) return new Response("ignored");
        if (!userId) return new Response("no user reference", { status: 202 });

        const { supabaseAdmin } =
          await import("@/integrations/supabase/client.server");

        if (event.type === "checkout.session.completed") {
          // A Checkout Session doesn't carry plan/price/trial data — just link identity here;
          // the customer.subscription.* event fired moments later is the source of truth below.
          const { error } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id:
                (object["customer"] as string | undefined) ?? null,
              stripe_subscription_id:
                (object["subscription"] as string | undefined) ?? null,
            },
            { onConflict: "user_id" },
          );
          if (error) {
            console.error("stripe webhook upsert failed", error.message);
            return new Response("db error", { status: 500 });
          }
          return new Response("ok");
        }

        const deleted = event.type === "customer.subscription.deleted";
        const status = deleted
          ? "canceled"
          : ((object["status"] as string) ?? "active");
        const periodEnd = object["current_period_end"] as number | undefined;
        const trialEnd = object["trial_end"] as number | null | undefined;
        const items = object["items"] as
          { data?: { price?: { id?: string } }[] } | undefined;
        const priceId = items?.data?.[0]?.price?.id;
        const plan =
          !deleted && priceId === process.env["STRIPE_PRICE_ID_ANNUAL"]
            ? "annual"
            : !deleted && priceId === process.env["STRIPE_PRICE_ID_MONTHLY"]
              ? "monthly"
              : null;

        const { error } = await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan,
            status,
            stripe_customer_id:
              (object["customer"] as string | undefined) ?? null,
            stripe_subscription_id:
              (object["id"] as string | undefined) ?? null,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            trial_end: trialEnd
              ? new Date(trialEnd * 1000).toISOString()
              : null,
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
