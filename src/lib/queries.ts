import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabaseClient";
import type {
  ApiCallRow,
  DailySpendByModel,
  RoutingRuleRow,
  SavingsSummary,
  SubscriptionRow,
  UserRow,
} from "@/lib/types";

/** RLS scopes every one of these reads to auth.uid(). */

export function useUserRow(enabled = true) {
  return useQuery({
    queryKey: ["users", "me"],
    enabled,
    queryFn: async (): Promise<UserRow | null> => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, api_key, created_at")
        .maybeSingle();
      if (error) throw error;
      return data as UserRow | null;
    },
  });
}

export function useSubscription(enabled = true) {
  return useQuery({
    queryKey: ["subscriptions", "me"],
    enabled,
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id, tier, spend_limit, current_usage")
        .maybeSingle();
      if (error) throw error;
      return data as SubscriptionRow | null;
    },
  });
}

export function useSavingsSummary(enabled = true) {
  return useQuery({
    queryKey: ["v_savings_summary"],
    enabled,
    queryFn: async (): Promise<SavingsSummary | null> => {
      const { data, error } = await supabase
        .from("v_savings_summary")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data as SavingsSummary | null;
    },
  });
}

export function useDailySpend(enabled = true) {
  return useQuery({
    queryKey: ["v_daily_spend_by_model"],
    enabled,
    queryFn: async (): Promise<DailySpendByModel[]> => {
      const { data, error } = await supabase
        .from("v_daily_spend_by_model")
        .select("day, model_used, spend")
        .order("day", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DailySpendByModel[];
    },
  });
}

export function useRecentCalls(limit = 24, enabled = true) {
  return useQuery({
    queryKey: ["api_calls", limit],
    enabled,
    queryFn: async (): Promise<ApiCallRow[]> => {
      const { data, error } = await supabase
        .from("api_calls")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ApiCallRow[];
    },
  });
}

export function useRoutingRules(enabled = true) {
  return useQuery({
    queryKey: ["routing_rules"],
    enabled,
    queryFn: async (): Promise<RoutingRuleRow[]> => {
      const { data, error } = await supabase
        .from("routing_rules")
        .select("*")
        .order("task_type", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RoutingRuleRow[];
    },
  });
}

export function useUpsertRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Omit<RoutingRuleRow, "id" | "user_id"> & { id?: string }) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Not signed in");

      const payload = {
        ...(rule.id ? { id: rule.id } : {}),
        user_id: userId,
        task_type: rule.task_type,
        cheap_model: rule.cheap_model,
        fallback_model: rule.fallback_model,
        quality_threshold: rule.quality_threshold,
      };

      const { error } = await supabase.from("routing_rules").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routing_rules"] }),
  });
}

export function useDeleteRoutingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("routing_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routing_rules"] }),
  });
}

export function useRegenerateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Not signed in");

      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const key = `tk_live_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;

      const { error } = await supabase
        .from("users")
        .update({ api_key: key })
        .eq("id", userId);
      if (error) throw error;
      return key;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", "me"] }),
  });
}
