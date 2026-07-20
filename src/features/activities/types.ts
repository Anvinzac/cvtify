/**
 * Activity feature — domain types for categories and user experiences.
 */

import type { LucideIcon } from "lucide-react";

/** A selectable activity category shown on the grid and walkthrough header. */
export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  emoji: string;
  description: string;
  examples: string[];
  color: string;
}

/** A captured user experience stored in app state and shown on the timeline. */
export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  groupSize: string;
  duration: string;
  taskTypes: string[];
  skills: string[];
  values: string[];
  personalNotes: string;
  /** Unix timestamp (ms) of when the activity took place. Optional — falls back to id. */
  occurredAt?: number;
  /**
   * How precise the occurredAt date is. 'month' is the default when set via
   * the month picker. 'year' means the user picked a year but not a month.
   * Treated as 'month' when undefined.
   */
  datePrecision?: "year" | "month";
}
