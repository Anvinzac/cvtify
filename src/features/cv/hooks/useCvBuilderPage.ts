/**
 * State and mutation handlers for the CV builder page.
 *
 * Exports: useCvBuilderPage
 * Depends on: AppContext, cvBuilderPageHelpers, useCvBuilderExpandState
 */

import { useState } from "react";
import { useAppState } from "@/shared/app-state/AppContext";
import type { CvEntry, CvPersonalInfo } from "@/features/cv/types";
import { SKILL_CATEGORIES } from "@/features/cv/lib/skillCategories";
import { draftSummary } from "@/features/cv/lib/activityAutofill";
import {
  computeHasAnyData,
  computeCompletedSections,
  buildAutoBuildUpdate,
  createBlankEntry,
  addSkillToGroups,
  removeSkillFromGroups,
  type CvListSection,
} from "@/features/cv/lib/cvBuilderPageHelpers";
import { useCvBuilderExpandState } from "@/features/cv/hooks/useCvBuilderExpandState";

/** All CV builder UI state, derived values, and event handlers. */
export function useCvBuilderPage() {
  const { cv, setCvData, activities } = useAppState();
  const [importOpen, setImportOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const expand = useCvBuilderExpandState();

  const [editingSection, setEditingSection] = useState<CvListSection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLinks, setShowLinks] = useState(!!(cv.personalInfo.linkedin || cv.personalInfo.website));
  const [activeCategoryId, setActiveCategoryId] = useState(SKILL_CATEGORIES[0].id);

  const updatePersonal = (field: keyof CvPersonalInfo, value: string) => {
    setCvData({ ...cv, personalInfo: { ...cv.personalInfo, [field]: value } });
  };

  const handleImportActivities = (entries: CvEntry[]) => {
    if (entries.length === 0) return;
    setCvData({ ...cv, workExperience: [...cv.workExperience, ...entries] });
    setImportOpen(false);
    expand.setExperienceExpanded(true);
  };

  const updateSummary = (value: string) => {
    setCvData({ ...cv, professionalSummary: value });
  };

  const handleDraftSummary = () => {
    setCvData({
      ...cv,
      professionalSummary: draftSummary(activities, {
        fullName: cv.personalInfo.fullName,
        location: cv.personalInfo.location,
      }),
    });
    expand.setSummaryExpanded(true);
  };

  const handleAutoBuild = (paste: Partial<CvPersonalInfo>) => {
    setCvData(buildAutoBuildUpdate(cv, activities, paste));
  };

  const openSection = (
    section: "identity" | "story" | "experience" | "skills" | "education"
  ) => {
    setCustomizing(true);
    setTimeout(() => {
      if (section === "identity") expand.setPersonalExpanded(true);
      if (section === "story") expand.setSummaryExpanded(true);
      if (section === "experience") expand.setExperienceExpanded(true);
      if (section === "skills") expand.setSkillsExpanded(true);
      if (section === "education") expand.setEducationExpanded(true);
      setTimeout(() => {
        document.getElementById(`cv-section-${section}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 60);
    }, 30);
  };

  const addEntry = (section: CvListSection) => {
    const entry = createBlankEntry();
    setCvData({ ...cv, [section]: [...cv[section], entry] });
    setEditingSection(section);
    setEditingId(entry.id);
  };

  const updateEntry = (section: CvListSection, entry: CvEntry) => {
    setCvData({
      ...cv,
      [section]: cv[section].map((e) => (e.id === entry.id ? entry : e)),
    });
  };

  const removeEntry = (section: CvListSection, id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditingSection(null);
    }
    setCvData({ ...cv, [section]: cv[section].filter((e) => e.id !== id) });
  };

  const startEditing = (section: CvListSection, id: string) => {
    setEditingSection(section);
    setEditingId(id);
  };

  const cancelEditing = () => {
    if (editingSection && editingId) {
      const entry = cv[editingSection].find((e) => e.id === editingId);
      if (entry && !entry.title && !entry.organization) {
        setCvData({
          ...cv,
          [editingSection]: cv[editingSection].filter((e) => e.id !== editingId),
        });
      }
    }
    setEditingId(null);
    setEditingSection(null);
  };

  const saveEditing = () => {
    setEditingId(null);
    setEditingSection(null);
  };

  const addTag = (field: "languages", value: string) => {
    const trimmed = value.trim();
    if (trimmed && !cv[field].includes(trimmed)) {
      setCvData({ ...cv, [field]: [...cv[field], trimmed] });
    }
  };

  const removeTag = (field: "languages", value: string) => {
    setCvData({ ...cv, [field]: cv[field].filter((t) => t !== value) });
  };

  const addSkill = (categoryId: string, skillName: string) => {
    const next = addSkillToGroups(cv.skills, categoryId, skillName);
    if (next) setCvData({ ...cv, skills: next });
  };

  const removeSkill = (categoryId: string, skillName: string) => {
    setCvData({
      ...cv,
      skills: removeSkillFromGroups(cv.skills, categoryId, skillName),
    });
  };

  return {
    cv,
    activities,
    importOpen,
    setImportOpen,
    customizing,
    setCustomizing,
    ...expand,
    editingSection,
    editingId,
    showLinks,
    setShowLinks,
    activeCategoryId,
    setActiveCategoryId,
    updatePersonal,
    updateSummary,
    handleImportActivities,
    handleDraftSummary,
    handleAutoBuild,
    openSection,
    addEntry,
    updateEntry,
    removeEntry,
    startEditing,
    cancelEditing,
    saveEditing,
    addTag,
    removeTag,
    addSkill,
    removeSkill,
    hasAnyData: computeHasAnyData(cv),
    completedSections: computeCompletedSections(cv),
  };
}
