/**
 * Compact dropdown month/year picker for CV date fields.
 *
 * Exports: MonthYearField
 * Depends on: framer-motion, lucide-react, MonthYearPickerPanel, monthYearFieldUtils
 */

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";
import { MonthYearPickerPanel } from "@/shared/components/fx/MonthYearPickerPanel";
import {
  parseMonthYearValue,
  formatMonthYearLabel,
} from "@/shared/components/fx/lib/monthYearFieldUtils";

interface MonthYearFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  yearsBack?: number;
  blockFuture?: boolean;
  precision?: "month" | "year";
  required?: boolean;
  guide?: string;
}

/** Tap-to-pick month/year control replacing raw YYYY-MM text inputs. */
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
  const { year, month } = useMemo(() => parseMonthYearValue(value), [value]);
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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const display = formatMonthYearLabel(year, month);

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
          <MonthYearPickerPanel
            years={years}
            currentYear={currentYear}
            currentMonth={currentMonth}
            year={year}
            month={month}
            expandedYear={expandedYear}
            blockFuture={blockFuture}
            precision={precision}
            value={value}
            onChange={onChange}
            onExpandedYearChange={setExpandedYear}
            onClose={() => setOpen(false)}
          />
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
