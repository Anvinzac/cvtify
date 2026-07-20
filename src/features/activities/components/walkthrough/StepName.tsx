/**
 * Walkthrough step 0 — activity name from examples or custom input.
 */

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import type { Category } from "@/features/activities/types";
import { OptionButton } from "./OptionButton";
import { StepLayout } from "./StepLayout";

interface StepNameProps {
  category: Category;
  name: string;
  isCustomName: boolean;
  onSelectExample: (name: string) => void;
  onEnableCustom: () => void;
  onNameChange: (name: string) => void;
}

/** Pick a preset example or enter a custom activity name. */
export function StepName({
  category,
  name,
  isCustomName,
  onSelectExample,
  onEnableCustom,
  onNameChange,
}: StepNameProps) {
  return (
    <StepLayout
      title="What activity were you involved in?"
      subtitle="Pick from common examples or write your own"
    >
      <div className="space-y-2">
        {category.examples.map((ex) => (
          <OptionButton
            key={ex}
            label={ex}
            selected={name === ex}
            onClick={() => onSelectExample(ex)}
          />
        ))}
        <OptionButton
          label="Something else..."
          selected={isCustomName}
          onClick={onEnableCustom}
          icon={<Sparkles className="w-3.5 h-3.5" />}
        />
      </div>
      <AnimatePresence>
        {isCustomName && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Describe your activity..."
              className="h-12 text-sm rounded-xl bg-card border-border mt-3 focus:ring-2 focus:ring-primary/20 transition-shadow"
              maxLength={100}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>
    </StepLayout>
  );
}
