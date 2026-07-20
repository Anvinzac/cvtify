/**
 * Walkthrough step 3 — optional year/month date picker.
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
  MONTH_LABELS,
  PICKER_YEARS,
} from "./constants";
import { StepLayout } from "./StepLayout";

interface StepWhenProps {
  whenYear: number | null;
  whenMonth: number | null;
  onToggleYear: (year: number, expanded: boolean, maxMonth: number) => void;
  onSelectMonth: (year: number, month: number) => void;
  onSkipOrConfirm: () => void;
}

/** Expandable year list with optional month grid. */
export function StepWhen({
  whenYear,
  whenMonth,
  onToggleYear,
  onSelectMonth,
  onSkipOrConfirm,
}: StepWhenProps) {
  return (
    <StepLayout
      title="When did this happen?"
      subtitle="Tap a year to pick a month — optional"
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
        <div className="max-h-[58vh] overflow-y-auto divide-y divide-border/60">
          {PICKER_YEARS.map((y) => {
            const expanded = whenYear === y;
            const maxMonth = y === CURRENT_YEAR ? CURRENT_MONTH : 11;
            return (
              <div key={y}>
                <button
                  onClick={() => onToggleYear(y, expanded, maxMonth)}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    expanded ? "bg-accent/40" : "hover:bg-accent/20"
                  }`}
                >
                  <span
                    className={`text-base font-bold tracking-tight ${
                      expanded ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {y}
                  </span>
                  <span className="flex items-center gap-2">
                    {y === CURRENT_YEAR && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        This year
                      </span>
                    )}
                    <motion.span
                      animate={{ rotate: expanded ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="text-muted-foreground"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 0.7, 0.35, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-4 gap-1.5 px-3 pb-3 pt-1">
                        {MONTH_LABELS.map((m, i) => {
                          const disabled = i > maxMonth;
                          const selected = whenMonth === i;
                          return (
                            <button
                              key={m}
                              disabled={disabled}
                              onClick={() => onSelectMonth(y, i)}
                              className={`py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                disabled
                                  ? "bg-muted/30 text-muted-foreground/40 border-transparent cursor-not-allowed"
                                  : selected
                                  ? "gradient-warm text-primary-foreground border-transparent shadow-sm"
                                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent/30"
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
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onSkipOrConfirm}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
      >
        {whenYear !== null ? `Just "${whenYear}" — skip month` : "Skip — I'm not sure"}
      </button>
    </StepLayout>
  );
}
