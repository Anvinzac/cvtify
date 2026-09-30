/* ------------------------------------------------------------------
 * DEMO PROJECT — turns the sample persona in cvData.ts ("Alex Rivera")
 * into a full MediaProject so first-time visitors can see the live CV
 * fully populated: every chapter, photos, values, and a clean checklist.
 * Photos are picsum placeholder URLs (see photoSchema's https allowance).
 * ------------------------------------------------------------------ */
import { cv } from "./cvData";
import {
  emptyExperience, emptyProject, newId, type MediaExperience, type MediaPhoto, type MediaProject,
} from "./mediaProject";

const toPhoto = (src: string, alt: string, caption = "", width = 1600, height = 1000): MediaPhoto => ({
  id: newId(), name: "", src, alt, caption, position: "center", width, height,
});

/** "2016 — 2017" -> { startDate: "2016-01", endDate: "2017-12", current: false } */
function parsePeriod(period: string) {
  const years = period.match(/\d{4}/g) ?? [];
  const current = /present|now/i.test(period) || years.length < 2;
  return {
    startDate: years[0] ? `${years[0]}-01` : "",
    endDate: !current && years[1] ? `${years[1]}-12` : "",
    current,
  };
}

export function demoProject(): MediaProject {
  const project = emptyProject();
  project.profile = {
    ...project.profile,
    name: cv.name,
    headline: cv.role,
    email: cv.contact.email,
    location: cv.location,
    availability: cv.availability,
    tagline: cv.tagline,
    about: cv.manifesto,
    skills: cv.skillGroups.flatMap((group) => group.items.map((item) => item.name)).join(", "),
    website: cv.contact.links.find((link) => link.label === "Portfolio")?.href ?? "",
    linkedin: cv.contact.links.find((link) => link.label === "LinkedIn")?.href ?? "",
    cover: toPhoto(cv.heroPhoto.src, cv.heroPhoto.alt, "", 1800, 1200),
  };
  project.experiences = cv.experience.map((stage): MediaExperience => ({
    ...emptyExperience(),
    role: stage.role,
    organization: stage.org,
    location: stage.location,
    ...parsePeriod(stage.period),
    summary: stage.summary,
    duties: [stage.summary, ...stage.highlights.map((h) => `- ${h}`)].join("\n"),
    highlights: stage.highlights.join("\n"),
    skills: stage.skills.join(", "),
    learning: stage.learning ?? "",
    photos: stage.photos.map((photo) => toPhoto(photo.src, photo.alt, photo.caption ?? "")),
  }));
  project.values = cv.values.map(({ title, text }) => ({ id: newId(), title, text }));
  return project;
}

/**
 * Per-field demo originals, derived from the SAME builder that seeds the draft so
 * the strings match exactly. The live editor uses these to recognise untouched
 * example content and offer tap-to-wipe / revert / clear behaviour.
 */
export interface DemoSamples {
  profile: Partial<Record<"name" | "headline" | "tagline" | "location" | "availability" | "about" | "skills" | "email" | "website" | "linkedin", string>>;
  experiences: Array<Partial<Record<"role" | "organization" | "location" | "summary" | "duties" | "highlights" | "skills" | "learning", string>>>;
  values: Array<{ title: string; text: string }>;
}

export function demoSamples(): DemoSamples {
  const p = demoProject();
  return {
    profile: {
      name: p.profile.name, headline: p.profile.headline, tagline: p.profile.tagline, location: p.profile.location,
      availability: p.profile.availability, about: p.profile.about, skills: p.profile.skills, email: p.profile.email, website: p.profile.website, linkedin: p.profile.linkedin,
    },
    experiences: p.experiences.map((e) => ({
      role: e.role, organization: e.organization, location: e.location, summary: e.summary,
      duties: e.duties, highlights: e.highlights, skills: e.skills, learning: e.learning,
    })),
    values: p.values.map((v) => ({ title: v.title, text: v.text })),
  };
}
