/**
 * Multi-select chip button for tasks, skills, and values steps.
 */

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import type { MouseEvent } from "react";

interface ChipButtonProps {
  label: string;
  selected: boolean;
  onClick: (e: MouseEvent) => void;
  explainMode?: boolean;
}

/** Pill-shaped toggle used in tasks and discovery steps. */
export function ChipButton({ label, selected, onClick, explainMode }: ChipButtonProps) {
  return (
    <motion.button
      onClick={(e) => onClick(e as unknown as MouseEvent)}
      whileTap={{ scale: 0.94 }}
      className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
        selected
          ? "gradient-warm text-primary-foreground border-transparent shadow-sm"
          : explainMode
          ? "bg-card text-primary border-primary/40 hover:border-primary hover:bg-accent/30"
          : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-accent/20"
      }`}
    >
      {explainMode && <HelpCircle className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </motion.button>
  );
}
