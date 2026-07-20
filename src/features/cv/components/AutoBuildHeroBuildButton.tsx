/**
 * Primary build CTA button for AutoBuildHero with animated states.
 *
 * Exports: AutoBuildHeroBuildButton
 * Depends on: framer-motion, lucide-react
 */

import { motion, AnimatePresence } from "framer-motion";
import { Wand2, CheckCircle2 } from "lucide-react";

interface AutoBuildHeroBuildButtonProps {
  building: boolean;
  justBuilt: boolean;
  hasAnyData: boolean;
  timelineCount: number;
  onBuild: () => void;
}

/** Big magic-action button with building / success / idle states. */
export function AutoBuildHeroBuildButton({
  building,
  justBuilt,
  hasAnyData,
  timelineCount,
  onBuild,
}: AutoBuildHeroBuildButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onBuild}
      whileHover={!building ? { y: -2 } : undefined}
      whileTap={!building ? { scale: 0.985 } : undefined}
      disabled={building}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-warm py-4 text-base font-bold text-primary-foreground shadow-elevated shadow-glow transition-opacity hover:opacity-95"
    >
      <AnimatePresence mode="wait">
        {building ? (
          <motion.span
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            >
              <Wand2 className="h-5 w-5" />
            </motion.span>
            Conjuring your CV…
          </motion.span>
        ) : justBuilt ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Built! Refine anything below
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-flex items-center gap-2"
          >
            <Wand2 className="h-5 w-5" />
            {hasAnyData
              ? `Re-build from my ${timelineCount} ${
                  timelineCount === 1 ? "experience" : "experiences"
                }`
              : timelineCount > 0
              ? `Build it for me (${timelineCount} ${
                  timelineCount === 1 ? "experience" : "experiences"
                })`
              : "Build a starter draft"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
