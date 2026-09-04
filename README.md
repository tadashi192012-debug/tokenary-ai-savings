# Tokenary Dashboard

Build "Loding Tokenary" — an AI model cost-optimization dashboard.

WHAT IT DOES: Tokenary sits between a user's app and AI providers (OpenAI, Anthropic, OpenRouter), logging every API call and showing how much money smart model-routing saves them.

CORE SCREENS:
1. Auth — email/password signup and login via Supabase Auth
2. Dashboard (home after login) — shows:
   - Total spend this month vs. estimated baseline spend (the "money saved" number, big and prominent)
   - A line chart of daily spend by model over the last 30 days
   - A table of recent API calls: timestamp, model used, tokens in/out, cost, whether it was routed
3. Routing Rules page — lets the user create/edit rules: task type, cheap model, fallback model, quality threshold (simple form, list of existing rules with edit/delete)
4. API Key page — shows the user's Tokenary API key (for authenticating their proxy calls) with a copy-to-clipboard button, and regenerate option
5. Settings — subscription tier display (free/starter/team), current usage vs. spend limit

DATABASE: Connect to Supabase project ID ptfaaqrpbcvbpyrtxwkq. The schema already exists — do NOT recreate tables, use what's there:
- public.users (id, email, api_key, created_at)
- public.subscriptions (user_id, tier, spend_limit, current_usage)
- public.routing_rules (id, user_id, task_type, cheap_model, fallback_model, quality_threshold)
- public.api_calls (id, user_id, model_used, original_model_requested, tokens_in, tokens_out, cost, latency_ms, was_routed, created_at)
- public.quality_checks (id, api_call_id, score, passed, retried)
- Views: public.v_daily_spend_by_model and public.v_savings_summary (use these for the dashboard charts instead of aggregating client-side)
RLS is already enabled — every query should naturally scope to auth.uid() = user_id, no need to add extra filtering logic since RLS handles it.
Realtime is enabled on api_calls — subscribe to it on the dashboard so new calls appear live without a refresh.

DESIGN: Clean, credible SaaS aesthetic — dark mode by default, similar feel to Vercel/Linear dashboards. Avoid generic AI-startup purple gradients. Use a monochrome-leaning palette with one sharp accent color for the "money saved" number and charts.

Do NOT build the actual proxy/routing backend logic in this project — that's a separate Python service. This Lovable project is the user-facing dashboard and account layer only.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8eda0ced-c19a-4d5e-b5f8-4bf79a0bac07).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
