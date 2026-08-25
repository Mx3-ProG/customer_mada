import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Lock, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { useTeam, useTeamActions } from "@/hooks/useTeam";
import { usePlan } from "@/hooks/usePlan";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandLoader, BrandSpinner } from "@/components/BrandLoader";
import { ClientSearchButton } from "@/components/clients/ClientSearchDialog";
import { MobileNav } from "@/components/layout/MobileNav";
import { invitationLink, type TeamRole } from "@/lib/team";


function TeamSkeleton() {
  return (
    <div className="mt-10 space-y-10" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-40" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="divide-y border-y-2 border-ink-muted">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-4">
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Espace équipe — Mada Customer Software" },
      {
        name: "description",
        content:
          "Invitez vos employés, gérez les rôles de votre espace et partagez votre portefeuille client.",
      },
      { property: "og:title", content: "Espace équipe — Mada Customer Software" },
      {
        property: "og:description",
        content: "Modérateurs et employés collaborent sur le même portefeuille client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { plan } = usePlan();
  const { team, isLoading } = useTeam();
  const actions = useTeamActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("employee");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (team.team?.name) setName(team.team.name);
  }, [team.team?.name]);

  // Auto-accept an invitation arriving through ?invite=<token>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    window.history.replaceState({}, "", window.location.pathname);
    actions.accept.mutate(token, {
      onSuccess: () => toast.success(t("team.joined")),
      onError: () => toast.error(t("team.joinError")),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const locked = !plan.isPro;

  const employees = useMemo(() => team.members.filter((m) => !m.isOwner), [team.members]);

  const copy = async (token: string) => {
    await navigator.clipboard.writeText(invitationLink(origin, token));
    setCopied(token);
    toast.success(t("team.linkCopied"));
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between">
          <h1 className="flex min-w-0 items-center gap-2.5 font-serif text-3xl tracking-tight text-ink">
            <Users className="size-6 shrink-0 text-ink-muted" />
            <span className="truncate">{t("team.title")}</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2">
            <ClientSearchButton />
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                {t("admin.back")}
              </Button>
            </Link>
          </div>
          <div className="flex sm:hidden items-center">
            <MobileNav current="team" />
          </div>
        </header>

        <p className="mt-3 max-w-2xl text-sm text-ink-muted">{t("team.subtitle")}</p>

        {team.pendingForMe.length > 0 && (
          <section className="mt-8 border-y-2 border-ink-muted px-4 py-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              {t("team.pendingForMe")}
            </h2>
            <ul className="mt-3 space-y-2">
              {team.pendingForMe.map((p) => (
                <li key={p.token} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink">
                    {p.teamName} — {t(`team.role.${p.role}`)}
                  </span>
                  <Button
                    size="sm"
                    disabled={actions.accept.isPending}
                    onClick={() =>
                      actions.accept.mutate(p.token, {
                        onSuccess: () => toast.success(t("team.joined")),
                        onError: () => toast.error(t("team.joinError")),
                      })
                    }
                  >
                    {actions.accept.isPending && <BrandSpinner className="mr-2" />}
                    {t("team.accept")}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {locked ? (
          <section className="mt-10 border-y-2 border-ink-muted px-6 py-16 text-center">
            <Lock className="mx-auto size-6 text-ink-faint" />
            <h2 className="mt-4 font-serif text-2xl text-ink">{t("team.lockedTitle")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">{t("team.lockedBody")}</p>
            <Button className="mt-6" onClick={() => navigate({ to: "/pricing" })}>
              {t("plan.upgrade")}
            </Button>
          </section>
        ) : isLoading ? (
          <div className="mt-10">
            <BrandLoader label={t("dash.loading")} />
            <TeamSkeleton />
          </div>
        ) : !team.team ? (
          <section className="mt-10 border-y-2 border-ink-muted px-6 py-16 text-center">
            <h2 className="font-serif text-2xl text-ink">{t("team.createTitle")}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">{t("team.createBody")}</p>
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("team.namePlaceholder")}
              />
              <Button
                onClick={() =>
                  actions.createTeam.mutate(name, {
                    onSuccess: () => toast.success(t("team.created")),
                    onError: () => toast.error(t("team.error")),
                  })
                }
                disabled={actions.createTeam.isPending}
              >
                {actions.createTeam.isPending && <BrandSpinner className="mr-2" />}
                {t("team.create")}
              </Button>
            </div>
          </section>
        ) : (
          <>
            {team.isOwner && (
              <section className="mt-8">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  {t("team.spaceName")}
                </h2>
                <div className="mt-3 flex max-w-md items-center gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <Button
                    variant="ghost"
                    disabled={actions.renameTeam.isPending}
                    onClick={() =>
                      actions.renameTeam.mutate(name, {
                        onSuccess: () => toast.success(t("team.saved")),
                      })
                    }
                  >
                    {actions.renameTeam.isPending && <BrandSpinner className="mr-2" />}
                    {t("team.save")}
                  </Button>
                </div>
              </section>
            )}

            {team.canManage && (
              <section className="mt-10">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  {t("team.inviteTitle")}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("team.emailPlaceholder")}
                    className="max-w-xs"
                  />
                  <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">{t("team.role.employee")}</SelectItem>
                      <SelectItem value="moderator">{t("team.role.moderator")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={actions.invite.isPending || !email}
                    onClick={() =>
                      actions.invite.mutate(
                        { email, role },
                        {
                          onSuccess: ({ token }) => {
                            setEmail("");
                            void copy(token);
                          },
                          onError: () => toast.error(t("team.inviteError")),
                        },
                      )
                    }
                  >
                    {actions.invite.isPending ? (
                      <BrandSpinner className="mr-1" />
                    ) : (
                      <UserPlus className="size-4" />
                    )}{" "}
                    {t("team.invite")}
                  </Button>
                </div>
                {actions.invite.isPending && (
                  <div className="mt-3 flex items-center gap-3 border-y-2 border-ink-muted py-3">
                    <BrandSpinner size={20} />
                    <Skeleton className="h-4 w-48" />
                  </div>
                )}
                <p className="mt-2 font-mono text-[11px] text-ink-faint">{t("team.inviteHint")}</p>
              </section>
            )}

            <section className="mt-10">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                {t("team.members")}
              </h2>
              <ul className="mt-3 divide-y border-y-2 border-ink-muted">
                {team.members.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="flex-1 text-sm text-ink">{m.email}</span>
                    {m.isOwner ? (
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                        {t("team.owner")}
                      </span>
                    ) : team.canManage ? (
                      <>
                        <Select
                          value={m.role}
                          onValueChange={(v) =>
                            actions.setRole.mutate({ id: m.id, role: v as TeamRole })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">{t("team.role.employee")}</SelectItem>
                            <SelectItem value="moderator">{t("team.role.moderator")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t("team.remove")}
                          disabled={
                            actions.remove.isPending && actions.remove.variables === m.id
                          }
                          onClick={() => actions.remove.mutate(m.id)}
                        >
                          {actions.remove.isPending && actions.remove.variables === m.id ? (
                            <BrandSpinner />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                        {t(`team.role.${m.role}`)}
                      </span>
                    )}
                  </li>
                ))}
                {employees.length === 0 && (
                  <li className="py-4 text-sm text-ink-faint">{t("team.noMembers")}</li>
                )}
              </ul>
            </section>

            {team.canManage && team.invitations.length > 0 && (
              <section className="mt-10">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  {t("team.pending")}
                </h2>
                <ul className="mt-3 divide-y border-y-2 border-ink-muted">
                  {team.invitations.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                      <Mail className="size-4 text-ink-faint" />
                      <span className="flex-1 text-sm text-ink">{i.email}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                        {t(`team.role.${i.role}`)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => copy(i.token)}>
                        {copied === i.token ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}{" "}
                        {t("team.copyLink")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actions.revoke.isPending && actions.revoke.variables === i.id}
                        onClick={() => actions.revoke.mutate(i.id)}
                      >
                        {actions.revoke.isPending && actions.revoke.variables === i.id ? (
                          <BrandSpinner />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!team.isOwner && (
              <Button
                variant="ghost"
                className="mt-10"
                disabled={actions.leave.isPending}
                onClick={() =>
                  actions.leave.mutate(undefined, {
                    onSuccess: () => toast.success(t("team.left")),
                  })
                }
              >
                {actions.leave.isPending && <BrandSpinner className="mr-2" />}
                {t("team.leave")}
              </Button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
