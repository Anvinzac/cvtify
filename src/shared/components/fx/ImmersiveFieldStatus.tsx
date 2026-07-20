/**
 * Validity / error status chip for ImmersiveField.
 *
 * Exports: ImmersiveFieldStatus
 * Depends on: framer-motion, lucide-react
 */

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";

interface ImmersiveFieldStatusProps {
  error?: string;
  isValid: boolean;
  showValidity: boolean;
}

/** Right-side animated error or success indicator. */
export function ImmersiveFieldStatus({
  error,
  isValid,
  showValidity,
}: ImmersiveFieldStatusProps) {
  return (
    <div className="relative flex h-10 w-6 shrink-0 items-center justify-end">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.span
            key="err"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15 text-destructive"
          >
            <AlertCircle className="h-3 w-3" />
          </motion.span>
        ) : isValid && showValidity ? (
          <motion.span
            key="ok"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex h-5 w-5 items-center justify-center rounded-full gradient-warm text-primary-foreground shadow-sm"
          >
            <Check className="h-3 w-3" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
