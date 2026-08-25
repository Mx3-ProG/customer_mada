import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  acceptInvitation,
  createMyTeam,
  getMyTeam,
  inviteTeamMember,
  leaveTeam,
  removeTeamMember,
  renameMyTeam,
  revokeInvitation,
  setTeamMemberRole,
} from "@/lib/team.functions";
import { EMPTY_TEAM_STATE, type TeamRole, type TeamState } from "@/lib/team";

const KEY = ["my-team"] as const;

export function useTeam() {
  const fetchTeam = useServerFn(getMyTeam);
  const query = useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<TeamState> => (await fetchTeam()) as unknown as TeamState,
  });
  return { ...query, team: query.data ?? EMPTY_TEAM_STATE };
}

export function useTeamActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useServerFn(createMyTeam);
  const rename = useServerFn(renameMyTeam);
  const invite = useServerFn(inviteTeamMember);
  const revoke = useServerFn(revokeInvitation);
  const remove = useServerFn(removeTeamMember);
  const setRole = useServerFn(setTeamMemberRole);
  const accept = useServerFn(acceptInvitation);
  const leave = useServerFn(leaveTeam);

  return {
    createTeam: useMutation({
      mutationFn: (name: string) => create({ data: { name } }),
      onSuccess: invalidate,
    }),
    renameTeam: useMutation({
      mutationFn: (name: string) => rename({ data: { name } }),
      onSuccess: invalidate,
    }),
    invite: useMutation({
      mutationFn: (input: { email: string; role: TeamRole }) => invite({ data: input }),
      onSuccess: invalidate,
    }),
    revoke: useMutation({
      mutationFn: (id: string) => revoke({ data: { id } }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => remove({ data: { id } }),
      onSuccess: invalidate,
    }),
    setRole: useMutation({
      mutationFn: (input: { id: string; role: TeamRole }) => setRole({ data: input }),
      onSuccess: invalidate,
    }),
    accept: useMutation({
      mutationFn: (token: string) => accept({ data: { token } }),
      onSuccess: () => {
        invalidate();
        qc.invalidateQueries({ queryKey: ["clients"] });
      },
    }),
    leave: useMutation({ mutationFn: () => leave(), onSuccess: invalidate }),
  };
}
