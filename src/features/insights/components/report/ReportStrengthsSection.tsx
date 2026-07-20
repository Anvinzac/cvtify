/**
 * Task-type strengths section on the report card.
 *
 * Exports: ReportStrengthsSection
 */

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface ReportStrengthsSectionProps {
  topTasks: [string, number][];
}

/** Lists the most common task types across activities. */
export function ReportStrengthsSection({ topTasks }: ReportStrengthsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
          <Star className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">Your strengths</h2>
          <p className="text-[11px] text-muted-foreground">Types of work you've done</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {topTasks.map(([task]) => (
          <div key={task} className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full gradient-warm shrink-0" />
            <span className="text-sm text-foreground font-medium">{task}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
