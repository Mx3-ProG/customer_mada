export type TeamRole = "moderator" | "employee";

export type TeamMemberRow = {
  id: string;
  user_id: string;
  email: string;
  role: TeamRole;
  isOwner: boolean;
  created_at: string;
};

export type TeamInvitationRow = {
  id: string;
  email: string;
  role: TeamRole;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
};

export type TeamState = {
  team: { id: string; name: string; owner_id: string } | null;
  myRole: TeamRole | null;
  isOwner: boolean;
  canManage: boolean;
  members: TeamMemberRow[];
  invitations: TeamInvitationRow[];
  pendingForMe: { token: string; teamName: string; role: TeamRole }[];
};

export const EMPTY_TEAM_STATE: TeamState = {
  team: null,
  myRole: null,
  isOwner: false,
  canManage: false,
  members: [],
  invitations: [],
  pendingForMe: [],
};

export function invitationLink(origin: string, token: string) {
  return `${origin}/team?invite=${token}`;
}
