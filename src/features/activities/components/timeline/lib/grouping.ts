/**
 * Timeline grouping helpers — sort activities into month/year bands.
 */

import type { Activity } from "@/features/activities/types";
import { MONTHS } from "../constants";

/** A chronological band of activities sharing a year/month label. */
export interface TimelineBand {
  key: string;
  year: number;
  /** Month index 0-11, or null for "year only" bands. */
  month: number | null;
  monthLabel: string;
  items: Activity[];
}

/** Resolve the display/sort date for an activity. */
export function getActivityDate(act: Activity): Date {
  if (typeof act.occurredAt === "number") return new Date(act.occurredAt);
  const ts = Number(act.id);
  return Number.isFinite(ts) ? new Date(ts) : new Date();
}

/** Group activities into descending month/year bands for the timeline. */
export function groupByMonth(activities: Activity[]): TimelineBand[] {
  const sorted = [...activities].sort(
    (a, b) => getActivityDate(b).getTime() - getActivityDate(a).getTime()
  );
  const map = new Map<string, TimelineBand>();
  for (const act of sorted) {
    const d = getActivityDate(act);
    const y = d.getFullYear();
    const yearOnly = act.datePrecision === "year";
    const key = yearOnly ? `year-${y}` : `${y}-${d.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        year: y,
        month: yearOnly ? null : d.getMonth(),
        monthLabel: yearOnly ? `Sometime in ${y}` : `${MONTHS[d.getMonth()]} ${y}`,
        items: [],
      });
    }
    map.get(key)!.items.push(act);
  }
  return Array.from(map.values());
}
