/**
 * Local-first draft persistence — single boundary for localStorage read/write.
 *
 * Exports: DraftData, loadDraft, saveDraft, clearDraft
 * Depends on: @/features/activities/types, @/features/cv/types
 */

import type { Activity } from "@/features/activities/types";
import type { CvData, SkillGroup } from "@/features/cv/types";

const STORAGE_KEY = "skillcompass_draft_v2";

/** Full application draft persisted to localStorage. */
export interface DraftData {
  selectedCategories: string[];
  activities: Activity[];
  hobbies: string[];
  favoritedJobs: string[];
  cv: CvData;
}

const EMPTY_CV: CvData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "" },
  professionalSummary: "",
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};

const MOCK_DATA: DraftData = {
  selectedCategories: ["social-works", "part-time", "extra-curriculum", "projects-internship"],
  activities: [
    {
      id: "mock-1",
      categoryId: "social-works",
      name: "Charity events",
      groupSize: "Medium group (6-15 people)",
      duration: "3-6 months",
      taskTypes: ["Communication & Outreach", "Planning & Strategy", "Operations & Logistics"],
      skills: ["Teamwork", "Communication", "Empathy", "Leadership"],
      values: ["Helping others", "Social impact"],
      personalNotes: "Organized a fundraiser for the local shelter. Learned how to coordinate volunteers and handle last-minute changes.",
    },
    {
      id: "mock-2",
      categoryId: "part-time",
      name: "Barista",
      groupSize: "Small team (2-5 people)",
      duration: "6-12 months",
      taskTypes: ["Customer Service", "Operations & Logistics", "Problem Solving"],
      skills: ["Time Management", "Adaptability", "Communication", "Resilience"],
      values: ["Financial independence", "Work-life balance"],
      personalNotes: "Worked weekend shifts while studying. Got better at handling pressure during rush hours.",
    },
    {
      id: "mock-3",
      categoryId: "extra-curriculum",
      name: "Debate club",
      groupSize: "Small team (2-5 people)",
      duration: "More than a year",
      taskTypes: ["Communication & Outreach", "Research & Analysis", "Writing & Documentation"],
      skills: ["Public Speaking", "Critical Thinking", "Communication", "Self-Discipline"],
      values: ["Knowledge & learning", "Recognition & achievement"],
      personalNotes: "Competed in regional tournaments. It really pushed me to think on my feet.",
    },
    {
      id: "mock-4",
      categoryId: "projects-internship",
      name: "Summer internship",
      groupSize: "Medium group (6-15 people)",
      duration: "1-3 months",
      taskTypes: ["Research & Analysis", "Technical & IT", "Writing & Documentation", "Planning & Strategy"],
      skills: ["Problem Solving", "Attention to Detail", "Critical Thinking", "Networking"],
      values: ["Knowledge & learning", "Innovation", "Financial independence"],
      personalNotes: "Interned at a small tech startup. Built dashboards and learned about product development.",
    },
    {
      id: "mock-5",
      categoryId: "social-works",
      name: "Community clean-ups",
      groupSize: "Large team (16-50 people)",
      duration: "Less than a month",
      taskTypes: ["Operations & Logistics", "Leadership & Management"],
      skills: ["Teamwork", "Leadership", "Adaptability"],
      values: ["Social impact", "Helping others"],
      personalNotes: "Led a weekend beach cleanup with 30+ volunteers.",
    },
  ],
  hobbies: ["Photography", "Coding & Tech Projects", "Cooking & Baking"],
  favoritedJobs: ["j1", "j3"],
  cv: {
    personalInfo: {
      fullName: "Alex Chen",
      email: "alex.chen@email.com",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexchen",
    },
    professionalSummary:
      "Curious and adaptable student with hands-on experience across retail, community leadership, and academic research. Passionate about technology and social impact — looking for opportunities where creativity meets problem-solving.",
    workExperience: [
      {
        id: "cv-exp-1",
        title: "Barista",
        organization: "Campus Coffee Co.",
        location: "Berkeley, CA",
        startDate: "2024-06",
        isCurrent: true,
        description:
          "Prepare espresso drinks in a high-volume campus café. Manage inventory and train new hires on weekend shifts.",
      },
      {
        id: "cv-exp-2",
        title: "Summer Research Intern",
        organization: "TechStart Inc.",
        location: "San Francisco, CA",
        startDate: "2023-06",
        endDate: "2023-08",
        description:
          "Built internal dashboards using React and Python. Collaborated with product team on user research synthesis.",
      },
    ],
    education: [
      {
        id: "cv-edu-1",
        title: "B.S. Computer Science",
        organization: "UC Berkeley",
        startDate: "2023-09",
        isCurrent: true,
        description: "GPA: 3.7. Relevant coursework: Data Structures, HCI, Statistics.",
      },
    ],
    skills: [
      { id: "mock-sk-prog", category: "programming-tech", skills: ["Python", "React", "TypeScript", "SQL"] },
      { id: "mock-sk-design", category: "design-creative", skills: ["Figma"] },
      { id: "mock-sk-biz", category: "business-management", skills: ["Project Management"] },
      { id: "mock-sk-edu", category: "education-teaching", skills: ["Public Speaking"] },
    ],
    certifications: [
      {
        id: "cv-cert-1",
        title: "Google Data Analytics Certificate",
        organization: "Coursera / Google",
        startDate: "2024-03",
      },
    ],
    languages: ["English (Native)", "Mandarin (Fluent)", "Spanish (Intermediate)"],
  },
};

function migrateCvSkills(skills: unknown): SkillGroup[] {
  if (!Array.isArray(skills) || skills.length === 0) return [];
  if (typeof skills[0] === "object" && skills[0] !== null && "category" in (skills[0] as object)) {
    return skills as SkillGroup[];
  }
  if (skills.every((s) => typeof s === "string")) {
    return [{ id: "legacy-general", category: "general", skills: skills as string[] }];
  }
  return [];
}

/**
 * Loads the draft from localStorage, falling back to mock seed data.
 * @returns Parsed draft with migrated skill groups when present.
 */
export function loadDraft(): DraftData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DraftData;
      if (!parsed.cv) parsed.cv = structuredClone(MOCK_DATA.cv);
      parsed.cv.skills = migrateCvSkills(parsed.cv.skills);
      return parsed;
    }
  } catch {}
  return MOCK_DATA;
}

/**
 * Persists the full draft to localStorage.
 * @param data - Current draft snapshot.
 */
export function saveDraft(data: DraftData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Removes the persisted draft from localStorage. */
export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
