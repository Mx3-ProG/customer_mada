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
