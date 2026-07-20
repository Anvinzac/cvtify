/**
 * Pure helpers for CV builder page state derivation and auto-build.
 *
 * Exports: computeHasAnyData, computeCompletedSections, buildAutoBuildUpdate
 * Depends on: @/features/cv/types, activityAutofill
 */

import type { CvData, CvPersonalInfo } from "@/features/cv/types";
import type { Activity } from "@/lib/data";
import {
  activityToCvEntry,
  deriveSkillGroupsFromActivities,
  draftSummary,
} from "@/features/cv/lib/activityAutofill";

/** Whether the CV has any meaningful content yet. */
export function computeHasAnyData(cv: CvData): boolean {
  return !!(
    cv.personalInfo.fullName ||
    cv.professionalSummary ||
    cv.workExperience.length > 0 ||
    cv.education.length > 0 ||
    cv.skills.some((g) => g.skills.length > 0) ||
    cv.certifications.length > 0 ||
    cv.languages.length > 0
  );
}

/** Count of completed CV sections (identity, story, experience, skills, education). */
export function computeCompletedSections(cv: CvData): number {
  return [
    !!cv.personalInfo.fullName,
    cv.professionalSummary.trim().length >= 80,
    cv.workExperience.length > 0,
    cv.skills.some((g) => g.skills.length > 0),
    cv.education.length > 0,
  ].filter(Boolean).length;
}

/** Merge paste + timeline into an updated CV snapshot (pure, no side effects). */
export function buildAutoBuildUpdate(
  cv: CvData,
  activities: Activity[],
  paste: Partial<CvPersonalInfo>
): CvData {
  const personalInfo: CvPersonalInfo = { ...cv.personalInfo };
  for (const [k, v] of Object.entries(paste)) {
    const key = k as keyof CvPersonalInfo;
    if (typeof v !== "string" || !v.trim()) continue;
    if (!personalInfo[key] || personalInfo[key]?.trim() === "") {
      personalInfo[key] = v;
    }
  }

  const existingTitles = new Set(
    cv.workExperience.map((e) => e.title.trim().toLowerCase())
  );
  const newEntries = activities
    .filter((a) => !existingTitles.has(a.name.trim().toLowerCase()))
    .map(activityToCvEntry);

  const newSkills = deriveSkillGroupsFromActivities(activities, cv.skills);

  const summary = cv.professionalSummary.trim()
    ? cv.professionalSummary
    : draftSummary(activities, {
        fullName: personalInfo.fullName,
        location: personalInfo.location,
      });

  return {
    ...cv,
    personalInfo,
    workExperience: [...cv.workExperience, ...newEntries],
    skills: newSkills,
    professionalSummary: summary,
  };
}
