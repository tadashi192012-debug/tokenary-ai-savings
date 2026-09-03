import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { Logo } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Loding Tokenary" },
      {
        name: "description",
        content:
          "Sign in or create a Loding Tokenary account to track AI spend and model-routing savings.",
      },
      { property: "og:title", content: "Sign in — Loding Tokenary" },
      {
        property: "og:description",
        content: "Access your AI model cost-optimization dashboard.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    // STUB: replace with supabase.auth.signInWithPassword / signUp
    setTimeout(() => {
      setPending(false);
      toast.success(mode === "signin" ? "Signed in" : "Account created", {
        description: "Demo mode — auth wires up once the backend is connected.",
      });
      navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[38rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex justify-center">
          <Logo />
        </div>

        <div className="panel p-6">
          <h1 className="text-lg font-semibold tracking-tight">
            {mode === "signin" ? "Sign in to your dashboard" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Track spend, routing and savings across every provider."
              : "Start logging calls and see what routing saves you."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo shell — email/password auth activates with the backend connection.
        </p>
      </div>
    </div>
  );
}
