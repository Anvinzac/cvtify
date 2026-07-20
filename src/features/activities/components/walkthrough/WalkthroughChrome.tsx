/**
 * Walkthrough chrome — header, step indicators, and footer CTA.
 */

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Category } from "@/features/activities/types";
import { STEPS } from "./constants";

interface WalkthroughHeaderProps {
  category: Category;
  isEditing: boolean;
  step: number;
  onBack: () => void;
  onClose: () => void;
}

/** Top bar and step progress indicators. */
export function WalkthroughHeader({
  category,
  isEditing,
  step,
  onBack,
  onClose,
}: WalkthroughHeaderProps) {
  return (
    <>
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{category.emoji}</span>
            <span className="text-xs text-muted-foreground font-medium">{category.name}</span>
            {isEditing && (
              <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-md font-medium">
                Edit
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 mb-4">
        <div className="flex items-center gap-1.5 mb-3">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className={`w-full h-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
                animate={{ scaleX: i === step ? [1, 1.04, 1] : 1 }}
                transition={{ duration: 0.5 }}
              />
              <span
                className={`text-[9px] font-semibold transition-colors duration-300 ${
                  i <= step ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                {s.icon}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground text-center">
          Step {step + 1} of {STEPS.length} · {STEPS[step].label}
        </p>
      </div>
    </>
  );
}

interface WalkthroughFooterProps {
  isEditing: boolean;
  step: number;
  isCustomName: boolean;
  canNext: boolean;
  onContinue: () => void;
  onFinish: () => void;
}

/** Bottom continue/complete button — shown on later steps. */
export function WalkthroughFooter({
  isEditing,
  step,
  isCustomName,
  canNext,
  onContinue,
  onFinish,
}: WalkthroughFooterProps) {
  if (step < 4 && !(step === 0 && isCustomName)) return null;

  return (
    <div className="px-5 py-4 mt-auto">
      <Button
        onClick={step === STEPS.length - 1 ? onFinish : onContinue}
        disabled={!canNext}
        className="w-full h-12 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-30 disabled:scale-100"
        size="lg"
      >
        {step === STEPS.length - 1 ? (
          <>
            {isEditing ? "Save changes" : "Complete"}
            <Check className="ml-2 w-4 h-4" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
