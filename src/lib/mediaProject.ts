import { z } from "zod";
import type { CSSProperties } from "react";

/* ------------------------------------------------------------------
 * FRESH-GRADUATE CV DATA MODEL (version 2)
 * A compact, Vietnamese-language CV aimed at new graduates. The model
 * is education-centric: profile, education (+ certificates), and three
 * experience buckets (activities, internships, part-time jobs), plus
 * comma-separated skills and hobbies.
 * ------------------------------------------------------------------ */

export const MAX_TOTAL_PHOTOS = 60;
export const MAX_PHOTO_DATA_BYTES = 24 * 1024 * 1024;
export const MAX_BACKUP_BYTES = 90 * 1024 * 1024;

export const photoSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  // Data URLs for user uploads; https URLs are allowed so the demo persona can use stock photos.
  src: z
    .string()
    .max(2_800_000)
    .refine((s) => s.startsWith("data:image/") || s.startsWith("https://"), {
      message: "Ảnh phải là data URL hoặc liên kết https.",
    }),
  alt: z.string().max(300),
  caption: z.string().max(300),
  position: z.enum(["center", "top", "bottom"]),
  width: z.number().int().min(1).max(2400),
  height: z.number().int().min(1).max(2400),
});
export type MediaPhoto = z.infer<typeof photoSchema>;

export const certificateSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  score: z.string().max(50),
  date: z.string().max(10), // "YYYY-MM" or free text
  issuer: z.string().max(200),
});
export type Certificate = z.infer<typeof certificateSchema>;

export const entryItemSchema = z.object({
  id: z.string(),
  title: z.string().max(200),
  organization: z.string().max(200),
  location: z.string().max(200),
  startDate: z.string().max(10),
  endDate: z.string().max(10),
  current: z.boolean(),
  description: z.string().max(2000),
  highlights: z.string().max(4000), // newline-separated
  photos: z.array(photoSchema).max(4),
});
export type EntryItem = z.infer<typeof entryItemSchema>;

export const gradSettingsSchema = z.object({
  theme: z.enum(["nebula", "ember", "aurora"]),
  motion: z.enum(["immersive", "subtle", "still"]),
  pace: z.enum(["compact", "detailed"]),
});
export type GradSettings = z.infer<typeof gradSettingsSchema>;

export const gradProjectSchema = z
  .object({
    version: z.literal(2),
    profile: z.object({
      name: z.string().max(100),
      objective: z.string().max(500),
      email: z.string().max(254),
      phone: z.string().max(20),
      dob: z.string().max(30),
      address: z.string().max(300),
      photo: photoSchema.nullable(),
    }),
    education: z.object({
      school: z.string().max(200),
      major: z.string().max(200),
      gpa: z.string().max(20),
      startDate: z.string().max(10),
      endDate: z.string().max(10),
      honors: z.string().max(500),
      certificates: z.array(certificateSchema).max(10),
      photo: photoSchema.nullable(),
    }),
    activities: z.array(entryItemSchema).max(10),
    internships: z.array(entryItemSchema).max(10),
    partTimeJobs: z.array(entryItemSchema).max(10),
    skills: z.string().max(1000), // comma-separated
    hobbies: z.string().max(500), // comma-separated
    settings: gradSettingsSchema,
  })
  .superRefine((project, ctx) => {
    const allPhotos: MediaPhoto[] = [
      ...(project.profile.photo ? [project.profile.photo] : []),
      ...(project.education.photo ? [project.education.photo] : []),
      ...project.activities.flatMap((a) => a.photos),
      ...project.internships.flatMap((i) => i.photos),
      ...project.partTimeJobs.flatMap((j) => j.photos),
    ];
    if (allPhotos.length > MAX_TOTAL_PHOTOS) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Quá ${MAX_TOTAL_PHOTOS} ảnh` });
    }
    const bytes = allPhotos.reduce((sum, p) => sum + photoDataBytes(p), 0);
    if (bytes > MAX_PHOTO_DATA_BYTES) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Tổng dung lượng ảnh vượt 24 MB" });
    }
    // Unique ID check across every entry, photo and certificate.
    const ids = new Set<string>();
    const allEntries = [...project.activities, ...project.internships, ...project.partTimeJobs];
    for (const item of allEntries) {
      if (ids.has(item.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Trùng id: ${item.id}` });
      ids.add(item.id);
      for (const photo of item.photos) {
        if (ids.has(photo.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Trùng id ảnh: ${photo.id}` });
        ids.add(photo.id);
      }
    }
    for (const cert of project.education.certificates) {
      if (ids.has(cert.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Trùng id chứng chỉ: ${cert.id}` });
      ids.add(cert.id);
    }
  });

export type GradProject = z.infer<typeof gradProjectSchema>;

/* ------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------ */

export const newId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");

export const parseProject = (input: unknown): GradProject => gradProjectSchema.parse(input);

export const defaultSettings: GradSettings = { theme: "nebula", motion: "immersive", pace: "compact" };

/** Estimates the decoded byte size of a base64 data URL (0 for remote https photos). */
export function photoDataBytes(photo: MediaPhoto): number {
  if (!photo.src.startsWith("data:")) return 0;
  const comma = photo.src.indexOf(",");
  const base64 = comma >= 0 ? photo.src.slice(comma + 1) : photo.src;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function emptyCertificate(): Certificate {
  return { id: newId(), name: "", score: "", date: "", issuer: "" };
}

export function emptyEntry(): EntryItem {
  return {
    id: newId(),
    title: "",
    organization: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    highlights: "",
    photos: [],
  };
}

export function emptyProject(): GradProject {
  return {
    version: 2,
    profile: { name: "", objective: "", email: "", phone: "", dob: "", address: "", photo: null },
    education: {
      school: "",
      major: "",
      gpa: "",
      startDate: "",
      endDate: "",
      honors: "",
      certificates: [],
      photo: null,
    },
    activities: [],
    internships: [],
    partTimeJobs: [],
    skills: "",
    hobbies: "",
    settings: { ...defaultSettings },
  };
}

/** Splits a comma/newline separated string, trims, drops empties and de-duplicates. */
export function splitItems(value: string, sep?: string): string[] {
  const seen = new Set<string>();
  const parts = sep ? value.split(sep) : value.split(/[,\n]/);
  return parts
    .map((s) => s.trim())
    .filter((s) => {
      if (!s || seen.has(s.toLocaleLowerCase())) return false;
      seen.add(s.toLocaleLowerCase());
      return true;
    });
}

/** Splits newline-separated highlights into clean bullet lines. */
export const lines = (value: string) =>
  value
    .split("\n")
    .map((s) => s.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

export const validMonth = (value: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value.trim());

/** Vietnamese month label: "2024-09" -> "09/2024"; anything else is returned as-is. */
export function monthLabel(dateStr: string): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(dateStr.trim());
  if (!match) return dateStr;
  return `${match[2]}/${match[1]}`;
}

/* ------------------------------------------------------------------
 * Theming
 * ------------------------------------------------------------------ */

const THEME_TOKENS: Record<GradSettings["theme"], {
  background: string; foreground: string; primary: string; accent: string;
  card: string; muted: string; border: string; mutedForeground: string;
}> = {
  nebula: {
    background: "#0B0D17", foreground: "#E8E6F0", primary: "#7C3AED", accent: "#3B82F6",
    card: "#13162A", muted: "#1C1F3A", border: "#252850", mutedForeground: "#8B8DA8",
  },
  ember: {
    background: "#1A1412", foreground: "#F0E8E0", primary: "#F59E0B", accent: "#EF4444",
    card: "#261E1A", muted: "#332822", border: "#4A3830", mutedForeground: "#A89080",
  },
  aurora: {
    background: "#0A1219", foreground: "#E0F0EC", primary: "#06B6D4", accent: "#10B981",
    card: "#111E28", muted: "#172A36", border: "#1F3A4A", mutedForeground: "#78A098",
  },
};

export function themeStyle(settings: GradSettings): CSSProperties {
  const t = THEME_TOKENS[settings.theme];
  return {
    "--background": t.background,
    "--foreground": t.foreground,
    "--primary": t.primary,
    "--accent": t.accent,
    "--card": t.card,
    "--muted": t.muted,
    "--border": t.border,
    "--muted-foreground": t.mutedForeground,
    colorScheme: "dark",
  } as CSSProperties;
}

/* ------------------------------------------------------------------
 * Completeness checklist
 * ------------------------------------------------------------------ */

export interface ProjectIssue {
  id: string;
  message: string;
  /** Blocking issues gate Download/Share; advisory issues are gentle nudges. */
  blocking: boolean;
}

export function projectIssues(project: GradProject): ProjectIssue[] {
  const issues: ProjectIssue[] = [];
  const p = project.profile;
  const e = project.education;
  const add = (id: string, message: string, blocking: boolean) => issues.push({ id, message, blocking });

  // Blocking — the CV is not shareable without these.
  if (!p.name.trim()) add("profile-name", "Vui lòng nhập họ và tên.", true);
  if (!e.school.trim()) add("education-school", "Vui lòng nhập tên trường.", true);
  if (!e.major.trim()) add("education-major", "Vui lòng nhập chuyên ngành.", true);

  // Advisory — recommended but not required.
  if (!p.objective.trim()) add("profile-objective", "Nên thêm mục tiêu nghề nghiệp.", false);
  if (!e.gpa.trim()) add("education-gpa", "Nên thêm GPA của bạn.", false);
  if (!p.email.trim()) add("profile-email", "Nên thêm email liên hệ.", false);
  if (!p.phone.trim()) add("profile-phone", "Nên thêm số điện thoại liên hệ.", false);

  return issues;
}

/** Only the blocking issues — used to gate Download HTML / share actions. */
export const blockingIssues = (project: GradProject): ProjectIssue[] =>
  projectIssues(project).filter((issue) => issue.blocking);
