/**
 * Activity feature — static catalog data for categories and walkthrough options.
 */

import { Briefcase, Heart, Users, Lightbulb, Palette, Building2 } from "lucide-react";
import type { Category } from "../types";

/** All activity categories available in the grid and walkthrough. */
export const CATEGORIES: Category[] = [
  {
    id: "home-business",
    name: "Home Business Involvement",
    icon: Briefcase,
    emoji: "🏠",
    description: "Family or personal business ventures",
    examples: ["Helped run family store", "Online reselling", "Freelance crafting", "Tutoring from home"],
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "social-works",
    name: "Social Works",
    icon: Heart,
    emoji: "💛",
    description: "Volunteering and community service",
    examples: ["Charity events", "NGO volunteering", "Community clean-ups", "Fundraising campaigns"],
    color: "from-rose-400 to-pink-500",
  },
  {
    id: "part-time",
    name: "Part-Time Jobs",
    icon: Users,
    emoji: "⏰",
    description: "Paid work alongside studies",
    examples: ["Barista", "Retail assistant", "Delivery rider", "Content creator"],
    color: "from-sky-400 to-blue-500",
  },
  {
    id: "projects-internship",
    name: "Projects & Internship",
    icon: Lightbulb,
    emoji: "💡",
    description: "Academic or professional projects",
    examples: ["Research project", "Summer internship", "Startup pitch", "Hackathon"],
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "extra-curriculum",
    name: "Extra-Curriculum",
    icon: Palette,
    emoji: "🎭",
    description: "Clubs, sports, and activities",
    examples: ["Debate club", "Sports team", "Student council", "Music band"],
    color: "from-violet-400 to-purple-500",
  },
  {
    id: "professional",
    name: "Professional Environment",
    icon: Building2,
    emoji: "🏢",
    description: "Corporate or formal work experience",
    examples: ["Office assistant", "Corporate intern", "Lab technician", "Teaching assistant"],
    color: "from-slate-400 to-gray-600",
  },
  {
    id: "supplemental-education",
    name: "Supplemental Education",
    icon: Lightbulb,
    emoji: "📚",
    description: "Classes, certificates, and courses",
    examples: ["Online course", "Certification program", "Workshop", "Language class"],
    color: "from-indigo-400 to-blue-600",
  },
];

/** Team size options in the walkthrough. */
export const GROUP_SIZES = [
  "Solo (just me)",
  "Small team (2-5 people)",
  "Medium group (6-15 people)",
  "Large team (16-50 people)",
  "Organization (50+ people)",
];

/** Duration options in the walkthrough. */
export const DURATION_OPTIONS = [
  "Less than a month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "More than a year",
];

/** Task type chips in the walkthrough. */
export const TASK_TYPES = [
  "Planning & Strategy",
  "Communication & Outreach",
  "Creative & Design",
  "Technical & IT",
  "Leadership & Management",
  "Research & Analysis",
  "Teaching & Mentoring",
  "Customer Service",
  "Operations & Logistics",
  "Finance & Budgeting",
  "Writing & Documentation",
  "Problem Solving",
];

/** Skill chips in the discovery step. */
export const SKILLS_OPTIONS = [
  "Teamwork",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Creativity",
  "Time Management",
  "Adaptability",
  "Critical Thinking",
  "Public Speaking",
  "Negotiation",
  "Empathy",
  "Resilience",
  "Attention to Detail",
  "Decision Making",
  "Networking",
  "Self-Discipline",
];

/** Life value chips in the discovery step. */
export const VALUES_OPTIONS = [
  "Helping others",
  "Financial independence",
  "Creative expression",
  "Knowledge & learning",
  "Work-life balance",
  "Social impact",
  "Recognition & achievement",
  "Freedom & autonomy",
  "Stability & security",
  "Innovation",
];
