import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Eye, EyeOff, RefreshCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
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
import { mockUser } from "@/lib/mock-data";

export const Route = createFileRoute("/api-key")({
  head: () => ({
    meta: [
      { title: "API key — Loding Tokenary" },
      {
        name: "description",
        content:
          "Copy or regenerate the Tokenary API key your application uses to authenticate proxied model calls.",
      },
      { property: "og:title", content: "API key — Loding Tokenary" },
      {
        property: "og:description",
        content: "Manage the key that authenticates your proxy traffic.",
      },
    ],
  }),
  component: ApiKeyPage,
});

function ApiKeyPage() {
  const [key, setKey] = useState(mockUser.api_key);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const masked = `${key.slice(0, 11)}${"•".repeat(20)}${key.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  const regenerate = () => {
    // STUB: replace with a server function that rotates users.api_key
    const rand = Array.from({ length: 32 }, () =>
      "0123456789abcdef".charAt(Math.floor(Math.random() * 16)),
    ).join("");
    setKey(`tk_live_${rand}`);
    setRevealed(true);
    toast.success("New API key generated", { description: "The previous key stopped working." });
  };

  return (
    <AppShell
      title="API key"
      description="Authenticate your proxy calls to the Tokenary gateway."
    >
      <div className="grid max-w-3xl gap-4">
        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Secret key</h2>
              <p className="text-xs text-muted-foreground">
                Created {new Date(mockUser.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              active
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm">
              {revealed ? key : masked}
            </code>
            <Button variant="outline" size="icon" onClick={() => setRevealed(!revealed)}>
              {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              <span className="sr-only">{revealed ? "Hide" : "Reveal"} key</span>
            </Button>
            <Button variant="outline" onClick={copy}>
              {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Treat this like a password. It is shown in full only to you and can be rotated at any
            time.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-medium">Using the key</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Point your existing SDK at the gateway and send the key as a bearer token.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            {`client = OpenAI(
    base_url="https://gateway.tokenary.dev/v1",
    api_key="${revealed ? key : masked}",
)`}
          </pre>
        </section>

        <section className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <div>
                <h2 className="text-sm font-medium">Regenerate key</h2>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Issues a new key immediately and revokes the current one. Any service still
                  using the old key will start receiving 401s.
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RefreshCw className="size-4" />
                  Regenerate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate your API key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The current key is revoked the moment the new one is created. Update every
                    deployment that uses it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={regenerate}>Regenerate key</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
