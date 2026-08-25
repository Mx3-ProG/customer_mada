import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FREE_PLAN, type PlanState } from "@/lib/billing";

/** Current plan of the signed-in user. Superadmins are always unlimited. */
export const getMyPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PlanState> => {
    const { supabase, userId } = context;

    const { data: isSuperadmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "superadmin",
    });

    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const active = data?.plan === "pro" && ["active", "trialing", "past_due"].includes(data.status);

    return {
      ...FREE_PLAN,
      plan: active ? "pro" : "free",
      status: data?.status ?? "inactive",
      isPro: Boolean(active) || Boolean(isSuperadmin),
      unlimited: Boolean(isSuperadmin),
      currentPeriodEnd: data?.current_period_end ?? null,
      cancelAtPeriodEnd: Boolean(data?.cancel_at_period_end),
    };
  });

/**
 * Creates a Stripe Checkout session for the Pro plan (10 EUR / month).
 * Requires STRIPE_SECRET_KEY and STRIPE_PRICE_ID secrets; until they are set
 * the caller gets a clear "billing not configured yet" error.
 */
export const createProCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string }) => ({ origin: String(input.origin).slice(0, 300) }))
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const secretKey = process.env["STRIPE_SECRET_KEY"];
    const priceId = process.env["STRIPE_PRICE_ID"];
    if (!secretKey || !priceId) throw new Error("BILLING_NOT_CONFIGURED");

    const { supabase, userId, claims } = context;

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    const body = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${data.origin}/dashboard?checkout=success`,
      cancel_url: `${data.origin}/pricing?checkout=cancelled`,
      client_reference_id: userId,
      "metadata[user_id]": userId,
      "subscription_data[metadata][user_id]": userId,
      allow_promotion_codes: "true",
    });
    if (existing?.stripe_customer_id) body.set("customer", existing.stripe_customer_id);
    else if (typeof claims?.["email"] === "string") body.set("customer_email", claims["email"]);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) {
      throw new Error(json.error?.message ?? `Stripe error ${res.status}`);
    }
    return { url: json.url };
  });

/** Opens the Stripe billing portal so the user can manage or cancel the plan. */
export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string }) => ({ origin: String(input.origin).slice(0, 300) }))
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) throw new Error("BILLING_NOT_CONFIGURED");

    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!sub?.stripe_customer_id) throw new Error("NO_CUSTOMER");

    const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: sub.stripe_customer_id,
        return_url: `${data.origin}/dashboard`,
      }),
    });
    const json = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) throw new Error(json.error?.message ?? `Stripe error ${res.status}`);
    return { url: json.url };
  });
