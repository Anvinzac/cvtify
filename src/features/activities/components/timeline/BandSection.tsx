/**
 * Timeline band section — sticky month label and activity cards.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarClock } from "lucide-react";
import type { Activity } from "@/features/activities/types";
import type { TimelineBand } from "./lib/grouping";
import { TimelineCard } from "./TimelineCard";

interface BandSectionProps {
  band: TimelineBand;
  isFirst: boolean;
  onEdit?: (a: Activity) => void;
  onRemove?: (id: string) => void;
}

/** One month/year band with sticky label and nested cards. */
export function BandSection({ band, isFirst, onEdit, onRemove }: BandSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const labelScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.06, 0.94]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  return (
    <div ref={sectionRef} className="relative mb-6">
      <div className="sticky top-2 z-10 -ml-14 mb-3 flex items-center gap-3 pointer-events-none">
        <motion.div
          style={{ scale: labelScale, opacity: labelOpacity }}
          className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/85 backdrop-blur-xl border border-border/60 shadow-card pointer-events-auto"
        >
          <CalendarClock className="w-3 h-3 text-primary" />
          <span className="text-[11px] font-bold text-foreground tracking-wide">
            {band.monthLabel}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold">
            · {band.items.length}
          </span>
        </motion.div>
      </div>

      <div className="space-y-3">
        {band.items.map((act, i) => (
          <TimelineCard
            key={act.id}
            activity={act}
            index={i}
            isLatest={isFirst && i === 0}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
