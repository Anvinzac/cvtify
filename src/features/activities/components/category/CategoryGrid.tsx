/**
 * Category grid cards with activity pills and add-more affordances.
 *
 * Exports: CategoryGrid
 */

import { motion } from "framer-motion";
import { X, Check, Plus } from "lucide-react";
import { CATEGORIES } from "@/features/activities/lib/catalog";
import type { Activity } from "@/features/activities/types";
import { CATEGORY_COLORS } from "@/features/activities/components/category/constants";
import SpotlightCard from "@/shared/components/fx/SpotlightCard";

interface CategoryGridProps {
  activities: Activity[];
  onCardTap: (catId: string, el: HTMLElement) => void;
  onEditActivity: (act: Activity, e: React.MouseEvent) => void;
  onRemoveActivity: (id: string) => void;
}

/** Two-column grid of category cards with inline activity pills. */
export function CategoryGrid({
  activities,
  onCardTap,
  onEditActivity,
  onRemoveActivity,
}: CategoryGridProps) {
  return (
    <div className="flex-1 grid grid-cols-2 gap-2.5 content-start">
      {CATEGORIES.map((cat, i) => {
        const catActivities = activities.filter((a) => a.categoryId === cat.id);
        const colors = CATEGORY_COLORS[cat.id];
        const hasItems = catActivities.length > 0;

        return (
          <motion.div
            key={cat.id}
            layoutId={`card-${cat.id}`}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -3 }}
            onClick={(e) => onCardTap(cat.id, e.currentTarget as HTMLElement)}
            className={`w-full text-left rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-elevated transition-all duration-200 relative overflow-hidden cursor-pointer group ${
              hasItems ? "shadow-card" : ""
            }`}
          >
            <SpotlightCard radius={260} tilt={5} className="rounded-2xl">
              <div className={`h-1 w-full ${colors.bar} rounded-t-2xl`} />

              <div className="p-3.5">
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-xl leading-none mt-0.5">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                  {hasItems && (
                    <span className={`shrink-0 w-5 h-5 rounded-full ${colors.bar} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                      {catActivities.length}
                    </span>
                  )}
                </div>

                {!hasItems ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {cat.examples.slice(0, 2).join(" · ")}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {catActivities.slice(0, 3).map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-1.5 bg-accent/60 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-accent transition-colors group/pill"
                        onClick={(e) => onEditActivity(act, e)}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${colors.bar} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11px] text-accent-foreground font-medium leading-snug flex-1 break-words">
                          {act.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveActivity(act.id);
                          }}
                          className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover/pill:opacity-100 transition-opacity mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {catActivities.length > 3 && (
                      <p className="text-[11px] text-muted-foreground pl-1">
                        +{catActivities.length - 3} more
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardTap(cat.id, (e.target as HTMLElement).closest("[class*='group']") as HTMLElement);
                      }}
                      className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors pt-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      Add another
                    </button>
                  </div>
                )}
              </div>

              {!hasItems && (
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.03] transition-colors rounded-2xl" />
              )}
            </SpotlightCard>
          </motion.div>
        );
      })}
    </div>
  );
}
