/**
 * CV skill category catalog for the skills editor and preview.
 *
 * Exports: SKILL_CATEGORIES, getCategoryById, COMMON_SKILLS
 * Depends on: @/features/cv/types (SkillCategory)
 */

import type { SkillCategory } from "@/features/cv/types";

/** Full catalog of skill categories with emoji, styling, and suggested skills. */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "programming-tech",
    label: "Programming & Tech",
    emoji: "🖥️",
    pillClasses: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    skills: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git", "Docker", "AWS", "Cloud Deployment", "Cybersecurity Basics", "REST APIs", "Data Structures", "Testing / QA", "Agile / Scrum"],
  },
  {
    id: "data-analytics",
    label: "Data & Analytics",
    emoji: "📊",
    pillClasses: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700",
    skills: ["Data Analysis", "Excel (Advanced)", "Google Sheets", "SQL Queries", "Dashboarding", "Tableau", "Power BI", "Data Cleaning", "Data Visualization", "Statistical Analysis", "A/B Testing", "KPI Reporting", "Survey Analysis", "Forecasting"],
  },
  {
    id: "ai-automation",
    label: "AI & Automation",
    emoji: "🤖",
    pillClasses: "bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-300 dark:border-fuchsia-700",
    skills: ["Prompt Engineering", "Machine Learning", "AI Workflow Design", "Chatbot Building", "No-Code Automation", "Zapier", "Make.com", "Scripting", "Process Automation", "Model Evaluation", "AI Ethics", "Data Labeling"],
  },
  {
    id: "design-creative",
    label: "Design & Creative",
    emoji: "🎨",
    pillClasses: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700",
    skills: ["Figma", "Photoshop", "Illustrator", "Canva", "UI/UX Design", "Wireframing", "Prototyping", "User Research", "Typography", "Color Theory", "Motion Design", "Brand Design", "Sketching", "Layout Design"],
  },
  {
    id: "content-media",
    label: "Content & Media",
    emoji: "🎬",
    pillClasses: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    skills: ["Content Writing", "Copywriting", "Video Editing", "Photography", "Podcast Production", "Storyboarding", "Script Writing", "Content Planning", "Social Video", "Blogging", "Newsletter Writing", "Editing", "Interviewing"],
  },
  {
    id: "business-management",
    label: "Business & Management",
    emoji: "💼",
    pillClasses: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    skills: ["Project Management", "Strategic Planning", "Budgeting", "Team Leadership", "Operations", "Stakeholder Management", "Risk Management", "Business Analysis", "OKRs / KPIs", "Vendor Management", "Entrepreneurship", "Market Research", "Pitch Decks", "Process Improvement"],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    emoji: "🏥",
    pillClasses: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    skills: ["Patient Care", "Medical Terminology", "EHR / EMR", "HIPAA Compliance", "Clinical Research", "First Aid / CPR", "Phlebotomy", "Medical Coding", "Patient Advocacy", "Infection Control"],
  },
  {
    id: "engineering",
    label: "Engineering",
    emoji: "⚙️",
    pillClasses: "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    skills: ["CAD / CAM", "3D Modeling", "MATLAB", "Quality Control", "Lean Manufacturing", "Six Sigma", "Technical Drawing", "PLC Programming", "FEA Analysis", "Prototyping", "Systems Thinking", "Technical Documentation"],
  },
  {
    id: "marketing-sales",
    label: "Marketing & Sales",
    emoji: "📢",
    pillClasses: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    skills: ["SEO", "Content Marketing", "Google Analytics", "Email Marketing", "Lead Generation", "CRM (Salesforce/HubSpot)", "A/B Testing", "Social Media Strategy", "Copywriting", "Cold Outreach"],
  },
  {
    id: "finance-accounting",
    label: "Finance & Accounting",
    emoji: "💰",
    pillClasses: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700",
    skills: ["Financial Analysis", "QuickBooks", "Excel (Advanced)", "Bookkeeping", "Tax Preparation", "Auditing", "Financial Modeling", "Budgeting & Forecasting", "GAAP Knowledge", "Risk Assessment"],
  },
  {
    id: "people-hr",
    label: "People & HR",
    emoji: "🤝",
    pillClasses: "bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 border-lime-300 dark:border-lime-700",
    skills: ["Recruiting", "Interviewing", "Onboarding", "Employee Engagement", "Conflict Resolution", "Coaching", "Performance Reviews", "Training Facilitation", "DEI Awareness", "People Operations", "Culture Building"],
  },
  {
    id: "admin-operations",
    label: "Admin & Operations",
    emoji: "🗂️",
    pillClasses: "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700",
    skills: ["Calendar Management", "Email Management", "Documentation", "Data Entry", "Process Coordination", "Office Administration", "Meeting Notes", "Travel Planning", "Inventory Tracking", "Customer Records", "Standard Operating Procedures"],
  },
  {
    id: "education-teaching",
    label: "Education & Teaching",
    emoji: "📖",
    pillClasses: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700",
    skills: ["Curriculum Design", "Lesson Planning", "Classroom Management", "Tutoring", "E-Learning (LMS)", "Assessment Design", "Educational Technology", "Special Education", "Public Speaking", "Mentoring"],
  },
  {
    id: "legal-compliance",
    label: "Legal & Compliance",
    emoji: "⚖️",
    pillClasses: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700",
    skills: ["Contract Review", "Legal Research", "Regulatory Compliance", "GDPR / CCPA", "Intellectual Property", "Document Drafting", "Due Diligence", "Policy Writing", "Case Management", "Litigation Support"],
  },
  {
    id: "science-research",
    label: "Science & Research",
    emoji: "🔬",
    pillClasses: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700",
    skills: ["Experimental Design", "Statistical Analysis (SPSS/R)", "Lab Techniques", "Literature Review", "Data Collection", "Qualitative Research", "Quantitative Research", "Scientific Writing", "Grant Writing", "Field Research"],
  },
  {
    id: "logistics-supply-chain",
    label: "Logistics & Supply Chain",
    emoji: "🚚",
    pillClasses: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
    skills: ["Supply Planning", "Procurement", "Vendor Coordination", "Inventory Management", "Route Planning", "Warehouse Operations", "Order Fulfillment", "Demand Forecasting", "Shipping Documentation", "Quality Checks"],
  },
  {
    id: "sustainability-environment",
    label: "Sustainability",
    emoji: "🌱",
    pillClasses: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
    skills: ["Environmental Research", "Waste Reduction", "Sustainability Reporting", "Community Outreach", "Climate Literacy", "Recycling Programs", "Energy Audits", "Impact Measurement", "Policy Research", "Grant Research"],
  },
  {
    id: "trades-manual",
    label: "Trades & Manual",
    emoji: "🔧",
    pillClasses: "bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700",
    skills: ["Electrical Wiring", "Plumbing", "Carpentry", "Welding", "HVAC", "Automotive Repair", "CNC Operation", "Equipment Maintenance", "Safety Compliance (OSHA)", "Forklift Operation"],
  },
  {
    id: "hospitality-service",
    label: "Hospitality & Service",
    emoji: "🍽️",
    pillClasses: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700",
    skills: ["Customer Service", "POS Systems", "Food Safety (HACCP)", "Event Planning", "Conflict Resolution", "Reservation Management", "Barista Skills", "Inventory Management", "Team Training", "Upselling"],
  },
];

/**
 * Looks up a skill category by its id.
 * @param id - Category slug, e.g. "programming-tech".
 * @returns The matching category or undefined.
 */
export function getCategoryById(id: string): SkillCategory | undefined {
  return SKILL_CATEGORIES.find((c) => c.id === id);
}

/** @deprecated Use SKILL_CATEGORIES for structured skill browsing. */
export const COMMON_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "SQL", "Excel",
  "Project Management", "Figma", "Data Analysis", "Public Speaking",
  "Git", "Docker", "AWS", "Machine Learning", "Agile / Scrum",
  "Customer Service", "Sales", "Content Writing", "SEO", "Photoshop",
];
