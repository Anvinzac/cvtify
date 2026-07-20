/**
 * Completion celebration overlay shown before onComplete fires.
 */

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Confetti from "@/shared/components/fx/Confetti";

interface CelebrationOverlayProps {
  celebrating: boolean;
  isEditing: boolean;
}

/** Animated success state with optional confetti for new activities. */
export function CelebrationOverlay({ celebrating, isEditing }: CelebrationOverlayProps) {
  return (
    <>
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-hidden"
          >
            <motion.span
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-32 h-32 rounded-full border-2 border-primary/40"
            />
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.18, 1], rotate: [0, 6, -4, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4 shadow-glow"
              >
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-lg font-bold text-foreground"
              >
                {isEditing ? "Updated!" : "Experience captured!"}
              </motion.p>
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-muted-foreground mt-1"
              >
                {isEditing ? "Changes saved" : "Adding to your profile..."}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {celebrating && !isEditing && <Confetti count={56} />}
    </>
  );
}
