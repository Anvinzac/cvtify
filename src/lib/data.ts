import { Briefcase, Heart, Users, Lightbulb, Palette, Building2, LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  emoji: string;
  description: string;
  examples: string[];
  color: string;
}

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

export const GROUP_SIZES = [
  "Solo (just me)",
  "Small team (2-5 people)",
  "Medium group (6-15 people)",
  "Large team (16-50 people)",
  "Organization (50+ people)",
];

export const DURATION_OPTIONS = [
  "Less than a month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "More than a year",
];

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

export interface Activity {
  id: string;
  categoryId: string;
  name: string;
  groupSize: string;
  duration: string;
  taskTypes: string[];
  skills: string[];
  values: string[];
  personalNotes: string;
}

export interface DreamJob {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  values: string[];
  salary: string;
  location: string;
  tags: string[];
  isFavorited?: boolean;
}

export const SAMPLE_JOBS: DreamJob[] = [
  {
    id: "j1",
    title: "UX Designer",
    company: "Creative Studio Co.",
    description: "Design user-centered digital experiences for mobile and web platforms.",
    requiredSkills: ["Creativity", "Communication", "Problem Solving", "Empathy", "Attention to Detail"],
    values: ["Creative expression", "Innovation", "Helping others"],
    salary: "$55,000 - $75,000",
    location: "Remote / Hybrid",
    tags: ["Design", "Tech", "Creative"],
  },
  {
    id: "j2",
    title: "Community Manager",
    company: "Impact Foundation",
    description: "Build and nurture communities around social impact initiatives.",
    requiredSkills: ["Communication", "Empathy", "Leadership", "Networking", "Public Speaking"],
    values: ["Social impact", "Helping others", "Recognition & achievement"],
    salary: "$40,000 - $55,000",
    location: "On-site, Various Cities",
    tags: ["Social", "Community", "Leadership"],
  },
  {
    id: "j3",
    title: "Product Manager",
    company: "TechStart Inc.",
    description: "Lead product development from ideation to launch in a fast-paced startup.",
    requiredSkills: ["Leadership", "Critical Thinking", "Communication", "Decision Making", "Problem Solving"],
    values: ["Innovation", "Recognition & achievement", "Freedom & autonomy"],
    salary: "$70,000 - $100,000",
    location: "San Francisco, CA",
    tags: ["Tech", "Leadership", "Strategy"],
  },
  {
    id: "j4",
    title: "Content Strategist",
    company: "Media House",
    description: "Develop content strategies that engage audiences across multiple platforms.",
    requiredSkills: ["Creativity", "Communication", "Critical Thinking", "Attention to Detail", "Adaptability"],
    values: ["Creative expression", "Knowledge & learning", "Freedom & autonomy"],
    salary: "$45,000 - $65,000",
    location: "Remote",
    tags: ["Creative", "Writing", "Strategy"],
  },
  {
    id: "j5",
    title: "Data Analyst",
    company: "Analytics Corp.",
    description: "Transform data into actionable insights for business decisions.",
    requiredSkills: ["Critical Thinking", "Problem Solving", "Attention to Detail", "Decision Making", "Communication"],
    values: ["Knowledge & learning", "Financial independence", "Stability & security"],
    salary: "$60,000 - $85,000",
    location: "New York, NY",
    tags: ["Tech", "Analysis", "Business"],
  },
  {
    id: "j6",
    title: "Event Coordinator",
    company: "Eventful Agency",
    description: "Plan and execute memorable events from corporate conferences to community gatherings.",
    requiredSkills: ["Time Management", "Communication", "Leadership", "Problem Solving", "Networking"],
    values: ["Creative expression", "Helping others", "Recognition & achievement"],
    salary: "$35,000 - $50,000",
    location: "Various Locations",
    tags: ["Events", "Social", "Creative"],
  },
];

export const SAMPLE_EVENTS = [
  {
    id: "e1",
    title: "Design Thinking Workshop",
    host: "Creative Lab Academy",
    date: "Mar 25, 2026",
    time: "2:00 PM - 5:00 PM",
    location: "Online (Zoom)",
    tags: ["Creativity", "Problem Solving", "Design"],
    type: "event" as const,
  },
  {
    id: "e2",
    title: "Youth Leadership Summit",
    host: "Global Youth Network",
    date: "Apr 10-12, 2026",
    time: "All Day",
    location: "Convention Center, Downtown",
    tags: ["Leadership", "Networking", "Public Speaking"],
    type: "event" as const,
  },
  {
    id: "e3",
    title: "Community Garden Project",
    host: "Green Earth Initiative",
    date: "Ongoing, Weekends",
    time: "9:00 AM - 12:00 PM",
    location: "City Park",
    tags: ["Teamwork", "Social impact", "Helping others"],
    type: "project" as const,
  },
  {
    id: "e4",
    title: "Freelance Writing Bootcamp",
    host: "Writers Guild Online",
    date: "Apr 1 - May 1, 2026",
    time: "Self-paced",
    location: "Online",
    tags: ["Communication", "Creative expression", "Writing"],
    type: "event" as const,
  },
];

export const HOBBY_OPTIONS = [
  "Drawing & Illustration",
  "Photography",
  "Music (Instrument)",
  "Singing",
  "Dance",
  "Writing & Poetry",
  "Film & Video",
  "Graphic Design",
  "Cooking & Baking",
  "Crafts & DIY",
  "Gaming",
  "Sports & Fitness",
  "Theater & Acting",
  "Fashion & Styling",
  "Podcasting",
  "Coding & Tech Projects",
];
