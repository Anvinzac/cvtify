import { z } from "zod";
import type { CSSProperties } from "react";
import type { CVData } from "./cvData";
import type { CvData as ProfileData } from "./storage";

export const MAX_EXPERIENCES = 20;
export const MAX_PHOTOS = 6;
export const MAX_TOTAL_PHOTOS = 60;
export const MAX_PHOTO_DATA_BYTES = 24 * 1024 * 1024;
export const MAX_BACKUP_BYTES = 90 * 1024 * 1024;
const text = (max: number) => z.string().max(max);
const id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);

export const photoSchema = z.object({
  id,
  name: text(200),
  src: z.string().max(2_800_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
  alt: text(300),
  caption: text(300),
  position: z.enum(["center", "top", "bottom"]),
  width: z.number().int().positive().max(2400),
  height: z.number().int().positive().max(2400),
});
export type MediaPhoto = Required<z.infer<typeof photoSchema>>;

export const experienceSchema = z.object({
  id,
  role: text(140),
  organization: text(140),
  location: text(140),
  startDate: text(7),
  endDate: text(7),
  current: z.boolean(),
  summary: text(320),
  duties: text(4000),
  highlights: text(2000),
  skills: text(800),
  learning: text(1600),
  photos: z.array(photoSchema).max(MAX_PHOTOS),
});
export type MediaExperience = Required<Omit<z.infer<typeof experienceSchema>, "photos">> & { photos: MediaPhoto[] };

export const settingsSchema = z.object({
  theme: z.enum(["midnight", "paper", "forest"]),
  typography: z.enum(["editorial", "modern", "minimal"]),
  motion: z.enum(["immersive", "subtle", "still"]),
  pace: z.enum(["quick", "detailed"]),
  showSkills: z.boolean(),
  showStory: z.boolean(),
  showGallery: z.boolean(),
});
export type MediaSettings = Required<z.infer<typeof settingsSchema>>;

export const projectSchema = z.object({
  version: z.literal(1),
  profile: z.object({
    name: text(100),
    headline: text(160),
    email: text(254),
    location: text(140),
    availability: text(160),
    tagline: text(360),
    about: text(2200),
    skills: text(1000),
    website: text(500),
    linkedin: text(500),
    cover: photoSchema.nullable(),
  }),
  experiences: z.array(experienceSchema).max(MAX_EXPERIENCES),
  values: z.array(z.object({ id, title: text(100), text: text(800) })).max(6),
  settings: settingsSchema,
}).superRefine((project, ctx) => {
  const photos = [...(project.profile.cover ? [project.profile.cover] : []), ...project.experiences.flatMap((e) => e.photos)];
  if (photos.length > MAX_TOTAL_PHOTOS) ctx.addIssue({ code: "custom", message: `Use no more than ${MAX_TOTAL_PHOTOS} photos in one CV.` });
  if (photos.reduce((bytes, photo) => bytes + photo.src.length, 0) > MAX_PHOTO_DATA_BYTES) ctx.addIssue({ code: "custom", message: "The combined optimized photo data must be under 24 MB." });
  for (const entries of [project.experiences, project.values, photos]) {
    if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
      ctx.addIssue({ code: "custom", message: "This project contains duplicate identifiers." });
    }
  }
});
export type MediaProject = {
  version: 1;
  profile: Required<Omit<z.infer<typeof projectSchema>["profile"], "cover">> & { cover: MediaPhoto | null };
  experiences: MediaExperience[];
  values: { id: string; title: string; text: string }[];
  settings: MediaSettings;
};
export const parseProject = (input: unknown) => projectSchema.parse(input) as MediaProject;
export const workspaceSchema = z.object({
  draft: projectSchema,
  generated: projectSchema.nullable(),
  generatedAt: z.string().nullable(),
  step: z.number().int().min(0).max(4),
});
export interface MediaWorkspace {
  draft: MediaProject;
  generated: MediaProject | null;
  generatedAt: string | null;
  step: number;
}
export const parseWorkspace = (input: unknown) => workspaceSchema.parse(input) as MediaWorkspace;

export const newId = () => typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
export const photoDataBytes = (project: MediaProject) => project.experiences.reduce((bytes, experience) => bytes + experience.photos.reduce((n, photo) => n + photo.src.length, 0), project.profile.cover?.src.length ?? 0);
export const defaultSettings: MediaSettings = {
  theme: "midnight", typography: "editorial", motion: "immersive", pace: "quick",
  showSkills: true, showStory: true, showGallery: true,
};

export function emptyExperience(): MediaExperience {
  return { id: newId(), role: "", organization: "", location: "", startDate: "", endDate: "", current: false,
    summary: "", duties: "", highlights: "", skills: "", learning: "", photos: [] };
}
export function emptyProject(): MediaProject {
  return {
    version: 1,
    profile: { name: "", headline: "", email: "", location: "", availability: "", tagline: "", about: "", skills: "", website: "", linkedin: "", cover: null },
    experiences: [emptyExperience()], values: [], settings: { ...defaultSettings },
  };
}
export const emptyWorkspace = (): MediaWorkspace => ({ draft: emptyProject(), generated: null, generatedAt: null, step: 0 });

export const THEMES = [
  { id: "midnight" as const, name: "Midnight", description: "Warm gold on cinematic charcoal.", background: "#100e0d", foreground: "#f5eee5", accent: "#efbd69", muted: "#b8ada0", border: "#3a332b" },
  { id: "paper" as const, name: "Paper", description: "An airy, ink-on-paper portfolio.", background: "#f6f3ed", foreground: "#202b37", accent: "#275aa8", muted: "#5a6470", border: "#d5d8dd" },
  { id: "forest" as const, name: "Forest", description: "Deep green with a fresh lime accent.", background: "#0d1c19", foreground: "#edf4e6", accent: "#c0df8c", muted: "#a7b8ad", border: "#30443a" },
];
export const STYLES = [
  { id: "editorial" as const, name: "Editorial", description: "Expressive serif headlines, generous spacing.", font: '"Fraunces", Georgia, serif' },
  { id: "modern" as const, name: "Modern", description: "Confident sans-serif with crisp, rounded frames.", font: '"Inter", system-ui, sans-serif' },
  { id: "minimal" as const, name: "Minimal", description: "Quiet typography, square images, no film grain.", font: '"Inter", system-ui, sans-serif' },
];

export function themeStyle(settings: MediaSettings): CSSProperties {
  const themes = {
    midnight: { background: "24 10% 6%", foreground: "35 44% 93%", primary: "37 81% 67%", muted: "32 15% 67%", border: "32 15% 20%", card: "24 10% 9%" },
    paper: { background: "40 33% 95%", foreground: "211 27% 17%", primary: "216 62% 41%", muted: "213 11% 40%", border: "218 10% 85%", card: "40 25% 99%" },
    forest: { background: "168 37% 8%", foreground: "90 39% 93%", primary: "82 56% 71%", muted: "145 11% 69%", border: "150 17% 23%", card: "162 27% 12%" },
  };
  const t = themes[settings.theme];
  return {
    "--background": t.background, "--foreground": t.foreground, "--primary": t.primary,
    "--primary-foreground": settings.theme === "paper" ? "0 0% 100%" : t.background,
    "--muted-foreground": t.muted, "--border": t.border, "--input": t.border,
    "--card": t.card, "--card-foreground": t.foreground, "--accent": t.card,
    "--accent-foreground": t.foreground, "--ring": t.primary,
    "--font-display": STYLES.find((s) => s.id === settings.typography)!.font,
    "--gradient-warm": `linear-gradient(120deg, hsl(${t.primary}), hsl(${t.primary} / .85))`,
    colorScheme: settings.theme === "paper" ? "light" : "dark",
  } as CSSProperties;
}

export function splitItems(value: string): string[] {
  const seen = new Set<string>();
  return value.split(/[,\n]/).map((s) => s.trim()).filter((s) => {
    if (!s || seen.has(s.toLocaleLowerCase())) return false;
    seen.add(s.toLocaleLowerCase());
    return true;
  });
}
export const lines = (value: string) => value.split("\n").map((s) => s.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
export const validMonth = (value: string) => /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value);
export function monthLabel(value: string) {
  if (!validMonth(value)) return "Date not set";
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}
export const periodLabel = (e: MediaExperience) => `${monthLabel(e.startDate)} — ${e.current ? "Present" : monthLabel(e.endDate)}`;

export function safeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".") && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}
export interface ProjectIssue { step: number; field: string; message: string }
export function projectIssues(project: MediaProject): ProjectIssue[] {
  const result: ProjectIssue[] = [];
  const issue = (step: number, field: string, message: string) => result.push({ step, field, message });
  const p = project.profile;
  if (photoDataBytes(project) > MAX_PHOTO_DATA_BYTES) issue(2, "cover-photo", "Remove some photos to keep optimized image data under 24 MB.");
  if (!p.name.trim()) issue(0, "profile-name", "Add your name.");
  if (!p.headline.trim()) issue(0, "profile-headline", "Add your professional headline.");
  if (!z.string().email().safeParse(p.email.trim()).success) issue(0, "profile-email", "Enter a valid contact email.");
  for (const field of ["website", "linkedin"] as const) {
    if (p[field].trim() && !safeWebsite(p[field])) issue(0, `profile-${field}`, `Use a valid http or https ${field} address.`);
  }
  if (!project.experiences.length) issue(1, "add-experience", "Add at least one experience.");
  project.experiences.forEach((e, i) => {
    const prefix = `Chapter ${i + 1}: `;
    if (!e.role.trim()) issue(1, `${e.id}-role`, prefix + "add a role.");
    if (!e.organization.trim()) issue(1, `${e.id}-organization`, prefix + "add an organization or project.");
    if (!validMonth(e.startDate)) issue(1, `${e.id}-startDate`, prefix + "choose a start month.");
    if (!e.current && !validMonth(e.endDate)) issue(1, `${e.id}-endDate`, prefix + "choose an end month or mark as current.");
    if (!e.current && validMonth(e.startDate) && validMonth(e.endDate) && e.endDate < e.startDate) issue(1, `${e.id}-endDate`, prefix + "end date cannot precede the start date.");
    if (!e.duties.trim()) issue(1, `${e.id}-duties`, prefix + "describe your duties.");
    if (!e.photos.length) issue(2, `photos-${e.id}`, prefix + "upload at least one photo.");
    e.photos.forEach((photo) => {
      if (!photo.alt.trim()) issue(2, `alt-${photo.id}`, prefix + "describe the photo for screen readers.");
    });
  });
  if (p.cover && !p.cover.alt.trim()) issue(2, `alt-${p.cover.id}`, "Describe your cover photo for screen readers.");
  project.values.forEach((v) => {
    if (!v.title.trim() || !v.text.trim()) issue(0, `value-${v.id}`, "Complete or remove the unfinished value.");
  });
  return result;
}

/** Generates structure only; never invents responsibilities, outcomes, or skill scores. */
export function toMediaCV(project: MediaProject): CVData {
  const p = project.profile;
  const skills = splitItems([p.skills, ...project.experiences.map((e) => e.skills)].join(","));
  const gallery = project.experiences.flatMap((e) => e.photos);
  return {
    name: p.name.trim(), role: p.headline.trim(), tagline: p.tagline.trim(),
    location: p.location.trim(), availability: p.availability.trim(), focus: skills.slice(0, 3).join(" · "),
    stats: [
      { label: "Experiences", value: String(project.experiences.length) },
      { label: "Skills", value: String(skills.length) },
      { label: "Story frames", value: String(gallery.length + (p.cover ? 1 : 0)) },
    ],
    heroPhoto: p.cover ?? gallery[0] ?? { src: "", alt: "" },
    manifesto: p.about.trim(),
    experience: project.experiences.map((e, i) => ({
      id: e.id, chapter: `Chapter ${String(i + 1).padStart(2, "0")}`, role: e.role.trim(), org: e.organization.trim(),
      period: periodLabel(e), location: e.location.trim(), summary: e.summary.trim() || lines(e.duties)[0] || "",
      duties: e.duties.trim(), learning: e.learning.trim(), highlights: lines(e.highlights), skills: splitItems(e.skills), photos: e.photos,
    })),
    skillGroups: skills.length ? [{ title: "Skills from my experience", items: skills.map((name) => ({ name })) }] : [],
    values: project.values.map(({ title, text }) => ({ title: title.trim(), text: text.trim() })),
    gallery,
    contact: { email: p.email.trim(), resumeHref: "", links: [
      { label: "Website", href: safeWebsite(p.website) }, { label: "LinkedIn", href: safeWebsite(p.linkedin) },
    ].filter((link) => link.href) },
  };
}

/** Import is explicit: the original profile and its storage are left untouched. */
export function fromProfile(profile: ProfileData): MediaProject {
  const project = emptyProject();
  project.profile = { ...project.profile, name: profile.personalInfo.fullName, email: profile.personalInfo.email,
    location: profile.personalInfo.location, about: profile.professionalSummary,
    website: profile.personalInfo.website ?? "", linkedin: profile.personalInfo.linkedin ?? "",
    skills: profile.skills.flatMap((g) => g.skills).join(", "), headline: profile.workExperience[0]?.title ?? "" };
  project.experiences = profile.workExperience.slice(0, MAX_EXPERIENCES).map((e) => ({
    ...emptyExperience(), role: e.title, organization: e.organization, location: e.location ?? "",
    startDate: e.startDate, endDate: e.endDate ?? "", current: !!e.isCurrent, duties: e.description ?? "",
  }));
  if (!project.experiences.length) project.experiences = [emptyExperience()];
  return project;
}
