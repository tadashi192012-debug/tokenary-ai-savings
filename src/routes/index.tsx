import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  MODELS,
  compactNumber,
  currency,
  mockApiCalls,
  mockDailySpend,
  mockSavings,
  type ApiCallRow,
} from "@/lib/mock-data";

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
];

function useChartData() {
  return useMemo(() => {
    const byDay = new Map<string, Record<string, number | string>>();
    for (const row of mockDailySpend) {
      const entry = byDay.get(row.day) ?? { day: row.day };
      entry[row.model_used] = row.spend;
      byDay.set(row.day, entry);
    }
    return Array.from(byDay.values());
  }, []);
}

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
  const data = useChartData();
  const [calls, setCalls] = useState<ApiCallRow[]>(mockApiCalls);
  const [liveId, setLiveId] = useState<string | null>(null);

  // STUB: stands in for supabase.channel('api_calls').on('postgres_changes', ...)
  useEffect(() => {
    const t = setInterval(() => {
      const seed = mockApiCalls[Math.floor(Math.random() * mockApiCalls.length)];
      const next: ApiCallRow = {
        ...seed,
        id: `call_live_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setLiveId(next.id);
      setCalls((prev) => [next, ...prev].slice(0, 24));
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const pct = mockSavings.savings_pct;

  return (
    <AppShell
      title="Dashboard"
      description="September 2026 · all providers"
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
              {currency(mockSavings.saved)}
            </span>
            <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
              <ArrowDownRight className="size-3.5" />
              {pct.toFixed(1)}% below baseline
            </span>
          </div>
          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
            <Stat label="Actual spend" value={currency(mockSavings.month_spend)} />
            <Stat
              label="Baseline (no routing)"
              value={currency(mockSavings.baseline_spend)}
              muted
            />
            <Stat
              label="Routed calls"
              value={`${compactNumber(mockSavings.routed_calls)} / ${compactNumber(
                mockSavings.total_calls,
              )}`}
            />
          </div>
        </section>

        <div className="grid gap-4">
          <MiniCard
            icon={Activity}
            label="Calls today"
            value={compactNumber(1284)}
            hint="+8.2% vs yesterday"
          />
          <MiniCard
            icon={Zap}
            label="Avg latency"
            value="612 ms"
            hint="p95 1.4 s across providers"
          />
        </div>
      </div>

      <section className="panel mt-4 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Daily spend by model</h2>
            <p className="text-xs text-muted-foreground">Last 30 days · v_daily_spend_by_model</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {MODELS.map((m, i) => (
              <span key={m} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: SERIES_COLORS[i] }}
                />
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
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
              {MODELS.map((m, i) => (
                <Line
                  key={m}
                  type="monotone"
                  dataKey={m}
                  stroke={SERIES_COLORS[i]}
                  strokeWidth={i === 0 ? 2 : 1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
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
              {calls.map((c) => (
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
                    {c.tokens_in.toLocaleString()} / {c.tokens_out.toLocaleString()}
                  </Td>
                  <Td className="text-right tabular text-muted-foreground">{c.latency_ms} ms</Td>
                  <Td className="text-right tabular">{currency(c.cost, 4)}</Td>
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
              ))}
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
