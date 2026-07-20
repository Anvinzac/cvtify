/**
 * Timeline import CTA used in CvCustomizeSections experience block.
 *
 * Exports: CvTimelineImportButton
 * Depends on: framer-motion, lucide-react
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CvTimelineImportButtonProps {
  activityCount: number;
  onOpenImport: () => void;
}

/** Borrow-from-timeline shortcut above the experience entry list. */
export function CvTimelineImportButton({
  activityCount,
  onOpenImport,
}: CvTimelineImportButtonProps) {
  if (activityCount <= 0) return null;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpenImport}
      className="flex w-full items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-3 text-left transition-colors hover:bg-secondary/10"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Borrow from your timeline</p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Promote any of your {activityCount} captured{" "}
          {activityCount === 1 ? "experience" : "experiences"} into a CV entry — one tap.
        </p>
      </div>
      <span className="text-[11px] font-bold text-secondary">Pick →</span>
    </motion.button>
  );
}
