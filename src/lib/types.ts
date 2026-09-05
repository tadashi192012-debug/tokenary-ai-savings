/** Shapes mirroring the Supabase tables/views backing these screens. */

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

export const MODELS = [
  "gpt-4o-mini",
  "claude-haiku-4",
  "gpt-4o",
  "claude-sonnet-4",
] as const;

export const currency = (n: number, digits = 2) =>
  `$${(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const compactNumber = (n: number) =>
  (n ?? 0).toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Provider credential surfaces. Plaintext keys never reach the client. */

export type Provider = "openai" | "anthropic" | "openrouter" | "google" | "other";

export const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "google", label: "Google" },
  { value: "other", label: "Other" },
];

/** public.provider_keys_display — contains no key material. */
export interface ProviderKeyDisplay {
  id: string;
  provider: Provider;
  nickname: string;
  last_four: string;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
}
