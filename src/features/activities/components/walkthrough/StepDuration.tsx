/**
 * Walkthrough step 2 — involvement duration selection.
 */

import { DURATION_OPTIONS } from "@/features/activities/lib/catalog";
import { OptionButton } from "./OptionButton";
import { StepLayout } from "./StepLayout";

interface StepDurationProps {
  duration: string;
  onSelect: (duration: string) => void;
}

/** Single-select duration options. */
export function StepDuration({ duration, onSelect }: StepDurationProps) {
  return (
    <StepLayout
      title="How long were you involved?"
      subtitle="Total duration of this experience"
    >
      <div className="space-y-2">
        {DURATION_OPTIONS.map((d) => (
          <OptionButton
            key={d}
            label={d}
            selected={duration === d}
            onClick={() => onSelect(d)}
          />
        ))}
      </div>
    </StepLayout>
  );
}
