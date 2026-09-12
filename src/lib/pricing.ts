import type { Tier } from "./types";

export interface PricingTier {
  tier: Tier;
  name: string;
  price: string;
  limit: string;
  trackedSpend: string;
  perks: string[];
  highlight?: boolean;
}

/** Single source of truth for pricing — used by the landing page and Settings. */
export const PRICING_TIERS: PricingTier[] = [
  {
    tier: "free",
    name: "Free",
    price: "$0",
    limit: "$300 / mo tracked spend",
    trackedSpend: "Up to $300/mo tracked spend",
    perks: ["1 routing rule", "7-day call history", "Community support"],
  },
  {
    tier: "starter",
    name: "Starter",
    price: "$5.99",
    limit: "$2,000 / mo tracked spend",
    trackedSpend: "Up to $2,000/mo tracked spend",
    perks: ["Unlimited routing rules", "90-day call history", "Quality scoring"],
    highlight: true,
  },
  {
    tier: "pro",
    name: "Pro",
    price: "$9.99",
    limit: "$10,000 / mo tracked spend",
    trackedSpend: "Up to $10,000/mo tracked spend",
    perks: ["Everything in Starter", "Priority support", "Full audit log access"],
  },
];
