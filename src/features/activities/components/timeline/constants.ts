/**
 * Timeline visual constants and duration weight mapping.
 */

import { DURATION_OPTIONS } from "@/features/activities/lib/catalog";

export const CATEGORY_COLORS: Record<
  string,
  { bar: string; ring: string; text: string; soft: string }
> = {
  "home-business": { bar: "bg-amber-400", ring: "ring-amber-400/40", text: "text-amber-700", soft: "bg-amber-50" },
  "social-works": { bar: "bg-rose-400", ring: "ring-rose-400/40", text: "text-rose-700", soft: "bg-rose-50" },
  "part-time": { bar: "bg-sky-400", ring: "ring-sky-400/40", text: "text-sky-700", soft: "bg-sky-50" },
  "projects-internship": { bar: "bg-emerald-400", ring: "ring-emerald-400/40", text: "text-emerald-700", soft: "bg-emerald-50" },
  "extra-curriculum": { bar: "bg-violet-400", ring: "ring-violet-400/40", text: "text-violet-700", soft: "bg-violet-50" },
  professional: { bar: "bg-slate-400", ring: "ring-slate-400/40", text: "text-slate-700", soft: "bg-slate-50" },
  "supplemental-education": { bar: "bg-indigo-400", ring: "ring-indigo-400/40", text: "text-indigo-700", soft: "bg-indigo-50" },
};

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Relative bar width per duration label for timeline cards. */
export const DURATION_WEIGHT: Record<string, number> = {
  "Less than a month": 0.15,
  "1-3 months": 0.35,
  "3-6 months": 0.55,
  "6-12 months": 0.78,
  "More than a year": 1,
};

/** Short label for a duration option (e.g. "1-3mo"). */
export function durationShort(d: string): string {
  const idx = DURATION_OPTIONS.indexOf(d);
  if (idx === 0) return "<1mo";
  if (idx === 1) return "1-3mo";
  if (idx === 2) return "3-6mo";
  if (idx === 3) return "6-12mo";
  if (idx === 4) return "1y+";
  return d;
}

/** Compact group size label for timeline meta row. */
export function compactGroup(g: string): string {
  if (g.startsWith("Solo")) return "Solo";
  if (g.startsWith("Small")) return "Small";
  if (g.startsWith("Medium")) return "Medium";
  if (g.startsWith("Large")) return "Large";
  if (g.startsWith("Organization")) return "Org";
  return g;
}
