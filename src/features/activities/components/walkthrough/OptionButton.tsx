/**
 * Reusable option button for single-select walkthrough steps.
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

/** Full-width selectable option with check indicator. */
export function OptionButton({ label, selected, onClick, icon }: OptionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium group ${
        selected
          ? "border-primary bg-accent/60 text-accent-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-accent/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{label}</span>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-5 h-5 rounded-full gradient-warm flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
