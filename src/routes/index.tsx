import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  KeyRound,
  Layers,
  Lock,
  Route as RouteIcon,
  Shield,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Loding Tokenary — Stop surprise AI invoices" },
      {
        name: "description",
        content:
          "Tokenary routes your OpenAI, Anthropic and OpenRouter calls to cheaper models automatically, falls back when quality fails, and shows you exactly what you saved.",
      },
      { property: "og:title", content: "Loding Tokenary — Stop surprise AI invoices" },
      {
        property: "og:description",
        content:
          "Automatic model routing and spend tracking for small dev teams and solo founders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Pricing />
        <Security />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="relative grid size-7 place-items-center rounded-md border border-border-strong bg-secondary">
            <span className="size-2 rounded-[2px] bg-accent" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            Loding<span className="text-muted-foreground"> Tokenary</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start free
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[44rem] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          <Zap className="size-3 text-accent" />
          Built for teams spending $500–$20k/mo on AI APIs
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-[1.12] tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Stop opening surprise{" "}
          <span className="text-accent accent-glow">$5,000 AI invoices</span> with no idea which
          feature caused them.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Tokenary sits between your app and OpenAI, Anthropic, and OpenRouter. It routes each call
          to the cheapest model that can handle it, falls back to a stronger one when quality checks
          fail, and shows you exactly where your money went — and what you saved.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:bg-accent/90"
            style={{ boxShadow: "var(--glow-accent)" }}
          >
            Start free
            <ArrowRight className="size-4" />
          </Link>
          <span className="text-xs text-muted-foreground">No credit card required.</span>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-accent" />
            Works with your existing SDK
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-accent" />
            Real-time savings dashboard
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-accent" />
            Encrypted provider keys
          </span>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const cards = [
    {
      icon: BarChart3,
      title: "You don't know where the money goes",
      body: "Three providers, five models, twelve services. Your invoice is a single number. You have no idea which product decision doubled your spend last month.",
    },
    {
      icon: Layers,
      title: "Every model costs something different",
      body: "GPT-4o, Claude Sonnet, Haiku, Mini. The right model for a task can be 10x cheaper than the wrong one. You're probably overpaying on every low-stakes call.",
    },
    {
      icon: Users,
      title: "Nobody owns this problem on your team",
      body: "You're a founder or a senior dev, not a procurement department. You don't have time to babysit API dashboards. So the bill keeps growing unchecked.",
    },
  ];

  return (
    <section className="border-t border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            AI spend is the surprise bill nobody planned for
          </h2>
          <p className="mt-3 text-muted-foreground">
            Most teams set up a provider key, ship a feature, and find out the cost when the
            invoice arrives. Tokenary fixes that at the source.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="panel p-6">
              <div className="grid size-9 place-items-center rounded-md border border-border bg-surface">
                <c.icon className="size-4 text-accent" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: KeyRound,
      title: "Connect your provider keys",
      body: "Paste in your OpenAI, Anthropic, OpenRouter, or Google keys. They're encrypted immediately and never shown again.",
    },
    {
      number: "02",
      icon: RouteIcon,
      title: "Set simple routing rules",
      body: "Choose a task type, a cheap model to try first, a fallback model, and a quality threshold. That's the whole policy.",
    },
    {
      number: "03",
      icon: Zap,
      title: "Tokenary routes automatically",
      body: "Every call hits the cheap model first. If quality checks fail, it falls back. You change zero application code.",
    },
    {
      number: "04",
      icon: BarChart3,
      title: "Watch your savings dashboard update live",
      body: "See month-over-month spend vs. baseline, daily spend by model, and a live feed of routed calls as they happen.",
    },
  ];

  return (
    <section className="border-t border-border bg-surface/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            No proxy code to write. No model benchmarks to maintain. You add keys, set rules, and
            point your SDK at Tokenary.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.number} className="panel relative p-6">
              <span className="absolute right-5 top-5 font-mono text-xs text-muted-foreground/60">
                {s.number}
              </span>
              <div className="grid size-9 place-items-center rounded-md border border-border bg-surface">
                <s.icon className="size-4 text-accent" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = PRICING_TIERS;


  return (
    <section className="border-t border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Pricing built for indie teams, not procurement departments
          </h2>
          <p className="mt-3 text-muted-foreground">
            No annual contracts, no sales calls. Pay monthly and upgrade when your tracked spend
            grows.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`panel flex flex-col p-6 ${t.highlight ? "border-accent/40" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{t.name}</span>
                {t.highlight && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground"> / mo</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t.trackedSpend}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {p}
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  t.highlight
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "border border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                Start free
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    {
      icon: Lock,
      title: "Encrypted at rest",
      body: "Provider keys are encrypted the moment they hit our servers. We never store or log plaintext keys.",
    },
    {
      icon: Shield,
      title: "Never shown again",
      body: "Once you paste a key, the dashboard only shows the provider and the last four characters. The full key is gone from the UI.",
    },
    {
      icon: ShieldCheck,
      title: "Full audit log",
      body: "Every access to your provider keys is logged. You can revoke a key instantly from the dashboard.",
    },
    {
      icon: CreditCard,
      title: "No prompts stored",
      body: "Tokenary routes your traffic; it doesn't retain the content of your requests unless you explicitly opt in.",
    },
  ];

  return (
    <section className="border-t border-border bg-surface/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Your keys are treated like secrets — because they are
          </h2>
          <p className="mt-3 text-muted-foreground">
            We know you're pasting real production credentials. Security isn't a footnote here.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.title} className="panel flex gap-4 p-5">
              <div className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface">
                <i.icon className="size-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{i.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{i.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t border-border px-5 py-16 md:px-8 md:py-24">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 text-center md:px-12">
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full opacity-[0.12] blur-3xl"
          style={{ background: "var(--accent)" }}
        />
        <h2 className="relative text-2xl font-semibold tracking-tight md:text-3xl">
          Find out what routing saves you this month
        </h2>
        <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
          Connect your first provider key, set one routing rule, and watch the dashboard show your
          baseline spend drop in real time.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90"
            style={{ boxShadow: "var(--glow-accent)" }}
          >
            Start free
            <ArrowRight className="size-4" />
          </Link>
          <span className="text-xs text-muted-foreground">Free forever up to $1,000/mo tracked.</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-5 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="relative grid size-6 place-items-center rounded-md border border-border-strong bg-secondary">
            <span className="size-1.5 rounded-[2px] bg-accent" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Loding<span className="text-muted-foreground"> Tokenary</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Loding Tokenary. Built for small teams with big AI bills.
        </p>
      </div>
    </footer>
  );
}
