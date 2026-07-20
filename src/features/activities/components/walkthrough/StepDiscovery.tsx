/**
 * Walkthrough step 5 — skills, values, and personal notes with explain mode.
 */

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import type { MouseEvent } from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { SKILLS_OPTIONS, VALUES_OPTIONS } from "@/features/activities/lib/catalog";
import {
  SKILL_EXPLANATIONS,
  VALUE_EXPLANATIONS,
} from "@/features/activities/lib/explanations";
import { ChipButton } from "./ChipButton";
import { StepLayout } from "./StepLayout";

export interface ExplainItem {
  label: string;
  short: string;
  example: string;
}

interface StepDiscoveryProps {
  explainMode: boolean;
  skills: string[];
  values: string[];
  notes: string;
  onToggleExplainMode: () => void;
  onExplainSkill: (item: ExplainItem) => void;
  onExplainValue: (item: ExplainItem) => void;
  onToggleSkill: (skill: string, e: MouseEvent) => void;
  onToggleValue: (value: string, e: MouseEvent) => void;
  onNotesChange: (notes: string) => void;
}

/** Skills, values, notes, and explain-mode toggle for the final step. */
export function StepDiscovery({
  explainMode,
  skills,
  values,
  notes,
  onToggleExplainMode,
  onExplainSkill,
  onExplainValue,
  onToggleSkill,
  onToggleValue,
  onNotesChange,
}: StepDiscoveryProps) {
  return (
    <StepLayout
      title="What did you discover about yourself?"
      subtitle="Skills you practiced and values you realized"
    >
      <label className="flex items-center gap-2.5 mb-5 cursor-pointer select-none">
        <div
          className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 ${
            explainMode ? "bg-primary" : "bg-muted"
          }`}
          onClick={onToggleExplainMode}
        >
          <motion.div
            className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: explainMode ? 21 : 3 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">
            Explain mode — tap to learn what each skill means
          </span>
        </div>
      </label>

      <div className="mb-5">
        <p className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS_OPTIONS.map((s) => (
            <ChipButton
              key={s}
              label={s}
              selected={skills.includes(s)}
              onClick={(e) => {
                if (explainMode) {
                  const info = SKILL_EXPLANATIONS[s];
                  if (info) onExplainSkill({ label: s, ...info });
                } else {
                  onToggleSkill(s, e);
                }
              }}
              explainMode={explainMode}
            />
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">
          Life values
        </p>
        <div className="flex flex-wrap gap-1.5">
          {VALUES_OPTIONS.map((v) => (
            <ChipButton
              key={v}
              label={v}
              selected={values.includes(v)}
              onClick={(e) => {
                if (explainMode) {
                  const info = VALUE_EXPLANATIONS[v];
                  if (info) onExplainValue({ label: v, ...info });
                } else {
                  onToggleValue(v, e);
                }
              }}
              explainMode={explainMode}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">
          Personal notes
        </p>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="What else did you learn or discover? Anything memorable?"
          className="rounded-xl bg-card border-border min-h-[72px] text-sm focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
          maxLength={500}
        />
      </div>
    </StepLayout>
  );
}
