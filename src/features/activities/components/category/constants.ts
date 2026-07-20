/**
 * Category card color tokens for the category grid.
 *
 * Exports: CATEGORY_COLORS
 */

export const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  "home-business": { bar: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
  "social-works": { bar: "bg-rose-400", bg: "bg-rose-50", text: "text-rose-700" },
  "part-time": { bar: "bg-sky-400", bg: "bg-sky-50", text: "text-sky-700" },
  "projects-internship": { bar: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  "extra-curriculum": { bar: "bg-violet-400", bg: "bg-violet-50", text: "text-violet-700" },
  professional: { bar: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700" },
  "supplemental-education": { bar: "bg-indigo-400", bg: "bg-indigo-50", text: "text-indigo-700" },
};

export type ViewMode = "grid" | "timeline";
