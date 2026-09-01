import type {
  TeamRole,
  TeamState,
  TeamMemberRow,
  TeamInvitationRow,
} from "@/lib/team";
import { EMPTY_TEAM_STATE } from "@/lib/team";

/** Minimal shape of the authenticated server-fn context. */
export type TeamCtx = {
  supabase: any;
  userId: string;
  claims: Record<string, unknown> | null;
};

export function ctxEmail(context: TeamCtx): string {
  const raw = context.claims?.["email"];
  return typeof raw === "string" ? raw.toLowerCase() : "";
}

/** Team spaces are a Pro feature; superadmins always have access. */
export async function hasTeamAccess(context: TeamCtx): Promise<boolean> {
  const { data: isSuperadmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "superadmin",
  });
  if (isSuperadmin) return true;
  const { data } = await context.supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", context.userId)
    .maybeSingle();
  return (
    (data?.plan === "monthly" || data?.plan === "annual") &&
    ["active", "trialing", "past_due"].includes(data.status)
  );
}

async function emailsFor(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  try {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });
    data?.users.forEach((u) => map.set(u.id, u.email ?? ""));
  } catch {
    /* fall back to ids */
  }
  return map;
}

export async function loadTeamState(context: TeamCtx): Promise<TeamState> {
  const { supabase, userId } = context;

  const { data: ownTeam } = await supabase
    .from("teams")
    .select("id, name, owner_id")
    .eq("owner_id", userId)
    .maybeSingle();

  let team: TeamState["team"] = ownTeam ?? null;
  let myRole: TeamRole | null = ownTeam ? "moderator" : null;

  if (!team) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("role, teams(id, name, owner_id)")
      .eq("user_id", userId)
      .maybeSingle();
    if (membership?.teams) {
      team = membership.teams as TeamState["team"];
      myRole = membership.role as TeamRole;
    }
  }

  const email = ctxEmail(context);
  const pendingForMe: TeamState["pendingForMe"] = [];
  if (email) {
    try {
      const { supabaseAdmin } =
        await import("@/integrations/supabase/client.server");
      const { data: invites } = await supabaseAdmin
        .from("team_invitations")
        .select("token, role, status, expires_at, teams(name)")
        .eq("email", email)
        .eq("status", "pending");
      (invites ?? []).forEach((i: any) => {
        if (new Date(i.expires_at).getTime() < Date.now()) return;
        pendingForMe.push({
          token: i.token,
          teamName: i.teams?.name ?? "",
          role: i.role as TeamRole,
        });
      });
    } catch {
      /* ignore */
    }
  }

  if (!team) return { ...EMPTY_TEAM_STATE, pendingForMe };

  const isOwner = team.owner_id === userId;
  const canManage = isOwner || myRole === "moderator";

  const { data: memberRows } = await supabase
    .from("team_members")
    .select("id, user_id, role, created_at")
    .eq("team_id", team.id)
    .order("created_at", { ascending: true });

  const ids = [
    team.owner_id,
    ...(memberRows ?? []).map((m: any) => m.user_id as string),
  ];
  const emails = await emailsFor(ids);

  const members: TeamMemberRow[] = [
    {
      id: `owner-${team.owner_id}`,
      user_id: team.owner_id,
      email: emails.get(team.owner_id) || `${team.owner_id.slice(0, 8)}…`,
      role: "moderator",
      isOwner: true,
      created_at: "",
    },
    ...(memberRows ?? []).map((m: any) => ({
      id: m.id as string,
      user_id: m.user_id as string,
      email: emails.get(m.user_id) || `${String(m.user_id).slice(0, 8)}…`,
      role: m.role as TeamRole,
      isOwner: false,
      created_at: m.created_at as string,
    })),
  ];

  let invitations: TeamInvitationRow[] = [];
  if (canManage) {
    const { data: inv } = await supabase
      .from("team_invitations")
      .select("id, email, role, token, status, expires_at, created_at")
      .eq("team_id", team.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    invitations = (inv ?? []) as TeamInvitationRow[];
  }

  return {
    team,
    myRole,
    isOwner,
    canManage,
    members,
    invitations,
    pendingForMe,
  };
}

export async function acceptInvitationFor(context: TeamCtx, token: string) {
  const email = ctxEmail(context);
  if (!email) throw new Error("NO_EMAIL");

  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  const { data: invite } = await supabaseAdmin
    .from("team_invitations")
    .select("id, team_id, email, role, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite || invite.status !== "pending") throw new Error("INVALID_INVITE");
  if (String(invite.email).toLowerCase() !== email)
    throw new Error("WRONG_ACCOUNT");
  if (new Date(invite.expires_at).getTime() < Date.now())
    throw new Error("EXPIRED");

  const { error } = await supabaseAdmin
    .from("team_members")
    .upsert(
      { team_id: invite.team_id, user_id: context.userId, role: invite.role },
      { onConflict: "team_id,user_id" },
    );
  if (error) throw new Error(error.message);

  await supabaseAdmin
    .from("team_invitations")
    .update({ status: "accepted" })
    .eq("id", invite.id);
  return { ok: true };
}
