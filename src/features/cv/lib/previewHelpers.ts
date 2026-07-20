/**
 * CV preview print layout helpers.
 *
 * Exports: formatYear, descriptionBullets
 * Depends on: @/features/cv/types
 */

import type { CvEntry } from "@/features/cv/types";

/**
 * Extracts the year from a CV entry's start date for certification display.
 * @param entry - Entry with YYYY-MM startDate.
 */
export function formatYear(entry: CvEntry): string {
  return entry.startDate.split("-")[0] ?? "";
}

/**
 * Splits a description into bullet lines for print layout.
 * @param text - Raw description with newlines or bullet markers.
 */
export function descriptionBullets(text: string): string[] {
  return text
    .split(/\n|•|-/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
