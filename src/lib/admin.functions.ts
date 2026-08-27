import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Client } from "@/lib/clients";

export type AdminClientRow = Client & { owner_email: string };

export const listAllClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminClientRow[]> => {
    const { data: isSuperadmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "superadmin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isSuperadmin) throw new Error("Forbidden");

    // RLS lets a superadmin read every row; no service-role needed for the data.
    const { data, error } = await context.supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as unknown as AdminClientRow[];

    // Owner emails live in auth.users, which only the admin API can read.
    const emails = new Map<string, string>();
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      users?.users.forEach((u) => emails.set(u.id, u.email ?? ""));
    } catch {
      /* fall back to ids */
    }

    return rows.map((r) => ({
      ...r,
      owner_email: emails.get(r.user_id) || `${r.user_id.slice(0, 8)}…`,
    }));
  });

export type AdminSubscriptionRow = {
  user_id: string;
  owner_email: string;
  plan: "free" | "pro";
  status: string;
};

async function requireSuperadmin(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userId: string;
}) {
  const { data: isSuperadmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superadmin",
  });
  if (error) throw new Error(error.message);
  if (!isSuperadmin) throw new Error("Forbidden");
}

/** All accounts with their current billing plan — superadmin only. */
export const listAllSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSubscriptionRow[]> => {
    await requireSuperadmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (usersError) throw new Error(usersError.message);

    const { data: subs, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan, status");
    if (subsError) throw new Error(subsError.message);

    const byUser = new Map(subs?.map((s) => [s.user_id, s]) ?? []);

    return (users?.users ?? []).map((u) => {
      const sub = byUser.get(u.id);
      return {
        user_id: u.id,
        owner_email: u.email ?? `${u.id.slice(0, 8)}…`,
        plan: (sub?.plan as "free" | "pro" | undefined) ?? "free",
        status: sub?.status ?? "inactive",
      };
    });
  });

/** Manually override a user's plan — superadmin only, bypasses Stripe. */
export const setUserPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; plan: "free" | "pro" }) => ({
    userId: String(input.userId),
    plan: input.plan === "pro" ? "pro" : "free",
  }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireSuperadmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: data.userId,
        plan: data.plan,
        status: data.plan === "pro" ? "active" : "inactive",
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
