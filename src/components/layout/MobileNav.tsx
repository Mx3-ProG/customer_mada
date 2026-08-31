import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Search, Shield, Sparkles, Users } from "lucide-react";
import { ClientSearchDialog } from "@/components/clients/ClientSearchDialog";
import { supabase } from "@/integrations/supabase/client";
import { useIsSuperadmin } from "@/hooks/useSuperadmin";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { LucideIcon } from "lucide-react";

export type MobileNavItem = {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: "default" | "accent" | "danger";
};

export type MobileNavDivider = { divider: true };

export type MobileNavEntry = MobileNavItem | MobileNavDivider;

export type MobileNavCurrent =
  "dashboard" | "admin" | "team" | "pricing" | "checkout";

export type MobileNavProps = {
  current: MobileNavCurrent;
  extraItems?: MobileNavItem[];
  showSignOut?: boolean;
  className?: string;
};

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-4 w-5 flex-col justify-between">
      <span
        className={cn(
          "h-0.5 w-full origin-center rounded-full bg-current transition-all duration-300 ease-out",
          open && "translate-y-[7px] rotate-45",
        )}
      />
      <span
        className={cn(
          "h-0.5 w-full origin-center rounded-full bg-current transition-all duration-300 ease-out",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "h-0.5 w-full origin-center rounded-full bg-current transition-all duration-300 ease-out",
          open && "-translate-y-[7px] -rotate-45",
        )}
      />
    </span>
  );
}

export function MobileNav({
  current,
  extraItems,
  showSignOut,
  className,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useI18n();
  const { data: isSuperadmin } = useIsSuperadmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const handleClick = (item: MobileNavItem) => {
    setOpen(false);
    item.onClick?.();
  };

  const items = useMemo<MobileNavEntry[]>(() => {
    const base: MobileNavEntry[] = [
      {
        label: t("nav.dashboard"),
        icon: LayoutDashboard,
        to: "/dashboard",
        active: current === "dashboard",
      },
      {
        label: t("search.clients"),
        icon: Search,
        onClick: () => setSearchOpen(true),
      },
      {
        label: t("team.nav"),
        icon: Users,
        to: "/team",
        active: current === "team",
      },
      {
        label: t("plan.nav"),
        icon: Sparkles,
        to: "/pricing",
        active: current === "pricing" || current === "checkout",
      },
    ];
    if (isSuperadmin) {
      base.splice(1, 0, {
        label: t("admin.nav"),
        icon: Shield,
        to: "/admin",
        active: current === "admin",
      });
    }
    if (extraItems?.length) {
      base.push({ divider: true });
      base.push(...extraItems);
    }
    return base;
  }, [current, extraItems, isSuperadmin, t]);

  return (
    <>
      <ClientSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.menu")}
            className={cn(
              "relative h-10 w-10 rounded-full border border-rule bg-background text-ink transition-colors hover:border-accent hover:text-accent",
              className,
            )}
          >
            <BurgerIcon open={open} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full border-l border-rule bg-background p-0 sm:max-w-sm"
        >
          <div className="flex h-full flex-col">
            <div
              className="flex items-center justify-between border-b border-rule px-5 py-4"
              style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo-mada.png"
                  alt=""
                  className="h-6 w-auto shrink-0"
                />
                <span className="font-serif text-lg text-ink">Mada</span>
              </div>
              <SheetTitle className="sr-only">{t("nav.menu")}</SheetTitle>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {items.map((item, idx) => {
                  if ("divider" in item) {
                    return (
                      <li
                        key={`divider-${idx}`}
                        className="my-3 border-t border-rule"
                      />
                    );
                  }
                  if (item.to) {
                    return (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                            item.active
                              ? "bg-accent/10 text-accent"
                              : "text-ink hover:bg-rule/50 hover:text-ink",
                          )}
                        >
                          <item.icon className="size-5" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => handleClick(item)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                          item.variant === "accent"
                            ? "bg-accent text-background hover:bg-accent/90"
                            : item.variant === "danger"
                              ? "text-alarm hover:bg-alarm/10"
                              : "text-ink hover:bg-rule/50",
                        )}
                      >
                        <item.icon className="size-5" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div
              className="border-t border-rule p-4"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
                {showSignOut && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-alarm hover:bg-alarm/10 hover:text-alarm"
                  >
                    {t("dash.signOut")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
