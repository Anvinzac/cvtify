/**
 * Parse result preview and apply confirmation for QuickFillCard.
 *
 * Exports: QuickFillResultPreview
 * Depends on: framer-motion, lucide-react, parseQuickFill, quickFillConstants
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import type { QuickFillResult } from "@/features/cv/lib/parseQuickFill";
import type { CvPersonalInfo } from "@/features/cv/types";
import { QUICK_FILL_FIELD_LABELS } from "@/features/cv/lib/quickFillConstants";

interface QuickFillResultPreviewProps {
  result: QuickFillResult | null;
  applied: (keyof CvPersonalInfo)[] | null;
  onClear: () => void;
  onApply: () => void;
  onDismissApplied: () => void;
}

/** Detected-field list, apply actions, and post-apply toast. */
export function QuickFillResultPreview({
  result,
  applied,
  onClear,
  onApply,
  onDismissApplied,
}: QuickFillResultPreviewProps) {
  return (
    <>
      <AnimatePresence>
        {result && result.filled.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-3"
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-primary">
              Detected {result.filled.length}{" "}
              {result.filled.length === 1 ? "field" : "fields"}
            </p>
            <div className="space-y-1.5">
              {result.filled.map((field) => {
                const val = result[field];
                if (typeof val !== "string") return null;
                return (
                  <div key={field} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="font-bold text-foreground">
                      {QUICK_FILL_FIELD_LABELS[field]}
                    </span>
                    <span className="truncate text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onClear}
                className="flex-1 rounded-xl border border-border py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-muted/60"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={onApply}
                className="flex-[2] rounded-xl gradient-warm py-2 text-[11px] font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
              >
                Fill {result.filled.length}{" "}
                {result.filled.length === 1 ? "field" : "fields"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {applied.length} {applied.length === 1 ? "field" : "fields"} added to your CV
            <button
              type="button"
              onClick={onDismissApplied}
              className="ml-auto text-emerald-700/70 hover:text-emerald-900"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
