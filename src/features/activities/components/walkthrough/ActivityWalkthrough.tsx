/**
 * Multi-step activity capture and edit walkthrough — orchestrator component.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SparkleBurst from "@/shared/components/fx/SparkleBurst";
import type { Activity, Category } from "@/features/activities/types";
import { StepName } from "./StepName";
import { StepGroupSize } from "./StepGroupSize";
import { StepDuration } from "./StepDuration";
import { StepWhen } from "./StepWhen";
import { StepTasks } from "./StepTasks";
import { StepDiscovery, type ExplainItem } from "./StepDiscovery";
import { ExplainPopup, isSkillLabel, isValueLabel } from "./ExplainPopup";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { WalkthroughHeader, WalkthroughFooter } from "./WalkthroughChrome";
import { useActivityWalkthroughState } from "./useActivityWalkthroughState";

interface ActivityWalkthroughProps {
  category: Category;
  onComplete: (activity: Activity) => void;
  onClose: () => void;
  initialActivity?: Activity;
}

/** Guided flow for adding or editing a single activity. */
export default function ActivityWalkthrough({
  category,
  onComplete,
  onClose,
  initialActivity,
}: ActivityWalkthroughProps) {
  const [explainItem, setExplainItem] = useState<ExplainItem | null>(null);
  const s = useActivityWalkthroughState({ category, initialActivity, onComplete });

  const handleExplainAdd = (label: string) => {
    if (isSkillLabel(label)) s.toggleSkill(label);
    else if (isValueLabel(label)) s.toggleValue(label);
  };

  return (
    <div className="flex flex-col h-full relative">
      <WalkthroughHeader
        category={category}
        isEditing={s.isEditing}
        step={s.step}
        onBack={() => s.handleBack(onClose)}
        onClose={onClose}
      />

      <div className="flex-1 px-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {s.step === 0 && (
              <StepName
                category={category}
                name={s.name}
                isCustomName={s.isCustomName}
                onSelectExample={(ex) => {
                  s.setName(ex);
                  s.setIsCustomName(false);
                  s.autoAdvance(1);
                }}
                onEnableCustom={() => {
                  s.setIsCustomName(true);
                  s.setName("");
                }}
                onNameChange={s.setName}
              />
            )}
            {s.step === 1 && (
              <StepGroupSize
                groupSize={s.groupSize}
                onSelect={(size) => {
                  s.setGroupSize(size);
                  s.autoAdvance(2);
                }}
              />
            )}
            {s.step === 2 && (
              <StepDuration
                duration={s.duration}
                onSelect={(d) => {
                  s.setDuration(d);
                  s.autoAdvance(3);
                }}
              />
            )}
            {s.step === 3 && (
              <StepWhen
                whenYear={s.whenYear}
                whenMonth={s.whenMonth}
                onToggleYear={s.handleToggleYear}
                onSelectMonth={s.handleSelectMonth}
                onSkipOrConfirm={s.handleSkipOrConfirmWhen}
              />
            )}
            {s.step === 4 && (
              <StepTasks taskTypes={s.taskTypes} onToggle={s.toggleTaskType} />
            )}
            {s.step === 5 && (
              <StepDiscovery
                explainMode={s.explainMode}
                skills={s.skills}
                values={s.values}
                notes={s.notes}
                onToggleExplainMode={() => s.setExplainMode(!s.explainMode)}
                onExplainSkill={setExplainItem}
                onExplainValue={setExplainItem}
                onToggleSkill={(skill, e) => s.toggleSkill(skill, e)}
                onToggleValue={(value, e) => s.toggleValue(value, e)}
                onNotesChange={s.setNotes}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <WalkthroughFooter
        isEditing={s.isEditing}
        step={s.step}
        isCustomName={s.isCustomName}
        canNext={s.canNext()}
        onContinue={() => s.setStep(s.step + 1)}
        onFinish={s.handleFinish}
      />

      <ExplainPopup item={explainItem} onClose={() => setExplainItem(null)} onAdd={handleExplainAdd} />
      <CelebrationOverlay celebrating={s.celebrating} isEditing={s.isEditing} />
      <SparkleBurst bursts={s.bursts} onSettle={s.settleBurst} />
    </div>
  );
}
