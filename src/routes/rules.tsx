import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/hooks/use-session";
import { useDeleteRoutingRule, useRoutingRules, useUpsertRoutingRule } from "@/lib/queries";
import { MODELS, type RoutingRuleRow } from "@/lib/types";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Routing rules — Loding Tokenary" },
      {
        name: "description",
        content:
          "Define per-task routing rules: cheap model, fallback model and the quality threshold that triggers escalation.",
      },
      { property: "og:title", content: "Routing rules — Loding Tokenary" },
      {
        property: "og:description",
        content: "Control which model handles each task type and when to escalate.",
      },
    ],
  }),
  component: RulesPage,
});

type Draft = {
  id?: string;
  task_type: string;
  cheap_model: string;
  fallback_model: string;
  quality_threshold: number;
};

const EMPTY: Draft = {
  task_type: "",
  cheap_model: MODELS[0],
  fallback_model: MODELS[2],
  quality_threshold: 0.85,
};

function RulesPage() {
  const { session } = useSession();
  const { data: rules, isLoading } = useRoutingRules(!!session);
  const upsert = useUpsertRoutingRule();
  const remove = useDeleteRoutingRule();
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    try {
      await upsert.mutateAsync(draft);
      toast.success(draft.id ? "Rule updated" : "Rule created");
      setDraft(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save rule");
    }
  };

  const del = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Rule deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete rule");
    }
  };

  const list = rules ?? [];

  return (
    <AppShell
      title="Routing rules"
      description="Route each task type to the cheapest model that clears your quality bar."
      actions={
        <Button onClick={() => setDraft({ ...EMPTY })}>
          <Plus className="size-4" />
          New rule
        </Button>
      }
    >
      {isLoading ? (
        <div className="panel grid place-items-center px-6 py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <p className="text-sm font-medium">No routing rules yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Every request falls through to the model your app asked for. Add a rule to start
            saving.
          </p>
          <Button className="mt-5" onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="size-4" />
            Create your first rule
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((rule: RoutingRuleRow) => (
            <div
              key={rule.id}
              className="panel flex flex-wrap items-center gap-x-8 gap-y-4 px-5 py-4"
            >
              <div className="min-w-40">
                <p className="text-xs text-muted-foreground">Task type</p>
                <p className="mt-0.5 font-medium">{rule.task_type}</p>
              </div>
              <Field label="Cheap model" value={rule.cheap_model} accent />
              <Field label="Fallback" value={rule.fallback_model} />
              <div>
                <p className="text-xs text-muted-foreground">Quality threshold</p>
                <p className="tabular mt-0.5 text-sm">
                  {Number(rule.quality_threshold).toFixed(2)}
                </p>
              </div>
              <div className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setDraft({
                      id: rule.id,
                      task_type: rule.task_type,
                      cheap_model: rule.cheap_model,
                      fallback_model: rule.fallback_model,
                      quality_threshold: Number(rule.quality_threshold),
                    })
                  }
                >
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit {rule.task_type}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => del(rule.id)}>
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete {rule.task_type}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit rule" : "New routing rule"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="task">Task type</Label>
                <Input
                  id="task"
                  required
                  placeholder="summarization"
                  value={draft.task_type}
                  onChange={(e) => setDraft({ ...draft, task_type: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ModelSelect
                  id="cheap"
                  label="Cheap model"
                  value={draft.cheap_model}
                  onChange={(v) => setDraft({ ...draft, cheap_model: v })}
                />
                <ModelSelect
                  id="fallback"
                  label="Fallback model"
                  value={draft.fallback_model}
                  onChange={(v) => setDraft({ ...draft, fallback_model: v })}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label htmlFor="threshold">Quality threshold</Label>
                  <span className="tabular text-sm text-accent">
                    {draft.quality_threshold.toFixed(2)}
                  </span>
                </div>
                <Input
                  id="threshold"
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  className="accent-accent"
                  value={draft.quality_threshold}
                  onChange={(e) =>
                    setDraft({ ...draft, quality_threshold: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Responses scoring below this retry on the fallback model.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={upsert.isPending}>
                  {upsert.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : draft.id ? (
                    "Save changes"
                  ) : (
                    "Create rule"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-mono text-sm ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}

function ModelSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = MODELS.includes(value as (typeof MODELS)[number])
    ? [...MODELS]
    : [value, ...MODELS];
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((m) => (
          <option key={m} value={m} className="bg-popover">
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
