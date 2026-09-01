import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  NO_PLAN,
  TRIAL_DAYS,
  type PlanKind,
  type PlanState,
} from "@/lib/billing";

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
      .select(
        "plan, status, current_period_end, cancel_at_period_end, trial_end",
      )
      .eq("user_id", userId)
      .maybeSingle();

    const plan = (data?.plan ?? null) as PlanKind | null;
    const active =
      plan !== null &&
      ["active", "trialing", "past_due"].includes(data?.status ?? "");

    return {
      ...NO_PLAN,
      plan,
      status: data?.status ?? "inactive",
      isPro: Boolean(active) || Boolean(isSuperadmin),
      unlimited: Boolean(isSuperadmin),
      trialEnd: data?.trial_end ?? null,
      currentPeriodEnd: data?.current_period_end ?? null,
      cancelAtPeriodEnd: Boolean(data?.cancel_at_period_end),
    };
  });

/**
 * Creates a Stripe Checkout session for the monthly (39.99 EUR) or annual (399 EUR) plan.
 * New accounts (no prior subscription row) get a 14-day trial with no card required;
 * new accounts choosing monthly also get a discounted first month (19.99 EUR).
 * Requires STRIPE_SECRET_KEY, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_ANNUAL secrets
 * (STRIPE_COUPON_FIRST_MONTH for the first-month discount) — until they are set the
 * caller gets a clear "billing not configured yet" error.
 */
export const createProCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string; interval: PlanKind }) => ({
    origin: String(input.origin).slice(0, 300),
    interval:
      input.interval === "annual" ? ("annual" as const) : ("monthly" as const),
  }))
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const secretKey = process.env["STRIPE_SECRET_KEY"];
    const priceId =
      data.interval === "annual"
        ? process.env["STRIPE_PRICE_ID_ANNUAL"]
        : process.env["STRIPE_PRICE_ID_MONTHLY"];
    if (!secretKey || !priceId) throw new Error("BILLING_NOT_CONFIGURED");

    const { supabase, userId, claims } = context;

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    // A subscriptions row only ever exists once a checkout has been started before —
    // its absence is how we recognize a genuinely new account for the trial/discount.
    const isNewAccount = !existing;

    const body = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${data.origin}/dashboard?checkout=success`,
      cancel_url: `${data.origin}/pricing?checkout=cancelled`,
      client_reference_id: userId,
      "metadata[user_id]": userId,
      "subscription_data[metadata][user_id]": userId,
    });

    if (isNewAccount) {
      body.set("payment_method_collection", "if_required");
      body.set("subscription_data[trial_period_days]", String(TRIAL_DAYS));
      body.set(
        "subscription_data[trial_settings][end_behavior][missing_payment_method]",
        "cancel",
      );

      const coupon = process.env["STRIPE_COUPON_FIRST_MONTH"];
      if (data.interval === "monthly" && coupon) {
        // `discounts` and `allow_promotion_codes` are mutually exclusive on a Checkout Session.
        body.set("discounts[0][coupon]", coupon);
      } else {
        body.set("allow_promotion_codes", "true");
      }
    } else {
      body.set("allow_promotion_codes", "true");
    }

    if (existing?.stripe_customer_id)
      body.set("customer", existing.stripe_customer_id);
    else if (typeof claims?.["email"] === "string")
      body.set("customer_email", claims["email"]);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = (await res.json()) as {
      url?: string;
      error?: { message?: string };
    };
    if (!res.ok || !json.url) {
      throw new Error(json.error?.message ?? `Stripe error ${res.status}`);
    }
    return { url: json.url };
  });

/** Opens the Stripe billing portal so the user can manage or cancel the plan. */
export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { origin: string }) => ({
    origin: String(input.origin).slice(0, 300),
  }))
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) throw new Error("BILLING_NOT_CONFIGURED");

    const { data: sub } = await context.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!sub?.stripe_customer_id) throw new Error("NO_CUSTOMER");

    const res = await fetch(
      "https://api.stripe.com/v1/billing_portal/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          customer: sub.stripe_customer_id,
          return_url: `${data.origin}/dashboard`,
        }),
      },
    );
    const json = (await res.json()) as {
      url?: string;
      error?: { message?: string };
    };
    if (!res.ok || !json.url)
      throw new Error(json.error?.message ?? `Stripe error ${res.status}`);
    return { url: json.url };
  });
