/**
 * Values priority section on the report card.
 *
 * Exports: ReportValuesSection
 */

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import CountUp from "@/shared/components/fx/CountUp";

interface ReportValuesSectionProps {
  topValues: [string, number][];
}

/** Renders top values as animated pill badges. */
export function ReportValuesSection({ topValues }: ReportValuesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
          <Heart className="w-4 h-4 text-secondary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">Values you prioritize</h2>
          <p className="text-[11px] text-muted-foreground">What matters most to you</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {topValues.map(([value, count], i) => (
          <motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 300, damping: 22 }}
            whileHover={{ y: -2, scale: 1.04 }}
            className="px-3.5 py-2 rounded-full text-xs font-semibold gradient-teal text-secondary-foreground shadow-sm cursor-default"
          >
            {value}
            <span className="ml-1 opacity-70">
              <CountUp to={count} duration={700} delay={400 + i * 60} />
            </span>
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
