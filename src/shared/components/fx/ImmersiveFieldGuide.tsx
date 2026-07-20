/**
 * Guide / error message row under ImmersiveField.
 *
 * Exports: ImmersiveFieldGuide
 * Depends on: framer-motion
 */

import { AnimatePresence, motion } from "framer-motion";

interface ImmersiveFieldGuideProps {
  error?: string;
  guide?: string;
  focused: boolean;
}

/** Shows validation error or helper guide text beneath the field. */
export function ImmersiveFieldGuide({
  error,
  guide,
  focused,
}: ImmersiveFieldGuideProps) {
  return (
    <div className="mt-1.5 min-h-[14px] flex items-center justify-between px-1">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="err-msg"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="text-[11px] font-semibold text-destructive"
          >
            {error}
          </motion.p>
        ) : guide ? (
          <motion.p
            key="guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: focused ? 0.95 : 0.7 }}
            className="text-[11px] leading-relaxed text-muted-foreground"
          >
            {guide}
          </motion.p>
        ) : (
          <span />
        )}
      </AnimatePresence>
    </div>
  );
}
