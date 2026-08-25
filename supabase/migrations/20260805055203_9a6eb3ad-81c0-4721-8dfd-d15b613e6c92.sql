CREATE TYPE public.team_role AS ENUM ('moderator','employee');

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL DEFAULT 'Mon espace',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX teams_owner_unique ON public.teams(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.team_role NOT NULL DEFAULT 'employee',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.team_role NOT NULL DEFAULT 'employee',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '14 days'
);
CREATE UNIQUE INDEX team_invitations_token_unique ON public.team_invitations(token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invitations TO authenticated;
GRANT ALL ON public.team_invitations TO service_role;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_team_member(_team uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = _team AND user_id = _user)
      OR EXISTS (SELECT 1 FROM public.teams WHERE id = _team AND owner_id = _user)
$$;

CREATE OR REPLACE FUNCTION public.is_team_moderator(_team uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.teams WHERE id = _team AND owner_id = _user)
      OR EXISTS (SELECT 1 FROM public.team_members WHERE team_id = _team AND user_id = _user AND role = 'moderator')
$$;

CREATE OR REPLACE FUNCTION public.shares_team_with_owner(_viewer uuid, _owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.team_members m ON m.team_id = t.id
    WHERE t.owner_id = _owner AND m.user_id = _viewer
  )
$$;

CREATE POLICY "Members can view their team" ON public.teams
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_team_member(id, auth.uid()) OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Users can create their own team" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their team" ON public.teams
  FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can delete their team" ON public.teams
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Members can view team members" ON public.team_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_team_member(team_id, auth.uid()) OR public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Moderators manage team members" ON public.team_members
  FOR ALL TO authenticated
  USING (public.is_team_moderator(team_id, auth.uid()))
  WITH CHECK (public.is_team_moderator(team_id, auth.uid()));

CREATE POLICY "Moderators manage invitations" ON public.team_invitations
  FOR ALL TO authenticated
  USING (public.is_team_moderator(team_id, auth.uid()) OR public.has_role(auth.uid(), 'superadmin'))
  WITH CHECK (public.is_team_moderator(team_id, auth.uid()));

CREATE POLICY "Team members can view team clients" ON public.clients
  FOR SELECT TO authenticated USING (public.shares_team_with_owner(auth.uid(), user_id));
CREATE POLICY "Team members can update team clients" ON public.clients
  FOR UPDATE TO authenticated
  USING (public.shares_team_with_owner(auth.uid(), user_id))
  WITH CHECK (public.shares_team_with_owner(auth.uid(), user_id));
CREATE POLICY "Team members can insert team clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (public.shares_team_with_owner(auth.uid(), user_id));

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();