/**
 * Date formatting helpers for activity import UI.
 *
 * Exports: ACTIVITY_IMPORT_MONTHS, activityWhenLabel
 * Depends on: @/lib/data
 */

import type { Activity } from "@/lib/data";

export const ACTIVITY_IMPORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Human-readable when-label for an activity's occurred-at date. */
export function activityWhenLabel(act: Activity): string {
  if (typeof act.occurredAt === "number") {
    const d = new Date(act.occurredAt);
    if (act.datePrecision === "year") return String(d.getFullYear());
    return `${ACTIVITY_IMPORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return "Date unknown";
}
