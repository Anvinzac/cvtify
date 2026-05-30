import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, Check } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthYearFieldProps {
  label: string;
  /** Value in "YYYY-MM" form (or "YYYY" if month not picked). Empty string when unset. */
  value: string;
  onChange: (v: string) => void;
  /** Range of years to show. Newest first. Default: 25 years back through this year. */
  yearsBack?: number;
  /** Block months beyond today (only meaningful for the current year). */
  blockFuture?: boolean;
  /** "month" (default) renders a YYYY-MM picker. "year" renders year-only. */
  precision?: "month" | "year";
  required?: boolean;
  guide?: string;
}

function parseValue(value: string): { year: number | null; month: number | null } {
  if (!value) return { year: null, month: null };
  const [yStr, mStr] = value.split("-");
  const y = Number(yStr);
  const m = mStr ? Number(mStr) - 1 : NaN;
  return {
    year: Number.isFinite(y) ? y : null,
    month: Number.isFinite(m) ? m : null,
  };
}

function formatLabel(year: number | null, month: number | null): string {
  if (year === null) return "";
  if (month === null) return String(year);
  return `${MONTHS[month]} ${year}`;
}

/**
 * Compact dropdown month/year picker. Replaces raw "YYYY-MM" text inputs
 * with a friendly tap-to-pick experience. Reuses the same conventions as
 * the activity walkthrough's date picker.
 */
export function MonthYearField({
  label,
  value,
  onChange,
  yearsBack = 25,
  blockFuture = true,
  precision = "month",
  required,
  guide,
}: MonthYearFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { year, month } = useMemo(() => parseValue(value), [value]);
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const years = useMemo(
    () => Array.from({ length: yearsBack + 1 }, (_, i) => currentYear - i),
    [currentYear, yearsBack]
  );

  const [expandedYear, setExpandedYear] = useState<number | null>(year);

  useEffect(() => {
    if (open) setExpandedYear(year);
  }, [open, year]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const display = formatLabel(year, month);

  return (
    <div ref={wrapRef} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.99 }}
        animate={open ? "focus" : "rest"}
        variants={{
          rest: { boxShadow: "0 0 0 0 hsl(32 95% 52% / 0)" },
          focus: { boxShadow: "0 6px 22px -10px hsl(32 95% 52% / 0.45)" },
        }}
        className={`relative flex w-full items-center gap-2.5 rounded-2xl border bg-white/85 px-3.5 py-3 text-left backdrop-blur-sm transition-colors ${
          open ? "border-primary/60" : "border-border"
        }`}
      >
        <motion.span
          animate={open ? { scale: 1.08, rotate: -4 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            open || value
              ? "bg-accent text-primary shadow-sm"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
              value || open ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {label}
            {required && <span className="ml-0.5">*</span>}
          </p>
          <p
            className={`text-sm font-semibold ${
              display ? "text-foreground" : "text-muted-foreground/50"
            }`}
          >
            {display || (precision === "year" ? "Pick a year" : "Pick a month")}
          </p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 0.7, 0.35, 1] }}
            className="absolute left-0 right-0 top-full z-30 mt-1.5 origin-top overflow-hidden rounded-2xl border border-border bg-white shadow-elevated"
          >
            <div className="max-h-[280px] overflow-y-auto divide-y divide-border/60">
              {years.map((y) => {
                const expanded = expandedYear === y;
                const maxMonth = blockFuture && y === currentYear ? currentMonth : 11;
                const isSelectedYear = y === year;
                return (
                  <div key={y}>
                    <button
                      type="button"
                      onClick={() => {
                        if (precision === "year") {
                          onChange(String(y));
                          setOpen(false);
                          return;
                        }
                        setExpandedYear(expanded ? null : y);
                      }}
                      className={`flex w-full items-center justify-between px-3.5 py-2.5 transition-colors ${
                        expanded ? "bg-accent/40" : "hover:bg-accent/20"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          expanded || isSelectedYear ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {y}
                      </span>
                      <span className="flex items-center gap-2">
                        {y === currentYear && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            This year
                          </span>
                        )}
                        {isSelectedYear && precision === "month" && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                        {precision === "month" && (
                          <motion.span
                            animate={{ rotate: expanded ? 180 : 0 }}
                            transition={{ duration: 0.18 }}
                            className="text-muted-foreground"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                      </span>
                    </button>
                    {precision === "month" && (
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 0.7, 0.35, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-4 gap-1.5 px-3 pb-3 pt-1">
                              {MONTHS.map((m, i) => {
                                const disabled = i > maxMonth;
                                const selected = isSelectedYear && month === i;
                                return (
                                  <button
                                    key={m}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                      onChange(
                                        `${y}-${String(i + 1).padStart(2, "0")}`
                                      );
                                      setOpen(false);
                                    }}
                                    className={`rounded-lg border py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                                      disabled
                                        ? "cursor-not-allowed border-transparent bg-muted/30 text-muted-foreground/40"
                                        : selected
                                        ? "gradient-warm border-transparent text-primary-foreground shadow-sm"
                                        : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-accent/30"
                                    }`}
                                  >
                                    {m}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="block w-full border-t border-border bg-background/60 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
              >
                Clear date
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {guide && !open && (
        <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-muted-foreground">
          {guide}
        </p>
      )}
    </div>
  );
}
