/**
 * Professional summary section with optional auto-draft from timeline data.
 *
 * Exports: SummarySection
 * Depends on: framer-motion, lucide-react, shared fx, SectionCard, constants
 */

import { motion } from "framer-motion";
import { FileText, Sparkles, Wand2 } from "lucide-react";
import { StoryTextarea } from "@/shared/components/fx/StoryTextarea";
import { SectionCard } from "@/features/cv/components/SectionCard";
import { SUMMARY_PLACEHOLDERS, SUMMARY_TONES } from "@/features/cv/lib/constants";

export interface SummarySectionProps {
  professionalSummary: string;
  activityCount: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  onDraftSummary: () => void;
}

/** Collapsible opening-story editor with tone presets and draft helper. */
export function SummarySection({
  professionalSummary,
  activityCount,
  expanded,
  onToggle,
  onChange,
  onDraftSummary,
}: SummarySectionProps) {
  return (
    <>
      <div id="cv-section-story" />
      <SectionCard
        icon={<FileText className="w-4 h-4 text-muted-foreground" />}
        title="Opening Story"
        subtitle="Write the 10-second version of you"
        prompt="Blend your strengths, experience, and direction into a confident introduction."
        count={professionalSummary ? 1 : 0}
        expanded={expanded}
        onToggle={onToggle}
      >
        {activityCount > 0 && (
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDraftSummary}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-3 text-left transition-colors hover:bg-secondary/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-teal text-secondary-foreground shadow-sm">
              <Wand2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">
                {professionalSummary
                  ? "Re-draft from your data"
                  : "Draft from your data"}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                We'll write a confident first draft from your {activityCount}{" "}
                {activityCount === 1 ? "experience" : "experiences"} — edit
                freely afterwards.
              </p>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 text-secondary" />
          </motion.button>
        )}

        <StoryTextarea
          icon={<Wand2 className="h-4 w-4" />}
          label="Professional summary"
          value={professionalSummary}
          onChange={onChange}
          rotatingPlaceholders={SUMMARY_PLACEHOLDERS}
          guide="Try: who you are, what you've done, what kind of work energizes you."
          tones={SUMMARY_TONES}
          sweetSpot={{ min: 220, max: 420 }}
          maxLength={600}
          minHeight="min-h-[148px]"
        />
      </SectionCard>
    </>
  );
}
