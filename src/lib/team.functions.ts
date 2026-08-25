import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TeamRole, TeamState } from "@/lib/team";

export const getMyTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamState> => {
    const { loadTeamState } = await import("@/lib/team.server");
    return loadTeamState(context as any);
  });

export const createMyTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string }) => ({ name: String(input.name).trim().slice(0, 80) }))
  .handler(async ({ data, context }) => {
    const { hasTeamAccess } = await import("@/lib/team.server");
    const ctx = context as any;
    if (!(await hasTeamAccess(ctx))) throw new Error("PRO_REQUIRED");
    const { error } = await ctx.supabase
      .from("teams")
      .insert({ owner_id: ctx.userId, name: data.name || "Mon espace" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameMyTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string }) => ({ name: String(input.name).trim().slice(0, 80) }))
  .handler(async ({ data, context }) => {
    const ctx = context as any;
    const { error } = await ctx.supabase
      .from("teams")
      .update({ name: data.name })
      .eq("owner_id", ctx.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const inviteTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; role: TeamRole }) => ({
    email: String(input.email).trim().toLowerCase().slice(0, 255),
    role: input.role === "moderator" ? ("moderator" as const) : ("employee" as const),
  }))
  .handler(async ({ data, context }): Promise<{ token: string }> => {
    const { hasTeamAccess, ctxEmail } = await import("@/lib/team.server");
    const ctx = context as any;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error("INVALID_EMAIL");
    if (!(await hasTeamAccess(ctx))) throw new Error("PRO_REQUIRED");
    if (data.email === ctxEmail(ctx)) throw new Error("SELF_INVITE");

    const { data: team } = await ctx.supabase
      .from("teams")
      .select("id")
      .eq("owner_id", ctx.userId)
      .maybeSingle();
    if (!team) throw new Error("NO_TEAM");

    const { data: row, error } = await ctx.supabase
      .from("team_invitations")
      .insert({ team_id: team.id, email: data.email, role: data.role, invited_by: ctx.userId })
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    return { token: row.token as string };
  });

export const revokeInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const { error } = await (context as any).supabase
      .from("team_invitations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeTeamMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data, context }) => {
    const { error } = await (context as any).supabase
      .from("team_members")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setTeamMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; role: TeamRole }) => ({
    id: String(input.id),
    role: input.role === "moderator" ? ("moderator" as const) : ("employee" as const),
  }))
  .handler(async ({ data, context }) => {
    const { error } = await (context as any).supabase
      .from("team_members")
      .update({ role: data.role })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acceptInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { token: string }) => ({ token: String(input.token).slice(0, 64) }))
  .handler(async ({ data, context }) => {
    const { acceptInvitationFor } = await import("@/lib/team.server");
    return acceptInvitationFor(context as any, data.token);
  });

export const leaveTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as any;
    const { error } = await ctx.supabase.from("team_members").delete().eq("user_id", ctx.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
