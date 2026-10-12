import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { EntryItem, GradProject } from "@/lib/mediaProject";

export const TAILOR_COST = 1;

export interface TailorEdit {
  field: "objective" | "skills" | "description" | "highlights";
  entryId: string;
  suggested: string;
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

export function currentValue(p: GradProject, e: TailorEdit): string | undefined {
  if (e.field === "objective") return p.profile.objective;
  if (e.field === "skills") return p.skills;
  return findEntry(p, e.entryId)?.[e.field];
}

export function applyEdit(p: GradProject, e: TailorEdit): GradProject {
  if (e.field === "objective") return { ...p, profile: { ...p.profile, objective: e.suggested.slice(0, 500) } };
  if (e.field === "skills") return { ...p, skills: e.suggested.slice(0, 1000) };
  const max = e.field === "description" ? 2000 : 4000;
  const next = { ...p };
  for (const b of BUCKETS) {
    next[b] = p[b].map((x) => (x.id === e.entryId ? { ...x, [e.field]: e.suggested.slice(0, max) } : x));
  }
  return next;
}

export async function tailorCV(jobDescription: string, project: GradProject) {
  const { data, error } = await supabase.functions.invoke("cv-tailor", { body: { jobDescription, cv: compactCV(project) } });
  if (error) {
    let code = "";
    if (error instanceof FunctionsHttpError) { try { code = (await error.context.json()).error; } catch { /* ignore */ } }
    throw new Error(ERRORS[code] ?? "Không tạo được đề xuất. Vui lòng thử lại.");
  }
  const edits = (data.edits as TailorEdit[]).filter((e) => e.field === "objective" || e.field === "skills" || findEntry(project, e.entryId));
  return { fit: data.fit as string, edits, balance: data.balance as number };
}
