import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useSavingsSummary, useSubscription, useUserRow } from "@/lib/queries";
import { currency, type Tier } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Loding Tokenary" },
      {
        name: "description",
        content:
          "Review your Tokenary subscription tier, spend limit and current month usage.",
      },
      { property: "og:title", content: "Settings — Loding Tokenary" },
      {
        property: "og:description",
        content: "Subscription tier, spend limits and account details.",
      },
    ],
  }),
  component: SettingsPage,
});

const TIERS: { tier: Tier; price: string; limit: string; perks: string[] }[] = [
  {
    tier: "free",
    price: "$0",
    limit: "$25 / mo spend",
    perks: ["1 routing rule", "7-day call history", "Community support"],
  },
  {
    tier: "starter",
    price: "$29",
    limit: "$250 / mo spend",
    perks: ["Unlimited routing rules", "90-day call history", "Quality scoring"],
  },
  {
    tier: "team",
    price: "$99",
    limit: "$2,500 / mo spend",
    perks: ["Everything in Starter", "Shared workspaces", "Priority support"],
  },
];

function SettingsPage() {
  const { session, user } = useSession();
  const { data: subscription } = useSubscription(!!session);
  const { data: userRow } = useUserRow(!!session);
  const { data: savings } = useSavingsSummary(!!session);

  const tier = subscription?.tier;
  const spend_limit = Number(subscription?.spend_limit ?? 0);
  const current_usage = Number(subscription?.current_usage ?? 0);
  const pct = spend_limit ? Math.min(100, (current_usage / spend_limit) * 100) : 0;

  return (
    <AppShell title="Settings" description="Subscription, limits and account details.">
      <div className="grid max-w-4xl gap-4">
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Usage this month</h2>
              <p className="text-xs text-muted-foreground">Resets on the 1st</p>
            </div>
            <span className="tabular text-sm text-muted-foreground">
              {currency(current_usage)} of {currency(spend_limit, 0)}
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
            <Row label="Spend limit" value={currency(spend_limit, 0)} />
            <Row label="Remaining" value={currency(Math.max(0, spend_limit - current_usage))} />
            <Row label="Saved by routing" value={currency(savings?.saved ?? 0)} accent />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium">Plan</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {TIERS.map((t) => {
              const current = t.tier === tier;
              return (
                <div
                  key={t.tier}
                  className={`panel p-5 ${current ? "border-accent/45" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{t.tier}</span>
                    {current && (
                      <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                        current
                      </span>
                    )}
                  </div>
                  <p className="tabular mt-3 text-2xl font-semibold">
                    {t.price}
                    <span className="text-sm font-normal text-muted-foreground"> / mo</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.limit}</p>
                  <ul className="mt-4 space-y-2">
                    {t.perks.map((p) => (
                      <li key={p} className="flex gap-2 text-xs text-muted-foreground">
                        <Check className="size-3.5 shrink-0 text-accent" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={current ? "outline" : "default"}
                    className="mt-5 w-full"
                    disabled={current}
                  >
                    {current ? "Current plan" : `Switch to ${t.tier}`}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-medium">Account</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Row label="Email" value={userRow?.email ?? user?.email ?? "—"} />
            <Row
              label="Member since"
              value={
                userRow?.created_at
                  ? new Date(userRow.created_at).toLocaleDateString()
                  : "—"
              }
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`tabular mt-0.5 text-sm ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
