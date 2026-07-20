/**
 * Sweet-spot progress bar and coaching hints for StoryTextarea.
 *
 * Exports: StoryTextareaSweetSpot
 * Depends on: framer-motion
 */

import { motion, AnimatePresence } from "framer-motion";

type SweetState = "low" | "good" | "high" | "neutral";

interface StoryTextareaSweetSpotProps {
  sweetSpot?: { min: number; max: number };
  maxLength?: number;
  counter: number;
  sweetState: SweetState;
}

/** Length progress bar and contextual coaching copy. */
export function StoryTextareaSweetSpot({
  sweetSpot,
  maxLength,
  counter,
  sweetState,
}: StoryTextareaSweetSpotProps) {
  if (!sweetSpot || !maxLength) return null;

  return (
    <>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (counter / maxLength) * 100)}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
          className={`h-full rounded-full ${
            sweetState === "good"
              ? "bg-emerald-500"
              : sweetState === "high"
              ? "bg-amber-500"
              : "gradient-warm"
          }`}
        />
      </div>

      <AnimatePresence>
        {counter > 0 && (
          <motion.p
            key={sweetState}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-[11px] font-medium text-muted-foreground"
          >
            {sweetState === "low" &&
              `A bit more — aim for ${sweetSpot.min}+ characters to give it weight.`}
            {sweetState === "good" &&
              "Right in the pocket. Recruiters love this length."}
            {sweetState === "high" &&
              "Powerful — but tighten anything that doesn't earn its place."}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}
