/**
 * Walkthrough step 4 — task type multi-select.
 */

import { TASK_TYPES } from "@/features/activities/lib/catalog";
import { ChipButton } from "./ChipButton";
import { StepLayout } from "./StepLayout";

interface StepTasksProps {
  taskTypes: string[];
  onToggle: (task: string) => void;
}

/** Multi-select task type chips. */
export function StepTasks({ taskTypes, onToggle }: StepTasksProps) {
  return (
    <StepLayout title="What kinds of tasks did you do?" subtitle="Select all that apply">
      <div className="flex flex-wrap gap-2">
        {TASK_TYPES.map((t) => (
          <ChipButton
            key={t}
            label={t}
            selected={taskTypes.includes(t)}
            onClick={() => onToggle(t)}
          />
        ))}
      </div>
    </StepLayout>
  );
}
