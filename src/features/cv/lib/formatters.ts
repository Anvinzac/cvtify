/**
 * CV display and validation formatters.
 *
 * Exports: formatDateRange, emailValid
 * Depends on: @/features/cv/types (CvEntry)
 */

import type { CvEntry } from "@/features/cv/types";

/**
 * Formats a CV entry's start/end dates for list display.
 * @param entry - Work, education, or certification entry with date fields.
 * @returns Human-readable range, e.g. "Jan 2024 – Present".
 */
export function formatDateRange(entry: CvEntry): string {
  const fmt = (d: string) => {
    const [y, m] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1] ?? ""} ${y}`;
  };
  const start = fmt(entry.startDate);
  if (entry.isCurrent) return `${start} – Present`;
  if (entry.endDate) return `${start} – ${fmt(entry.endDate)}`;
  return start;
}

/**
 * Lightweight email shape check for inline form validation.
 * @param email - Raw email input.
 * @returns True when the value looks like a valid email address.
 */
export function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
