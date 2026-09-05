import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Loader2, Plug, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/use-session";
import { useProviderKeys, useRevokeProviderKey, useStoreProviderKey } from "@/lib/queries";
import { PROVIDERS, type Provider } from "@/lib/types";

export const Route = createFileRoute("/providers")({
  head: () => ({
    meta: [
      { title: "Connected providers — Loding Tokenary" },
      {
        name: "description",
        content:
          "Add and revoke the OpenAI, Anthropic, OpenRouter and Google keys Tokenary uses to route your model calls.",
      },
      { property: "og:title", content: "Connected providers — Loding Tokenary" },
      {
        property: "og:description",
        content: "Manage the provider credentials behind your routed traffic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const { session } = useSession();
  const { data: keys = [], isLoading } = useProviderKeys(!!session);
  const store = useStoreProviderKey();
  const revoke = useRevokeProviderKey();

  const [nickname, setNickname] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim() || !apiKey.trim()) {
      toast.error("Add a nickname and the provider key");
      return;
    }
    const secret = apiKey;
    // Drop the plaintext from form state before the request resolves.
    setApiKey("");
    try {
      await store.mutateAsync({
        nickname: nickname.trim(),
        provider,
        api_key: secret,
      });
      setNickname("");
      toast.success("Provider key stored securely");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not store that key");
    }
  };

  const doRevoke = async (id: string) => {
    try {
      await revoke.mutateAsync(id);
      toast.success("Key revoked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revoke that key");
    }
  };

  return (
    <AppShell
      title="Connected providers"
      description="Keys are encrypted server-side the moment they are submitted and never returned to this page."
    >
      <div className="grid max-w-3xl gap-4">
        <section className="panel p-5">
          <h2 className="text-sm font-medium">Add a provider key</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tokenary stores only the last four characters for display.
          </p>

          <form onSubmit={submit} className="mt-4 grid gap-4" autoComplete="off">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. OpenAI - Production"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="provider">Provider</Label>
                <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="api-key">API key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••"
                autoComplete="new-password"
                spellCheck={false}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={store.isPending}>
                {store.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plug className="size-4" />
                )}
                Connect provider
              </Button>
            </div>
          </form>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-medium">Connected keys</h2>

          {isLoading ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="grid place-items-center gap-2 rounded-md border border-dashed border-border px-6 py-12 text-center">
              <div className="grid size-9 place-items-center rounded-md bg-secondary">
                <KeyRound className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No providers connected yet</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Add your first OpenAI or Anthropic key above and Tokenary can start routing calls
                to the cheapest model that clears your quality bar.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {keys.map((k) => (
                <li key={k.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface text-[11px] font-semibold uppercase">
                    {k.provider.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{k.nickname}</span>
                      <Badge variant={k.is_active ? "outline" : "secondary"} className="capitalize">
                        {k.is_active ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      <span className="capitalize">{k.provider}</span>
                      {" · "}
                      <span className="font-mono">••••{k.last_four}</span>
                      {" · "}
                      Added {new Date(k.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {k.is_active && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={revoke.isPending}>
                          <ShieldOff className="size-3.5" />
                          Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke “{k.nickname}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately stop this key from being used. Continue?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => doRevoke(k.id)}>
                            Revoke key
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
