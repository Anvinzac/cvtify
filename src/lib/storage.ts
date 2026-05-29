import { Activity, DreamJob } from "./data";

const STORAGE_KEY = "skillcompass_draft_v2";

export interface CvEntry {
  id: string;
  title: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface CvPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface CvData {
  personalInfo: CvPersonalInfo;
  professionalSummary: string;
  workExperience: CvEntry[];
  education: CvEntry[];
  skills: string[];
  certifications: CvEntry[];
  languages: string[];
}

export const COMMON_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "SQL", "Excel",
  "Project Management", "Figma", "Data Analysis", "Public Speaking",
  "Git", "Docker", "AWS", "Machine Learning", "Agile / Scrum",
  "Customer Service", "Sales", "Content Writing", "SEO", "Photoshop",
];

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
    skills: ["Python", "React", "TypeScript", "Public Speaking", "Data Analysis", "Figma"],
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

export function loadDraft(): DraftData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DraftData;
      if (!parsed.cv) parsed.cv = structuredClone(MOCK_DATA.cv);
      return parsed;
    }
  } catch {}
  return MOCK_DATA;
}

export function saveDraft(data: DraftData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
