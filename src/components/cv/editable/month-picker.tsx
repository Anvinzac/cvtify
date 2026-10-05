import { useState } from "react";

/**
 * A two-step month picker: a 3×4 grid of years, then a 3×4 grid of months.
 *
 * It replaces `<input type="month">`, whose widget differs on every platform
 * and whose text field invites typing a date rather than picking one. Twelve
 * years and twelve months both fit the same 3×4 frame, so the two steps are
 * the same shape and the second reads as a zoom into the cell you tapped
 * rather than as a different screen.
 *
 * Values are "YYYY-MM", the format monthLabel() renders and the project
 * schema stores.
 */

/** Short Vietnamese month labels — "Th1" … "Th12". */
const MONTHS = Array.from({ length: 12 }, (_, i) => `Th${i + 1}`);

/** One page of the year grid: 3 columns × 4 rows. */
const PAGE = 12;

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseMonthValue(value: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec((value ?? "").trim());
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
}

/** Pages are anchored to fixed 12-year blocks so ‹ / › always step the same way. */
const pageStartFor = (year: number) => Math.floor(year / PAGE) * PAGE;

interface MonthPickerProps {
  /** Current value, "YYYY-MM" or "" when unset. */
  value: string;
  onPick: (value: string) => void;
  /** Nothing before this month is selectable — the start of a range. */
  min?: string;
  /** Labelled by the dialog around it. */
  ariaLabel?: string;
}

export function MonthPicker({ value, onPick, min, ariaLabel }: MonthPickerProps) {
  const selected = parseMonthValue(value);
  const floor = parseMonthValue(min ?? "");
  const thisYear = new Date().getFullYear();
  const anchorYear = selected?.year ?? floor?.year ?? thisYear;

  // Always opens on the years. Picking a year is how you correct a year, and
  // starting on the months would hide the step that needs correcting most.
  const [step, setStep] = useState<"year" | "month">("year");
  const [year, setYear] = useState(anchorYear);
  const [page, setPage] = useState(() => pageStartFor(anchorYear));

  const years = Array.from({ length: PAGE }, (_, i) => page + i);
  const yearDisabled = (y: number) => !!floor && y < floor.year;
  const monthDisabled = (m: number) => !!floor && year === floor.year && m < floor.month;

  if (step === "year") {
    return (
      <div className="cv-cal" role="group" aria-label={ariaLabel}>
        <div className="cv-cal-head">
          <button
            type="button" className="cv-cal-nav" aria-label={`${PAGE} năm trước`}
            onClick={() => setPage((p) => p - PAGE)}
          >
            ‹
          </button>
          <span className="cv-cal-title" aria-live="polite">
            {page} – {page + PAGE - 1}
          </span>
          <button
            type="button" className="cv-cal-nav" aria-label={`${PAGE} năm sau`}
            onClick={() => setPage((p) => p + PAGE)}
          >
            ›
          </button>
        </div>
        <div className="cv-cal-grid" data-step="year" key={`y${page}`}>
          {years.map((y) => (
            <button
              type="button" key={y} className="cv-cal-cell"
              aria-pressed={selected?.year === y}
              disabled={yearDisabled(y)}
              data-now={y === thisYear ? "true" : undefined}
              onClick={() => { setYear(y); setStep("month"); }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cv-cal" role="group" aria-label={ariaLabel}>
      <div className="cv-cal-head">
        {/* The year doubles as the way back to the year grid. */}
        <button
          type="button" className="cv-cal-back" aria-label={`Năm ${year} — chọn lại năm`}
          onClick={() => { setPage(pageStartFor(year)); setStep("year"); }}
        >
          <span aria-hidden="true">‹</span> {year}
        </button>
      </div>
      <div className="cv-cal-grid" data-step="month" key={`m${year}`}>
        {MONTHS.map((label, i) => {
          const month = i + 1;
          return (
            <button
              type="button" key={label} className="cv-cal-cell"
              aria-label={`Tháng ${month} năm ${year}`}
              aria-pressed={selected?.year === year && selected?.month === month}
              disabled={monthDisabled(month)}
              onClick={() => onPick(`${year}-${pad2(month)}`)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MonthPicker;
