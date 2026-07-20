/**
 * Explain-mode bottom sheet for a skill or life value.
 */

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SKILLS_OPTIONS, VALUES_OPTIONS } from "@/features/activities/lib/catalog";
import type { ExplainItem } from "./StepDiscovery";

interface ExplainPopupProps {
  item: ExplainItem | null;
  onClose: () => void;
  onAdd: (label: string) => void;
}

/** Modal sheet showing a student-friendly skill or value explanation. */
export function ExplainPopup({ item, onClose, onAdd }: ExplainPopupProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-end justify-center bg-background/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="w-full mx-3 mb-4 bg-card rounded-2xl border border-border shadow-elevated p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">{item.label}</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-foreground mb-3 leading-relaxed">{item.short}</p>
            <div className="bg-accent/60 rounded-xl p-3.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Student example
              </p>
              <p className="text-sm text-accent-foreground leading-relaxed">{item.example}</p>
            </div>
            <Button
              onClick={() => {
                onAdd(item.label);
                onClose();
              }}
              className="w-full mt-4 h-11 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground"
            >
              Got it — add this
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Returns whether the label is a skill or value option. */
export function isSkillLabel(label: string): boolean {
  return SKILLS_OPTIONS.includes(label);
}

/** Returns whether the label is a value option. */
export function isValueLabel(label: string): boolean {
  return VALUES_OPTIONS.includes(label);
}
