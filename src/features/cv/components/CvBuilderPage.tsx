/**
 * Main CV builder page orchestrating hero, overview, and customize sections.
 *
 * Exports: CvBuilderPage (default)
 * Depends on: react-router, framer-motion, useCvBuilderPage, cv feature components
 */

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import AutoBuildHero from "@/features/cv/components/AutoBuildHero";
import CvOverview from "@/features/cv/components/CvOverview";
import ActivityImportSheet from "@/features/cv/components/ActivityImportSheet";
import { PersonalSection } from "@/features/cv/components/PersonalSection";
import { SummarySection } from "@/features/cv/components/SummarySection";
import { CvCustomizeSections } from "@/features/cv/components/CvCustomizeSections";
import { useCvBuilderPage } from "@/features/cv/hooks/useCvBuilderPage";

export default function CvBuilderPage() {
  const navigate = useNavigate();
  const b = useCvBuilderPage();

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-gradient-to-b from-secondary/10 via-primary/5 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative px-4 pt-6 pb-3"
      >
        <AutoBuildHero
          timelineCount={b.activities.length}
          filledCount={b.completedSections}
          totalCount={5}
          hasAnyData={b.hasAnyData}
          onAutoBuild={b.handleAutoBuild}
          onCustomize={() => b.setCustomizing((c) => !c)}
          customizing={b.customizing}
          onPreview={() => navigate("/cv-preview")}
        />
      </motion.div>

      <div className="relative flex-1 px-4 pt-2 pb-6 space-y-3">
        {!b.customizing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <CvOverview cv={b.cv} onEditSection={b.openSection} />
          </motion.div>
        )}

        <AnimatePresence initial={false}>
        {b.customizing && (
        <motion.div
          key="customize"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 0.7, 0.35, 1] }}
          className="space-y-3"
        >
          <PersonalSection
            personalInfo={b.cv.personalInfo}
            expanded={b.personalExpanded}
            showLinks={b.showLinks}
            onToggle={() => b.setPersonalExpanded(!b.personalExpanded)}
            onUpdatePersonal={b.updatePersonal}
            onShowLinks={b.setShowLinks}
          />
          <SummarySection
            professionalSummary={b.cv.professionalSummary}
            activityCount={b.activities.length}
            expanded={b.summaryExpanded}
            onToggle={() => b.setSummaryExpanded(!b.summaryExpanded)}
            onChange={b.updateSummary}
            onDraftSummary={b.handleDraftSummary}
          />
          <CvCustomizeSections
            cv={b.cv}
            activityCount={b.activities.length}
            experienceExpanded={b.experienceExpanded}
            educationExpanded={b.educationExpanded}
            skillsExpanded={b.skillsExpanded}
            certsExpanded={b.certsExpanded}
            languagesExpanded={b.languagesExpanded}
            editingId={b.editingId}
            editingSection={b.editingSection}
            activeCategoryId={b.activeCategoryId}
            onExperienceToggle={() => b.setExperienceExpanded(!b.experienceExpanded)}
            onEducationToggle={() => b.setEducationExpanded(!b.educationExpanded)}
            onSkillsToggle={() => b.setSkillsExpanded(!b.skillsExpanded)}
            onCertsToggle={() => b.setCertsExpanded(!b.certsExpanded)}
            onLanguagesToggle={() => b.setLanguagesExpanded(!b.languagesExpanded)}
            onCategoryChange={b.setActiveCategoryId}
            onOpenImport={() => b.setImportOpen(true)}
            onAddEntry={b.addEntry}
            onEditEntry={b.startEditing}
            onRemoveEntry={b.removeEntry}
            onUpdateEntry={b.updateEntry}
            onSaveEdit={b.saveEditing}
            onCancelEdit={b.cancelEditing}
            onAddSkill={b.addSkill}
            onRemoveSkill={b.removeSkill}
            onAddLanguage={(v) => b.addTag("languages", v)}
            onRemoveLanguage={(v) => b.removeTag("languages", v)}
          />
        </motion.div>
        )}
        </AnimatePresence>

        <div className="pt-4 pb-6 space-y-3">
          <button
            onClick={() => navigate("/cv-preview")}
            className="w-full h-12 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview &amp; Print CV
          </button>

          <button
            onClick={() => navigate("/categories")}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Discover your career fit
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ActivityImportSheet
        open={b.importOpen}
        activities={b.activities}
        onClose={() => b.setImportOpen(false)}
        onImport={b.handleImportActivities}
      />
    </div>
  );
}
