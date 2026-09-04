import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, Activity, Zap, Radio } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { useDailySpend, useRecentCalls, useSavingsSummary } from "@/lib/queries";
import { supabase } from "@/lib/supabaseClient";
import { compactNumber, currency, type ApiCallRow } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Loding Tokenary" },
      {
        name: "description",
        content:
          "See monthly AI spend versus baseline, daily spend by model, and a live feed of routed API calls.",
      },
      { property: "og:title", content: "Dashboard — Loding Tokenary" },
      {
        property: "og:description",
        content: "Track AI spend, model routing and realized savings in one dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-xs shadow-lg">
      <p className="mb-2 font-medium">
        {new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.dataKey}</span>
            <span className="ml-auto tabular">{currency(p.value, 2)}</span>
          </div>
        ))}
        <div className="mt-1.5 flex justify-between border-t border-border pt-1.5">
          <span className="text-muted-foreground">Total</span>
          <span className="tabular font-medium">{currency(total)}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { session, user } = useSession();
  const enabled = !!session;
  const queryClient = useQueryClient();

  const { data: savings } = useSavingsSummary(enabled);
  const { data: spendRows } = useDailySpend(enabled);
  const { data: recentCalls } = useRecentCalls(24, enabled);

  const [liveCalls, setLiveCalls] = useState<ApiCallRow[]>([]);
  const [liveId, setLiveId] = useState<string | null>(null);

  useEffect(() => {
    setLiveCalls(recentCalls ?? []);
  }, [recentCalls]);

  // Realtime: new api_calls rows stream straight into the table.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("api_calls_feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "api_calls",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as ApiCallRow;
          setLiveId(row.id);
          setLiveCalls((prev) => [row, ...prev.filter((c) => c.id !== row.id)].slice(0, 24));
          queryClient.invalidateQueries({ queryKey: ["v_savings_summary"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const { chartData, models } = useMemo(() => {
    const byDay = new Map<string, Record<string, number | string>>();
    const seen = new Set<string>();
    for (const row of spendRows ?? []) {
      seen.add(row.model_used);
      const entry = byDay.get(row.day) ?? { day: row.day };
      entry[row.model_used] = Number(row.spend);
      byDay.set(row.day, entry);
    }
    return { chartData: Array.from(byDay.values()), models: Array.from(seen) };
  }, [spendRows]);

  const callsToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return liveCalls.filter((c) => c.created_at?.slice(0, 10) === today).length;
  }, [liveCalls]);

  const avgLatency = useMemo(() => {
    if (!liveCalls.length) return 0;
    return Math.round(liveCalls.reduce((s, c) => s + (c.latency_ms ?? 0), 0) / liveCalls.length);
  }, [liveCalls]);

  return (
    <AppShell
      title="Dashboard"
      description="Current month · all providers"
      actions={
        <Badge variant="outline" className="gap-1.5 font-normal">
          <Radio className="size-3 text-accent" />
          Live
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel relative overflow-hidden p-6 lg:col-span-2">
          <div
            className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full opacity-[0.13] blur-3xl"
            style={{ background: "var(--accent)" }}
          />
          <p className="text-sm text-muted-foreground">Saved this month by routing</p>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <span className="tabular text-6xl font-semibold tracking-tight text-accent">
              {currency(savings?.saved ?? 0)}
            </span>
            <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
              <ArrowDownRight className="size-3.5" />
              {(savings?.savings_pct ?? 0).toFixed(1)}% below baseline
            </span>
          </div>
          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <Stat label="Actual spend" value={currency(savings?.month_spend ?? 0)} />
            <Stat
              label="Baseline (no routing)"
              value={currency(savings?.baseline_spend ?? 0)}
              muted
            />
            <Stat
              label="Routed calls"
              value={`${compactNumber(savings?.routed_calls ?? 0)} / ${compactNumber(
                savings?.total_calls ?? 0,
              )}`}
            />
          </div>
        </section>

        <div className="grid gap-4">
          <MiniCard
            icon={Activity}
            label="Calls today"
            value={compactNumber(callsToday)}
            hint="From the latest 24 logged calls"
          />
          <MiniCard
            icon={Zap}
            label="Avg latency"
            value={`${avgLatency} ms`}
            hint="Across recent calls"
          />
        </div>
      </div>

      <section className="panel mt-4 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Daily spend by model</h2>
            <p className="text-xs text-muted-foreground">v_daily_spend_by_model</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {models.map((m, i) => (
              <span key={m} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                />
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              No spend recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  minTickGap={28}
                  tickFormatter={(v) =>
                    new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
                {models.map((m, i) => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                    strokeWidth={i === 0 ? 2 : 1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-medium">Recent API calls</h2>
            <p className="text-xs text-muted-foreground">Streaming live from api_calls</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <Th>Time</Th>
                <Th>Model used</Th>
                <Th>Requested</Th>
                <Th className="text-right">Tokens in / out</Th>
                <Th className="text-right">Latency</Th>
                <Th className="text-right">Cost</Th>
                <Th className="text-right">Routed</Th>
              </tr>
            </thead>
            <tbody>
              {liveCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No calls logged yet.
                  </td>
                </tr>
              ) : (
                liveCalls.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40 ${
                      c.id === liveId ? "animate-in fade-in bg-accent-soft" : ""
                    }`}
                  >
                    <Td className="whitespace-nowrap text-muted-foreground tabular">
                      {new Date(c.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </Td>
                    <Td className="font-mono text-xs">{c.model_used}</Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {c.original_model_requested}
                    </Td>
                    <Td className="text-right tabular text-muted-foreground">
                      {(c.tokens_in ?? 0).toLocaleString()} / {(c.tokens_out ?? 0).toLocaleString()}
                    </Td>
                    <Td className="text-right tabular text-muted-foreground">
                      {c.latency_ms} ms
                    </Td>
                    <Td className="text-right tabular">{currency(Number(c.cost ?? 0), 4)}</Td>
                    <Td className="text-right">
                      {c.was_routed ? (
                        <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent">
                          routed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">direct</span>
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-5 py-2.5 font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-2.5 ${className}`}>{children}</td>;
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`tabular mt-1 text-xl font-medium ${
          muted ? "text-muted-foreground line-through decoration-border-strong" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel flex-1 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="tabular mt-2 text-2xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
