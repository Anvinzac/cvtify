/**
 * Walkthrough step 1 — team / group size selection.
 */

import { GROUP_SIZES } from "@/features/activities/lib/catalog";
import { OptionButton } from "./OptionButton";
import { StepLayout } from "./StepLayout";

interface StepGroupSizeProps {
  groupSize: string;
  onSelect: (size: string) => void;
}

/** Single-select team size options. */
export function StepGroupSize({ groupSize, onSelect }: StepGroupSizeProps) {
  return (
    <StepLayout title="How big was the team?" subtitle="The group you worked with">
      <div className="space-y-2">
        {GROUP_SIZES.map((size) => (
          <OptionButton
            key={size}
            label={size}
            selected={groupSize === size}
            onClick={() => onSelect(size)}
          />
        ))}
      </div>
    </StepLayout>
  );
}
