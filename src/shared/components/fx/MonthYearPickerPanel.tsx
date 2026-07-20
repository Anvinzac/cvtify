/**
 * Dropdown year/month grid for MonthYearField.
 *
 * Exports: MonthYearPickerPanel
 * Depends on: framer-motion, lucide-react, monthYearFieldUtils
 */

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { MONTH_YEAR_MONTHS } from "@/shared/components/fx/lib/monthYearFieldUtils";

interface MonthYearPickerPanelProps {
  years: number[];
  currentYear: number;
  currentMonth: number;
  year: number | null;
  month: number | null;
  expandedYear: number | null;
  blockFuture: boolean;
  precision: "month" | "year";
  value: string;
  onChange: (v: string) => void;
  onExpandedYearChange: (y: number | null) => void;
  onClose: () => void;
}

/** Expandable year list with optional month grid. */
export function MonthYearPickerPanel({
  years,
  currentYear,
  currentMonth,
  year,
  month,
  expandedYear,
  blockFuture,
  precision,
  value,
  onChange,
  onExpandedYearChange,
  onClose,
}: MonthYearPickerPanelProps) {
  return (
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
                    onClose();
                    return;
                  }
                  onExpandedYearChange(expanded ? null : y);
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
                        {MONTH_YEAR_MONTHS.map((m, i) => {
                          const disabled = i > maxMonth;
                          const selected = isSelectedYear && month === i;
                          return (
                            <button
                              key={m}
                              type="button"
                              disabled={disabled}
                              onClick={() => {
                                onChange(`${y}-${String(i + 1).padStart(2, "0")}`);
                                onClose();
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
            onClose();
          }}
          className="block w-full border-t border-border bg-background/60 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
        >
          Clear date
        </button>
      )}
    </motion.div>
  );
}
