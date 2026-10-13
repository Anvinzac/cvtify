import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { EntryItem, GradProject } from "@/lib/mediaProject";

export const TAILOR_COST = 1;

export interface TailorRequirement {
  requirement: string;
  kind: "skill" | "experience";
  status: "matched" | "partial" | "missing";
  evidence: string;
}

/** A small, targeted change — never a full-section rewrite. */
export interface TailorEdit {
  field: "objective" | "skills" | "description" | "highlights";
  entryId: string;
  action: "replace" | "add_line" | "add_skill";
  find: string;
  replace: string;
  requirement: string;
  reason: string;
}

const ERRORS: Record<string, string> = {
  sign_in_required: "Vui lòng đăng nhập để dùng AI.",
  out_of_credits: "Bạn đã hết credit.",
  invalid_input: "Mô tả công việc quá ngắn hoặc quá dài.",
  rate_limited: "AI đang bận, thử lại sau ít phút. Credit đã được hoàn lại.",
  ai_unavailable: "AI tạm thời không khả dụng. Credit đã được hoàn lại.",
  ai_failed: "AI không trả lời được. Credit đã được hoàn lại.",
};

const BUCKETS = ["activities", "internships", "partTimeJobs"] as const;
const LIMITS = { objective: 500, skills: 1000, description: 2000, highlights: 4000 };

/** Text-only CV snapshot (no photos) sent to the model. */
function compactCV(p: GradProject) {
  const entry = (e: EntryItem) => ({ id: e.id, title: e.title, organization: e.organization, description: e.description, highlights: e.highlights });
  return {
    objective: p.profile.objective,
    education: { school: p.education.school, major: p.education.major, honors: p.education.honors, certificates: p.education.certificates.map((c) => c.name) },
    activities: p.activities.map(entry),
    internships: p.internships.map(entry),
    partTimeJobs: p.partTimeJobs.map(entry),
    skills: p.skills,
  };
}

export function findEntry(p: GradProject, id: string): EntryItem | undefined {
  for (const b of BUCKETS) { const e = p[b].find((x) => x.id === id); if (e) return e; }
}

export function currentValue(p: GradProject, e: Pick<TailorEdit, "field" | "entryId">): string | undefined {
  if (e.field === "objective") return p.profile.objective;
  if (e.field === "skills") return p.skills;
  return findEntry(p, e.entryId)?.[e.field];
}

/** New field text after the edit, or null when the edit no longer fits the CV. */
export function editedValue(p: GradProject, e: TailorEdit): string | null {
  const cur = currentValue(p, e);
  if (cur === undefined) return null;
  let next: string;
  if (e.action === "replace") {
    if (!e.find || !cur.includes(e.find)) return null;
    next = cur.replace(e.find, e.replace);
  } else if (e.action === "add_skill") {
    if (e.field !== "skills") return null;
    const skill = e.replace.trim();
    const list = cur.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.some((s) => s.toLowerCase() === skill.toLowerCase())) return null;
    next = [...list, skill].join(", ");
  } else {
    next = cur.trim() ? `${cur.replace(/\s+$/, "")}\n${e.replace.trim()}` : e.replace.trim();
  }
  return next.length > LIMITS[e.field] ? null : next;
}

export function applyEdit(p: GradProject, e: TailorEdit): GradProject {
  const next = editedValue(p, e);
  if (next === null) return p;
  if (e.field === "objective") return { ...p, profile: { ...p.profile, objective: next } };
  if (e.field === "skills") return { ...p, skills: next };
  const out = { ...p };
  for (const b of BUCKETS) out[b] = p[b].map((x) => (x.id === e.entryId ? { ...x, [e.field]: next } : x));
  return out;
}

export async function tailorCV(jobDescription: string, project: GradProject) {
  const { data, error } = await supabase.functions.invoke("cv-tailor", { body: { jobDescription, cv: compactCV(project) } });
  if (error) {
    let code = "";
    if (error instanceof FunctionsHttpError) { try { code = (await error.context.json()).error; } catch { /* ignore */ } }
    throw new Error(ERRORS[code] ?? "Không tạo được đề xuất. Vui lòng thử lại.");
  }
  const edits = (data.edits as TailorEdit[]).filter((e) => editedValue(project, e) !== null);
  return {
    fit: data.fit as string,
    score: data.score as number,
    requirements: data.requirements as TailorRequirement[],
    edits,
    balance: data.balance as number,
  };
}
