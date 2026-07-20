/**
 * Legacy re-export shim — prefer @/features/activities and @/features/insights imports.
 */

export type { Category, Activity } from "@/features/activities/types";
export type { DreamJob } from "@/features/insights/types";

export {
  CATEGORIES,
  GROUP_SIZES,
  DURATION_OPTIONS,
  TASK_TYPES,
  SKILLS_OPTIONS,
  VALUES_OPTIONS,
} from "@/features/activities/lib/catalog";

export {
  SAMPLE_JOBS,
  SAMPLE_EVENTS,
  HOBBY_OPTIONS,
} from "@/features/insights/lib/catalog";
