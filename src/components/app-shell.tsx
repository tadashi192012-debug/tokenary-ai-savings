import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  GitBranch,
  KeyRound,
  Settings as SettingsIcon,
  LogOut,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useSession } from "@/hooks/use-session";
import { useSubscription } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/rules", label: "Routing rules", icon: GitBranch },
  { to: "/api-key", label: "API key", icon: KeyRound },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-7 place-items-center rounded-md border border-border-strong bg-secondary">
        <span className="size-2 rounded-[2px] bg-accent" />
      </div>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Loding<span className="text-muted-foreground"> Tokenary</span>
        </span>
      )}
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { session, user, loading } = useSession();
  const { data: subscription } = useSubscription(!!session);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const usage = subscription?.current_usage ?? 0;
  const limit = subscription?.spend_limit ?? 0;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 md:flex">
        <div className="px-2 pb-5">
          <Logo />
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground",
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 px-1">
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Plan</span>
              <Badge variant="outline" className="capitalize">
                {subscription?.tier ?? "—"}
              </Badge>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${limit ? Math.min(100, (usage / limit) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground tabular">
              ${usage.toFixed(2)} of ${limit.toFixed(0)} limit
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md px-1.5 py-1.5">
            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-medium">
              {(user?.email ?? "??").slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-md md:px-8">
          <div className="mb-3 md:hidden">
            <Logo />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions}
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-muted-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
