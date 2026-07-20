/**
 * Remaining customize sections: experience, education, skills, certs, languages.
 *
 * Exports: CvCustomizeSections
 * Depends on: framer-motion, lucide-react, entry/skills/tag components, SectionCard
 */

import { motion } from "framer-motion";
import {
  Briefcase, GraduationCap, Wrench, Award, Globe, Sparkles,
} from "lucide-react";
import type { CvData, CvEntry } from "@/features/cv/types";
import { EntryListSection } from "@/features/cv/components/EntryListSection";
import { SectionCard } from "@/features/cv/components/SectionCard";
import { SkillsEditor } from "@/features/cv/components/SkillsEditor";
import { TagInput } from "@/features/cv/components/TagInput";

export interface CvCustomizeSectionsProps {
  cv: CvData;
  activityCount: number;
  experienceExpanded: boolean;
  educationExpanded: boolean;
  skillsExpanded: boolean;
  certsExpanded: boolean;
  languagesExpanded: boolean;
  editingId: string | null;
  editingSection: "workExperience" | "education" | "certifications" | null;
  activeCategoryId: string;
  onExperienceToggle: () => void;
  onEducationToggle: () => void;
  onSkillsToggle: () => void;
  onCertsToggle: () => void;
  onLanguagesToggle: () => void;
  onCategoryChange: (id: string) => void;
  onOpenImport: () => void;
  onAddEntry: (section: "workExperience" | "education" | "certifications") => void;
  onEditEntry: (section: "workExperience" | "education" | "certifications", id: string) => void;
  onRemoveEntry: (section: "workExperience" | "education" | "certifications", id: string) => void;
  onUpdateEntry: (section: "workExperience" | "education" | "certifications", entry: CvEntry) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onAddSkill: (categoryId: string, skillName: string) => void;
  onRemoveSkill: (categoryId: string, skillName: string) => void;
  onAddLanguage: (value: string) => void;
  onRemoveLanguage: (value: string) => void;
}

/** Experience-through-languages blocks shown in customize mode. */
export function CvCustomizeSections({
  cv,
  activityCount,
  experienceExpanded,
  educationExpanded,
  skillsExpanded,
  certsExpanded,
  languagesExpanded,
  editingId,
  editingSection,
  activeCategoryId,
  onExperienceToggle,
  onEducationToggle,
  onSkillsToggle,
  onCertsToggle,
  onLanguagesToggle,
  onCategoryChange,
  onOpenImport,
  onAddEntry,
  onEditEntry,
  onRemoveEntry,
  onUpdateEntry,
  onSaveEdit,
  onCancelEdit,
  onAddSkill,
  onRemoveSkill,
  onAddLanguage,
  onRemoveLanguage,
}: CvCustomizeSectionsProps) {
  return (
    <>
      <div id="cv-section-experience" />
      <EntryListSection
        icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
        title="Experience Proof"
        subtitle="Turn roles into evidence"
        prompt="Add jobs, internships, projects, volunteering, or leadership work."
        entries={cv.workExperience}
        sectionKey="workExperience"
        expanded={experienceExpanded}
        onToggle={onExperienceToggle}
        editingId={editingId}
        editingSection={editingSection}
        onAdd={() => onAddEntry("workExperience")}
        onEdit={(id) => onEditEntry("workExperience", id)}
        onRemove={(id) => onRemoveEntry("workExperience", id)}
        onUpdateEntry={(e) => onUpdateEntry("workExperience", e)}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        topAction={
          activityCount > 0 ? (
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenImport}
              className="flex w-full items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-3 text-left transition-colors hover:bg-secondary/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">
                  Borrow from your timeline
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Promote any of your {activityCount} captured{" "}
                  {activityCount === 1 ? "experience" : "experiences"} into a
                  CV entry — one tap.
                </p>
              </div>
              <span className="text-[11px] font-bold text-secondary">Pick →</span>
            </motion.button>
          ) : null
        }
      />

      <div id="cv-section-education" />
      <EntryListSection
        icon={<GraduationCap className="w-4 h-4 text-muted-foreground" />}
        title="Education"
        subtitle="Show your learning path"
        prompt="Include degrees, schools, courses, bootcamps, or programs that shaped your direction."
        entries={cv.education}
        sectionKey="education"
        expanded={educationExpanded}
        onToggle={onEducationToggle}
        editingId={editingId}
        editingSection={editingSection}
        onAdd={() => onAddEntry("education")}
        onEdit={(id) => onEditEntry("education", id)}
        onRemove={(id) => onRemoveEntry("education", id)}
        onUpdateEntry={(e) => onUpdateEntry("education", e)}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />

      <div id="cv-section-skills" />
      <SectionCard
        icon={<Wrench className="w-4 h-4 text-muted-foreground" />}
        title="Skill Palette"
        subtitle="Choose what you can bring"
        prompt="Browse fields, tap chips, and build a skill profile that feels specific."
        count={cv.skills.reduce((sum, g) => sum + g.skills.length, 0)}
        expanded={skillsExpanded}
        onToggle={onSkillsToggle}
      >
        <SkillsEditor
          skillGroups={cv.skills}
          activeCategoryId={activeCategoryId}
          onCategoryChange={onCategoryChange}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
      </SectionCard>

      <EntryListSection
        icon={<Award className="w-4 h-4 text-muted-foreground" />}
        title="Certifications"
        subtitle="Add extra signals"
        prompt="Certificates, licenses, workshops, and awards all help your CV feel credible."
        entries={cv.certifications}
        sectionKey="certifications"
        expanded={certsExpanded}
        onToggle={onCertsToggle}
        editingId={editingId}
        editingSection={editingSection}
        onAdd={() => onAddEntry("certifications")}
        onEdit={(id) => onEditEntry("certifications", id)}
        onRemove={(id) => onRemoveEntry("certifications", id)}
        onUpdateEntry={(e) => onUpdateEntry("certifications", e)}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />

      <SectionCard
        icon={<Globe className="w-4 h-4 text-muted-foreground" />}
        title="Languages"
        subtitle="Add communication range"
        prompt="Show the languages and fluency levels you can work with."
        count={cv.languages.length}
        expanded={languagesExpanded}
        onToggle={onLanguagesToggle}
      >
        <TagInput
          tags={cv.languages}
          onAdd={onAddLanguage}
          onRemove={onRemoveLanguage}
          placeholder="English (Native), Spanish (Intermediate)..."
        />
      </SectionCard>
    </>
  );
}
