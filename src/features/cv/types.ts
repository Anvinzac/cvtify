/**
 * CV feature — domain types for resume entries, personal info, and skill groups.
 *
 * Exports: CvEntry, CvPersonalInfo, CvData, SkillCategory, SkillGroup
 */

/** A single work, education, or certification line item on the CV. */
export interface CvEntry {
  id: string;
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

/** Contact and identity fields shown in the CV header. */
export interface CvPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

/** Full CV document shape persisted in the draft. */
export interface CvData {
  personalInfo: CvPersonalInfo;
  professionalSummary: string;
  workExperience: CvEntry[];
  education: CvEntry[];
  skills: SkillGroup[];
  certifications: CvEntry[];
  languages: string[];
}

/** Metadata for a browsable skill category in the skills editor. */
export interface SkillCategory {
  id: string;
  label: string;
  emoji: string;
  pillClasses: string;
  skills: string[];
}

/** A grouped set of skills under one category on the CV. */
export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}
