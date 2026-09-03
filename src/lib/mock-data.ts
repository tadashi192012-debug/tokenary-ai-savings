/**
 * Stubbed data shaped exactly like the Supabase tables/views that will back
 * these screens once the project is connected via Connectors.
 * Swap each export for a live query; the component-level shapes stay identical.
 */

export type Tier = "free" | "starter" | "team";

export interface UserRow {
  id: string;
  email: string;
  api_key: string;
  created_at: string;
}

export interface SubscriptionRow {
  user_id: string;
  tier: Tier;
  spend_limit: number;
  current_usage: number;
}

export interface RoutingRuleRow {
  id: string;
  user_id: string;
  task_type: string;
  cheap_model: string;
  fallback_model: string;
  quality_threshold: number;
}

export interface ApiCallRow {
  id: string;
  user_id: string;
  model_used: string;
  original_model_requested: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  latency_ms: number;
  was_routed: boolean;
  created_at: string;
}

export interface QualityCheckRow {
  id: string;
  api_call_id: string;
  score: number;
  passed: boolean;
  retried: boolean;
}

/** public.v_daily_spend_by_model */
export interface DailySpendByModel {
  day: string;
  model_used: string;
  spend: number;
}

/** public.v_savings_summary */
export interface SavingsSummary {
  user_id: string;
  month_spend: number;
  baseline_spend: number;
  saved: number;
  savings_pct: number;
  total_calls: number;
  routed_calls: number;
}

const USER_ID = "00000000-0000-4000-8000-000000000001";

export const mockUser: UserRow = {
  id: USER_ID,
  email: "tadashi@hamada.dev",
  api_key: "tk_live_9f2c41ba7de84c0fa1b6e35d27c8a04e",
  created_at: "2026-05-14T09:12:00.000Z",
};

export const mockSubscription: SubscriptionRow = {
  user_id: USER_ID,
  tier: "starter",
  spend_limit: 250,
  current_usage: 138.42,
};

export const mockSavings: SavingsSummary = {
  user_id: USER_ID,
  month_spend: 138.42,
  baseline_spend: 511.87,
  saved: 373.45,
  savings_pct: 72.96,
  total_calls: 18432,
  routed_calls: 14108,
};

export const MODELS = [
  "gpt-4o-mini",
  "claude-haiku-4",
  "gpt-4o",
  "claude-sonnet-4",
] as const;

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const mockDailySpend: DailySpendByModel[] = (() => {
  const rows: DailySpendByModel[] = [];
  const end = new Date("2026-09-03T00:00:00.000Z");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000);
    const day = d.toISOString().slice(0, 10);
    MODELS.forEach((model, mi) => {
      const base = [1.9, 1.35, 0.85, 0.6][mi];
      const spend = +(base * (0.55 + seeded(i * 7 + mi * 31) * 1.1)).toFixed(3);
      rows.push({ day, model_used: model, spend });
    });
  }
  return rows;
})();

export const mockApiCalls: ApiCallRow[] = Array.from({ length: 24 }, (_, i) => {
  const r = seeded(i * 3 + 5);
  const routed = r > 0.32;
  const requested = r > 0.6 ? "gpt-4o" : "claude-sonnet-4";
  const used = routed ? (r > 0.6 ? "gpt-4o-mini" : "claude-haiku-4") : requested;
  const tokensIn = 380 + Math.round(r * 2600);
  const tokensOut = 90 + Math.round(seeded(i * 11) * 900);
  const rate = routed ? 0.00000042 : 0.0000061;
  return {
    id: `call_${(1000 + i).toString(16)}`,
    user_id: USER_ID,
    model_used: used,
    original_model_requested: requested,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost: +((tokensIn + tokensOut * 3) * rate).toFixed(5),
    latency_ms: 240 + Math.round(seeded(i * 17) * 1800),
    was_routed: routed,
    created_at: new Date(Date.parse("2026-09-03T14:40:00.000Z") - i * 417000).toISOString(),
  };
});

export const mockQualityChecks: QualityCheckRow[] = mockApiCalls.map((c, i) => {
  const score = +(0.72 + seeded(i * 23) * 0.27).toFixed(2);
  return {
    id: `qc_${i}`,
    api_call_id: c.id,
    score,
    passed: score >= 0.8,
    retried: score < 0.8 && c.was_routed,
  };
});

export const mockRoutingRules: RoutingRuleRow[] = [
  {
    id: "rule_1",
    user_id: USER_ID,
    task_type: "summarization",
    cheap_model: "gpt-4o-mini",
    fallback_model: "gpt-4o",
    quality_threshold: 0.82,
  },
  {
    id: "rule_2",
    user_id: USER_ID,
    task_type: "classification",
    cheap_model: "claude-haiku-4",
    fallback_model: "claude-sonnet-4",
    quality_threshold: 0.9,
  },
  {
    id: "rule_3",
    user_id: USER_ID,
    task_type: "code-review",
    cheap_model: "gpt-4o-mini",
    fallback_model: "claude-sonnet-4",
    quality_threshold: 0.95,
  },
];

export const currency = (n: number, digits = 2) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const compactNumber = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });
