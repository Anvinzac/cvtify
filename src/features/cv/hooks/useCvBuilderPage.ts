/**
 * State and mutation handlers for the CV builder page.
 *
 * Exports: useCvBuilderPage
 * Depends on: @/shared/app-state/AppContext, @/features/cv/types, cvBuilderPageHelpers
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
} from "@/features/cv/lib/cvBuilderPageHelpers";

/** All CV builder UI state, derived values, and event handlers. */
export function useCvBuilderPage() {
  const { cv, setCvData, activities } = useAppState();
  const [importOpen, setImportOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);

  const [personalExpanded, setPersonalExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [certsExpanded, setCertsExpanded] = useState(false);
  const [languagesExpanded, setLanguagesExpanded] = useState(false);

  const [editingSection, setEditingSection] = useState<"workExperience" | "education" | "certifications" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showLinks, setShowLinks] = useState(!!(cv.personalInfo.linkedin || cv.personalInfo.website));
  const [activeCategoryId, setActiveCategoryId] = useState(SKILL_CATEGORIES[0].id);

  const updatePersonal = (field: keyof CvPersonalInfo, value: string) => {
    setCvData({ ...cv, personalInfo: { ...cv.personalInfo, [field]: value } });
  };

  const handleImportActivities = (entries: CvEntry[]) => {
    if (entries.length === 0) return;
    setCvData({
      ...cv,
      workExperience: [...cv.workExperience, ...entries],
    });
    setImportOpen(false);
    setExperienceExpanded(true);
  };

  const updateSummary = (value: string) => {
    setCvData({ ...cv, professionalSummary: value });
  };

  const handleDraftSummary = () => {
    const draft = draftSummary(activities, {
      fullName: cv.personalInfo.fullName,
      location: cv.personalInfo.location,
    });
    setCvData({ ...cv, professionalSummary: draft });
    setSummaryExpanded(true);
  };

  const handleAutoBuild = (paste: Partial<CvPersonalInfo>) => {
    setCvData(buildAutoBuildUpdate(cv, activities, paste));
  };

  const openSection = (
    section: "identity" | "story" | "experience" | "skills" | "education"
  ) => {
    setCustomizing(true);
    setTimeout(() => {
      if (section === "identity") setPersonalExpanded(true);
      if (section === "story") setSummaryExpanded(true);
      if (section === "experience") setExperienceExpanded(true);
      if (section === "skills") setSkillsExpanded(true);
      if (section === "education") setEducationExpanded(true);
      setTimeout(() => {
        const target = document.getElementById(`cv-section-${section}`);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }, 30);
  };

  const addEntry = (section: "workExperience" | "education" | "certifications") => {
    const entry: CvEntry = {
      id: Date.now().toString(),
      title: "",
      organization: "",
      startDate: "",
    };
    setCvData({ ...cv, [section]: [...cv[section], entry] });
    setEditingSection(section);
    setEditingId(entry.id);
  };

  const updateEntry = (section: "workExperience" | "education" | "certifications", entry: CvEntry) => {
    setCvData({
      ...cv,
      [section]: cv[section].map((e) => (e.id === entry.id ? entry : e)),
    });
  };

  const removeEntry = (section: "workExperience" | "education" | "certifications", id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditingSection(null);
    }
    setCvData({ ...cv, [section]: cv[section].filter((e) => e.id !== id) });
  };

  const startEditing = (section: "workExperience" | "education" | "certifications", id: string) => {
    setEditingSection(section);
    setEditingId(id);
  };

  const cancelEditing = () => {
    if (editingSection && editingId) {
      const entry = cv[editingSection].find((e) => e.id === editingId);
      if (entry && !entry.title && !entry.organization) {
        setCvData({ ...cv, [editingSection]: cv[editingSection].filter((e) => e.id !== editingId) });
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
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const newGroups = cv.skills.map((g) => ({ ...g, skills: [...g.skills] }));
    const existingGroup = newGroups.find((g) => g.category === categoryId);

    if (existingGroup) {
      if (existingGroup.skills.includes(trimmed)) return;
      existingGroup.skills = [...existingGroup.skills, trimmed];
    } else {
      newGroups.push({ id: Date.now().toString(), category: categoryId, skills: [trimmed] });
    }

    setCvData({ ...cv, skills: newGroups });
  };

  const removeSkill = (categoryId: string, skillName: string) => {
    const newGroups = cv.skills
      .map((g) => (g.category === categoryId ? { ...g, skills: g.skills.filter((s) => s !== skillName) } : g))
      .filter((g) => g.skills.length > 0);

    setCvData({ ...cv, skills: newGroups });
  };

  const hasAnyData = computeHasAnyData(cv);
  const completedSections = computeCompletedSections(cv);

  return {
    cv,
    activities,
    importOpen,
    setImportOpen,
    customizing,
    setCustomizing,
    personalExpanded,
    setPersonalExpanded,
    summaryExpanded,
    setSummaryExpanded,
    experienceExpanded,
    setExperienceExpanded,
    educationExpanded,
    setEducationExpanded,
    skillsExpanded,
    setSkillsExpanded,
    certsExpanded,
    setCertsExpanded,
    languagesExpanded,
    setLanguagesExpanded,
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
    hasAnyData,
    completedSections,
  };
}
