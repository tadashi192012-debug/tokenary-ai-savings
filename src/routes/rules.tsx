import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { MODELS, mockRoutingRules, type RoutingRuleRow } from "@/lib/mock-data";

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

const EMPTY: RoutingRuleRow = {
  id: "",
  user_id: "",
  task_type: "",
  cheap_model: MODELS[0],
  fallback_model: MODELS[2],
  quality_threshold: 0.85,
};

function RulesPage() {
  const [rules, setRules] = useState<RoutingRuleRow[]>(mockRoutingRules);
  const [draft, setDraft] = useState<RoutingRuleRow | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    // STUB: replace with supabase.from('routing_rules').upsert(...)
    setRules((prev) =>
      draft.id
        ? prev.map((r) => (r.id === draft.id ? draft : r))
        : [...prev, { ...draft, id: `rule_${Date.now()}` }],
    );
    toast.success(draft.id ? "Rule updated" : "Rule created");
    setDraft(null);
  };

  const remove = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rule deleted");
  };

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
      {rules.length === 0 ? (
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
          {rules.map((rule) => (
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
                <p className="tabular mt-0.5 text-sm">{rule.quality_threshold.toFixed(2)}</p>
              </div>
              <div className="ml-auto flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setDraft(rule)}>
                  <Pencil className="size-4" />
                  <span className="sr-only">Edit {rule.task_type}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(rule.id)}>
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
                <Button type="submit">{draft.id ? "Save changes" : "Create rule"}</Button>
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
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {MODELS.map((m) => (
          <option key={m} value={m} className="bg-popover">
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
