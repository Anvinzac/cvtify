/**
 * Full-screen walkthrough overlay launched from a category card.
 *
 * Exports: WalkthroughOverlay
 */

import { motion, AnimatePresence } from "framer-motion";
import type { Category, Activity } from "@/features/activities/types";
import ActivityWalkthrough from "@/features/activities/components/walkthrough/ActivityWalkthrough";

interface WalkthroughOverlayProps {
  categoryId: string | null;
  category: Category | undefined;
  editingActivity: Activity | null;
  onComplete: (activity: Activity) => void;
  onClose: () => void;
}

/** Animated overlay hosting the activity walkthrough for add/edit flows. */
export function WalkthroughOverlay({
  categoryId,
  category,
  editingActivity,
  onComplete,
  onClose,
}: WalkthroughOverlayProps) {
  return (
    <AnimatePresence>
      {categoryId && category && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            layoutId={`card-${categoryId}`}
            className="relative z-10 m-2 mt-4 flex-1 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden flex flex-col"
            transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
          >
            <ActivityWalkthrough
              category={category}
              onComplete={onComplete}
              onClose={onClose}
              initialActivity={editingActivity ?? undefined}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
