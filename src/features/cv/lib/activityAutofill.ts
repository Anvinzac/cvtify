/**
 * Timeline-to-CV autofill: entries, summary drafts, and skill derivation.
 *
 * Exports: activityToCvEntry, draftSummary, deriveSkillGroupsFromActivities
 * Depends on: @/lib/data, @/features/cv/types, @/features/cv/lib/skillCategories
 */

import { Activity, CATEGORIES } from "@/lib/data";
import type { CvEntry, SkillGroup } from "@/features/cv/types";
import { SKILL_CATEGORIES } from "@/features/cv/lib/skillCategories";

const DURATION_MONTHS: Record<string, number> = {
  "Less than a month": 1,
  "1-3 months": 3,
  "3-6 months": 6,
  "6-12 months": 12,
  "More than a year": 18,
};

function ymString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function topItems<T extends string>(
  arrays: T[][],
  limit: number
): T[] {
  const tally = new Map<T, number>();
  for (const arr of arrays) {
    for (const item of arr) tally.set(item, (tally.get(item) ?? 0) + 1);
  }
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

function joinNicely(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * Convert one timeline activity into a CV work-experience entry.
 * @param act - Source timeline activity.
 * @returns Populated CV entry with inferred dates and description bullets.
 */
export function activityToCvEntry(act: Activity): CvEntry {
  const baseTs =
    typeof act.occurredAt === "number" ? act.occurredAt : Number(act.id) || Date.now();
  const start = new Date(baseTs);
  start.setDate(1);
  const startDate =
    act.datePrecision === "year"
      ? String(start.getFullYear())
      : ymString(start);

  let endDate: string | undefined;
  if (act.datePrecision !== "year") {
    const months = DURATION_MONTHS[act.duration] ?? 0;
    if (months > 0) {
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      endDate = ymString(end);
    }
  }

  const category = CATEGORIES.find((c) => c.id === act.categoryId);
  const organization = category?.name ?? "";

  const bullets: string[] = [];
  if (act.taskTypes.length > 0) {
    bullets.push(`Focused on ${act.taskTypes.join(", ").toLowerCase()}.`);
  }
  if (act.skills.length > 0) {
    bullets.push(`Practised ${act.skills.slice(0, 4).join(", ").toLowerCase()}.`);
  }
  if (act.personalNotes?.trim()) {
    bullets.push(act.personalNotes.trim());
  }
  const description = bullets.join("\n") || undefined;

  return {
    id: `act-${act.id}-${Date.now()}`,
    title: act.name,
    organization,
    startDate,
    endDate,
    isCurrent: false,
    description,
  };
}

/**
 * Build a confident first-draft professional summary from captured activities.
 * @param activities - Timeline activities used as source material.
 * @param personalInfo - Optional name/location for personalization.
 * @returns Draft summary text the user can edit.
 */
export function draftSummary(
  activities: Activity[],
  personalInfo: { fullName?: string; location?: string }
): string {
  if (activities.length === 0) {
    return "Curious learner building experience across projects, communities, and teams. Energized by work that turns clear thinking into useful tools, and by teammates who care about getting it right.";
  }

  const skills = topItems(
    activities.map((a) => a.skills),
    3
  ).map((s) => s.toLowerCase());
  const tasks = topItems(
    activities.map((a) => a.taskTypes),
    2
  ).map((t) => t.toLowerCase());
  const values = topItems(
    activities.map((a) => a.values),
    2
  ).map((v) => v.toLowerCase());

  const placeBit = personalInfo.location ? ` based in ${personalInfo.location}` : "";
  const count = activities.length;
  const skillsBit = skills.length > 0 ? `strengths in ${joinNicely(skills)}` : "broad strengths";
  const tasksBit = tasks.length > 0 ? joinNicely(tasks) : "varied work";
  const valuesBit = values.length > 0 ? `Driven by ${joinNicely(values)}.` : "";

  return [
    `Multidisciplinary contributor${placeBit} with ${count} hands-on ${
      count === 1 ? "experience" : "experiences"
    } across teams and settings — ${skillsBit}.`,
    `Comfortable shifting between ${tasksBit}, especially in projects that need clear communication and follow-through.`,
    valuesBit ||
      `Looking for work that combines real responsibility with the freedom to ship things that matter.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Derive skill groups from timeline activities, preserving existing CV skills.
 * @param activities - Timeline activities to scan for skills and task types.
 * @param existing - Current CV skill groups (merged, not replaced).
 * @returns Updated skill groups bucketed by category.
 */
export function deriveSkillGroupsFromActivities(
  activities: Activity[],
  existing: SkillGroup[]
): SkillGroup[] {
  const SOFT_BUCKET = "business-management";
  const ACTIVE = "marketing-sales";
  const TASK_TO_CATEGORY: Record<string, string> = {
    "Planning & Strategy": SOFT_BUCKET,
    "Communication & Outreach": ACTIVE,
    "Creative & Design": "design-creative",
    "Technical & IT": "programming-tech",
    "Leadership & Management": SOFT_BUCKET,
    "Research & Analysis": "data-analytics",
    "Teaching & Mentoring": "education-teaching",
    "Customer Service": "hospitality-service",
    "Operations & Logistics": "admin-operations",
    "Finance & Budgeting": "finance-accounting",
    "Writing & Documentation": "content-media",
    "Problem Solving": SOFT_BUCKET,
  };

  const byCategory = new Map<string, Set<string>>();
  for (const g of existing) {
    byCategory.set(g.category, new Set(g.skills));
  }

  const addTo = (categoryId: string, item: string) => {
    if (!byCategory.has(categoryId)) byCategory.set(categoryId, new Set());
    byCategory.get(categoryId)!.add(item);
  };

  for (const act of activities) {
    for (const skill of act.skills) {
      addTo(SOFT_BUCKET, skill);
    }
    for (const task of act.taskTypes) {
      const cat = TASK_TO_CATEGORY[task] ?? SOFT_BUCKET;
      const category = SKILL_CATEGORIES.find((c) => c.id === cat);
      if (category) {
        addTo(cat, task);
      }
    }
  }

  return Array.from(byCategory.entries())
    .filter(([, set]) => set.size > 0)
    .map(([category, set]) => {
      const prior = existing.find((e) => e.category === category);
      return {
        id: prior?.id ?? `auto-${category}-${Date.now()}`,
        category,
        skills: Array.from(set),
      };
    });
}
