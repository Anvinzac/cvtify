/**
 * Single activity card on the timeline with skills and task types.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Edit3, Users, Clock } from "lucide-react";
import { TimelineCardTags } from "./TimelineCardTags";
import { CATEGORIES } from "@/features/activities/lib/catalog";
import type { Activity } from "@/features/activities/types";
import {
  CATEGORY_COLORS,
  MONTHS,
  DURATION_WEIGHT,
  compactGroup,
  durationShort,
} from "./constants";
import { getActivityDate } from "./lib/grouping";

interface TimelineCardProps {
  activity: Activity;
  index: number;
  isLatest: boolean;
  onEdit?: (a: Activity) => void;
  onRemove?: (id: string) => void;
}

/** Scroll-animated card for one activity on the timeline. */
export function TimelineCard({
  activity,
  index,
  isLatest,
  onEdit,
  onRemove,
}: TimelineCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === activity.categoryId);
  const colors = CATEGORY_COLORS[activity.categoryId] ?? CATEGORY_COLORS.professional;
  const date = getActivityDate(activity);
  const dayLabel = activity.occurredAt
    ? activity.datePrecision === "year"
      ? `${date.getFullYear()}`
      : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    : `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  const spanWeight = DURATION_WEIGHT[activity.duration] ?? 0.4;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14, x: -8 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 0.7, 0.35, 1] }}
      className="relative"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.06 + 0.1, type: "spring", stiffness: 320, damping: 18 }}
        className="absolute -left-[34px] top-5 flex items-center justify-center"
      >
        <span
          className={`relative inline-flex w-3.5 h-3.5 rounded-full ${colors.bar} ring-4 ring-background shadow-sm`}
        >
          {isLatest && (
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          )}
        </span>
      </motion.div>

      <div aria-hidden className="absolute -left-[22px] top-[26px] h-px w-4 bg-border" />

      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
        <div className={`h-0.5 w-full ${colors.bar}`} />
        <div className="p-3.5">
          <div className="flex items-start gap-2.5 mb-2">
            <span className="text-lg leading-none mt-0.5">{cat?.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{activity.name}</h3>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {cat?.name} · {dayLabel}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(activity)}
                  className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                  aria-label="Edit activity"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(activity.id)}
                  className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
                  aria-label="Remove activity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {compactGroup(activity.groupSize)}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.duration}
            </span>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${spanWeight * 100}%` } : {}}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.06 + 0.2,
                    ease: [0.22, 0.7, 0.35, 1],
                  }}
                  className={`h-full ${colors.bar} rounded-full`}
                />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground/70 tabular-nums">
                {durationShort(activity.duration)}
              </span>
            </div>
          </div>

          <TimelineCardTags
            skills={activity.skills}
            taskTypes={activity.taskTypes}
            inView={inView}
            index={index}
            colors={colors}
          />
        </div>
      </div>
    </motion.div>
  );
}
