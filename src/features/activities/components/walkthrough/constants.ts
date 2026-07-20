/**
 * Walkthrough step metadata and date-picker constants.
 */

export const STEPS = [
  { label: "Name", icon: "📝" },
  { label: "Team", icon: "👥" },
  { label: "Duration", icon: "⏱" },
  { label: "When", icon: "📅" },
  { label: "Tasks", icon: "🔧" },
  { label: "Discovery", icon: "✨" },
];

const NOW = new Date();

/** Current calendar year for the when-step picker. */
export const CURRENT_YEAR = NOW.getFullYear();

/** Current month index (0–11) for disabling future months in the current year. */
export const CURRENT_MONTH = NOW.getMonth();

/** 20 years back, newest first. Covers school years through present. */
export const PICKER_YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

/** Short month labels for the when-step grid. */
export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
