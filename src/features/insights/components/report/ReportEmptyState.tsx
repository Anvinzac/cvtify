/**
 * Empty state shown when the report card has no activities to analyze.
 *
 * Exports: ReportEmptyState
 */

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

interface ReportEmptyStateProps {
  onAddExperiences: () => void;
}

/** Prompts the user to add experiences before viewing the report. */
export function ReportEmptyState({ onAddExperiences }: ReportEmptyStateProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 gradient-soft">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-bold text-foreground mb-1">No experiences yet</p>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
          Add some experiences to generate your personalized report card
        </p>
        <button
          onClick={onAddExperiences}
          className="px-6 py-3 rounded-xl gradient-warm text-primary-foreground font-semibold text-sm shadow-elevated"
        >
          Add experiences
        </button>
      </motion.div>
    </div>
  );
}
