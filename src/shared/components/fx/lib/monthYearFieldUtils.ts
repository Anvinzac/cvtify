/**
 * Parse/format helpers for MonthYearField values (YYYY-MM strings).
 *
 * Exports: MONTH_YEAR_MONTHS, parseMonthYearValue, formatMonthYearLabel
 */

export const MONTH_YEAR_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function parseMonthYearValue(value: string): {
  year: number | null;
  month: number | null;
} {
  if (!value) return { year: null, month: null };
  const [yStr, mStr] = value.split("-");
  const y = Number(yStr);
  const m = mStr ? Number(mStr) - 1 : NaN;
  return {
    year: Number.isFinite(y) ? y : null,
    month: Number.isFinite(m) ? m : null,
  };
}

export function formatMonthYearLabel(
  year: number | null,
  month: number | null
): string {
  if (year === null) return "";
  if (month === null) return String(year);
  return `${MONTH_YEAR_MONTHS[month]} ${year}`;
}
