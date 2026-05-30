import { Activity, CATEGORIES } from "@/lib/data";
import {
  CvEntry,
  CvPersonalInfo,
  SkillGroup,
  SKILL_CATEGORIES,
} from "@/lib/storage";

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{8,}\d)/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/i;
const URL_RE =
  /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]+\.(?:com|net|org|io|dev|me|co|app|design|art|studio|page|xyz|tech|info|site|portfolio)(?:\/[\w./?#&=%-]*)?)\b/i;
const CITY_RE =
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{2,}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/;

const STOP_WORDS = new Set([
  "About",
  "Skills",
  "Experience",
  "Summary",
  "Education",
  "Contact",
  "Hello",
  "Hi",
  "Hey",
  "Profile",
  "Resume",
  "CV",
]);

/**
 * Best-effort parse of a free-form paste (LinkedIn About, email signature,
 * resume header, "Hi I'm Alex Chen — alex@example.com, +1 555 234 5678…").
 * Returns only the fields we're confident about.
 */
export interface QuickFillResult {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  /** Field names that were actually extracted (drives the UI summary). */
  filled: (keyof CvPersonalInfo)[];
}

export function parseQuickFill(text: string): QuickFillResult {
  const result: QuickFillResult = { filled: [] };
  if (!text.trim()) return result;

  const email = text.match(EMAIL_RE)?.[0];
  if (email) {
    result.email = email;
    result.filled.push("email");
  }

  const linkedin = text.match(LINKEDIN_RE)?.[0];
  if (linkedin) {
    result.linkedin = linkedin.replace(/^https?:\/\/(www\.)?/i, "");
    result.filled.push("linkedin");
  }

  // Find a website that isn't the linkedin/email host
  const urls = Array.from(text.matchAll(new RegExp(URL_RE, "gi")))
    .map((m) => m[1])
    .filter((u) => !/linkedin\.com/i.test(u))
    .filter((u) => !email || !email.endsWith(u.replace(/^https?:\/\/(www\.)?/i, "")));
  if (urls.length > 0) {
    result.website = urls[0].replace(/^https?:\/\/(www\.)?/i, "");
    result.filled.push("website");
  }

  // Phone — strip email digits first so 5+ digits in email aren't mistaken
  const safeText = email ? text.replace(email, " ") : text;
  const phone = safeText.match(PHONE_RE)?.[0];
  if (phone) {
    // Compact whitespace
    result.phone = phone.replace(/\s+/g, " ").trim();
    result.filled.push("phone");
  }

  // Location — look for "City, ST" or "City, Country"
  const loc = text.match(CITY_RE);
  if (loc) {
    result.location = `${loc[1]}, ${loc[2]}`;
    result.filled.push("location");
  }

  // Name — first 2-4 capitalized words at the start of any line not containing @, http, digits
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (/@|https?:|\d/.test(line)) continue;
    if (line.length > 60) continue;
    // Strip leading greeting words
    const cleaned = line
      .replace(/^(?:hi|hello|hey|i['']?m|my name is|this is)\s*[,:!\-—]?\s*/i, "")
      .replace(/[,.!—-].*$/, "")
      .trim();
    const tokens = cleaned.split(/\s+/);
    if (tokens.length >= 1 && tokens.length <= 4) {
      const allCap = tokens.every(
        (t) => /^[A-Z][A-Za-z'-]+$/.test(t) && !STOP_WORDS.has(t)
      );
      if (allCap) {
        result.fullName = tokens.join(" ");
        result.filled.push("fullName");
        break;
      }
    }
  }

  return result;
}

/* ----------------------------------------------------------------------- */
/* Activity → CV experience                                                 */
/* ----------------------------------------------------------------------- */

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

/**
 * Convert one timeline activity into a CV work-experience entry. Fills:
 *   - title:        activity.name
 *   - organization: derived from category (e.g. "Charity events" → "Social Works")
 *   - location:     left blank (user adds if needed)
 *   - startDate:    YYYY-MM from occurredAt (or id timestamp)
 *   - endDate:      startDate + duration, unless precision is year only
 *   - description:  bullet list combining task types + skills + personal notes
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

/* ----------------------------------------------------------------------- */
/* Summary draft generator                                                  */
/* ----------------------------------------------------------------------- */

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

/**
 * Build a confident first-draft professional summary from the captured
 * activities + skills. The user can edit afterwards.
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

/* ----------------------------------------------------------------------- */
/* Skill auto-fill from timeline                                            */
/* ----------------------------------------------------------------------- */

/**
 * Walk every captured activity, collect each unique skill and task type,
 * and bucket them into the CV's `business-management` (soft skills) and
 * task-aligned skill categories. Skills already in the CV are preserved.
 */
export function deriveSkillGroupsFromActivities(
  activities: Activity[],
  existing: SkillGroup[]
): SkillGroup[] {
  const SOFT_BUCKET = "business-management";
  const ACTIVE = "marketing-sales"; // outreach / customer-facing
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

  // Start from existing CV groups (keyed by category)
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
      // Only push task name if it's not already a known SKILL_CATEGORIES skill
      const category = SKILL_CATEGORIES.find((c) => c.id === cat);
      if (category) {
        // Use a slightly less verbose label
        addTo(cat, task);
      }
    }
  }

  // Stable id per category, preserving existing ids
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

function joinNicely(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
