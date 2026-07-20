/**
 * Skills frequency section on the report card.
 *
 * Exports: ReportSkillsSection
 */

import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import CountUp from "@/shared/components/fx/CountUp";

interface ReportSkillsSectionProps {
  topSkills: [string, number][];
  activityCount: number;
}

/** Renders top skills with animated progress bars. */
export function ReportSkillsSection({ topSkills, activityCount }: ReportSkillsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">Skills you're building</h2>
          <p className="text-[11px] text-muted-foreground">What you're getting good at</p>
        </div>
      </div>
      <div className="space-y-3">
        {topSkills.map(([skill, count], i) => {
          const pct = Math.min((count / activityCount) * 100, 100);
          const isTop = i === 0;
          return (
            <motion.div
              key={skill}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              whileHover={{ x: 2 }}
              className="group/skill"
            >
              <div className="flex justify-between text-xs mb-1.5">
                <span className={`font-semibold flex items-center gap-1.5 ${isTop ? "text-primary" : "text-foreground"}`}>
                  {isTop && <Sparkles className="w-3 h-3 text-primary" />}
                  {skill}
                </span>
                <span className="text-muted-foreground font-medium">
                  <CountUp to={count} duration={900} delay={300 + i * 80} />x
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 0.7, 0.35, 1] }}
                  className="h-full gradient-warm rounded-full relative overflow-hidden"
                >
                  {isTop && (
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
