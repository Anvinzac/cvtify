import { Activity, DreamJob } from "./data";

const STORAGE_KEY = "skillcompass_draft";

export interface DraftData {
  selectedCategories: string[];
  activities: Activity[];
  hobbies: string[];
  favoritedJobs: string[];
}

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
};

export function loadDraft(): DraftData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_DATA;
}

export function saveDraft(data: DraftData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
