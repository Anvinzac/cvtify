/**
 * Selectable activity row inside ActivityImportSheet.
 *
 * Exports: ActivityImportRow
 * Depends on: framer-motion, lucide-react, @/lib/data, activityImportUtils
 */

import { motion } from "framer-motion";
import { Check, Calendar, Tag } from "lucide-react";
import { Activity, CATEGORIES } from "@/lib/data";
import { activityWhenLabel } from "@/features/cv/lib/activityImportUtils";

interface ActivityImportRowProps {
  activity: Activity;
  isSelected: boolean;
  onToggle: () => void;
}

/** One timeline activity row with selection checkbox. */
export function ActivityImportRow({
  activity,
  isSelected,
  onToggle,
}: ActivityImportRowProps) {
  const cat = CATEGORIES.find((c) => c.id === activity.categoryId);

  return (
    <motion.button
      layout
      onClick={onToggle}
      whileTap={{ scale: 0.985 }}
      className={`w-full text-left rounded-2xl border p-3 transition-colors ${
        isSelected
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-background hover:border-primary/25"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5">{cat?.emoji ?? "✨"}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground leading-tight">{activity.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{cat?.name}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              {activityWhenLabel(activity)}
            </span>
            {activity.duration && (
              <span className="inline-flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" />
                {activity.duration}
              </span>
            )}
          </div>
          {activity.skills.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {activity.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-accent/60 px-2 py-0.5 text-[9px] font-semibold text-accent-foreground"
                >
                  {s}
                </span>
              ))}
              {activity.skills.length > 3 && (
                <span className="text-[9px] text-muted-foreground">
                  +{activity.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <motion.span
          animate={isSelected ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.4 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            isSelected
              ? "border-transparent gradient-warm text-primary-foreground shadow-sm"
              : "border-border bg-background text-transparent"
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </motion.span>
      </div>
    </motion.button>
  );
}
