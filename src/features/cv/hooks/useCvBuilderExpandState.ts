/**
 * Expand/collapse UI flags for CV builder sections.
 *
 * Exports: useCvBuilderExpandState
 * Depends on: react
 */

import { useState } from "react";

/** Section accordion open state for the customize flow. */
export function useCvBuilderExpandState() {
  const [personalExpanded, setPersonalExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [certsExpanded, setCertsExpanded] = useState(false);
  const [languagesExpanded, setLanguagesExpanded] = useState(false);

  return {
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
  };
}
