/**
 * Skills and task-type tag sections for TimelineCard.
 *
 * Exports: TimelineCardTags
 * Depends on: framer-motion, lucide-react
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TimelineCardTagsProps {
  skills: string[];
  taskTypes: string[];
  inView: boolean;
  index: number;
  colors: { soft: string; text: string };
}

/** Skills-built and strengths-discovered chip rows. */
export function TimelineCardTags({
  skills,
  taskTypes,
  inView,
  index,
  colors,
}: TimelineCardTagsProps) {
  return (
    <>
      {skills.length > 0 && (
        <div className="mb-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            Skills built
          </p>
          <div className="flex flex-wrap gap-1">
            {skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, y: 4 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.06 + 0.3 + i * 0.03, duration: 0.3 }}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/70 text-accent-foreground"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {taskTypes.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Strengths discovered
          </p>
          <div className="flex flex-wrap gap-1">
            {taskTypes.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, y: 4 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.06 + 0.45 + i * 0.03, duration: 0.3 }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.soft} ${colors.text}`}
              >
                {t}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
