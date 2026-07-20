/**
 * Legacy re-export shim — prefer @/features/cv and @/shared/api-client imports.
 */

export type {
  CvEntry,
  CvPersonalInfo,
  CvData,
  SkillCategory,
  SkillGroup,
} from "@/features/cv/types";

export {
  SKILL_CATEGORIES,
  getCategoryById,
  COMMON_SKILLS,
} from "@/features/cv/lib/skillCategories";

export type { DraftData } from "@/shared/api-client/draftStorage";
export { loadDraft, saveDraft, clearDraft } from "@/shared/api-client/draftStorage";
