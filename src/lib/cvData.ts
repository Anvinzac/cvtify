/* ------------------------------------------------------------------
 * CV CONTENT — the single source of truth for the whole site.
 * Everything below is SAMPLE / PLACEHOLDER content. Replace the text
 * and the photo `src` values with your own.
 *
 * Swapping a photo is a one-line change:
 *   1) Remote URL  -> src: "https://your-cdn.com/photo.jpg"
 *   2) Local file  -> import shot from "@/assets/shot.jpg";  src: shot
 *
 * Placeholder photos use picsum.photos (always loads, seed-stable).
 * ------------------------------------------------------------------ */

/** Build a deterministic placeholder image URL. */
const ph = (seed: string, w = 1600, h = 1000) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

export interface Stage {
  id: string;
  chapter: string;
  role: string;
  org: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  skills: string[];
  photos: Photo[];
  /** Optional per-stage accent (any CSS color). Falls back to the theme gold. */
  accent?: string;
}

export interface SkillGroup {
  title: string;
  items: { name: string; level: number }[]; // level: 0–100
}

export interface CVData {
  name: string;
  role: string;
  tagline: string;
  location: string;
  availability: string;
  focus: string;
  stats: { label: string; value: string }[];
  heroPhoto: Photo;
  manifesto: string;
  experience: Stage[];
  skillGroups: SkillGroup[];
  values: { title: string; text: string }[];
  gallery: Photo[];
  contact: {
    email: string;
    resumeHref: string;
    links: { label: string; href: string }[];
  };
}

export const cv: CVData = {
  name: "Alex Rivera",
  role: "Product Designer & Creative Technologist",
  tagline:
    "I turn messy human problems into calm, considered products — and I document the journey frame by frame.",
  location: "Lisbon, Portugal",
  availability: "Open to senior & lead roles",
  focus: "Design systems · Motion · Front-end",
  stats: [
    { label: "Years crafting", value: "8+" },
    { label: "Products shipped", value: "40+" },
    { label: "Teams led", value: "6" },
    { label: "Awards", value: "4" },
  ],
  heroPhoto: {
    src: ph("alex-hero-portrait", 1800, 1200),
    alt: "Alex Rivera at work in a sunlit studio",
  },
  manifesto:
    "I believe the best work happens at the seam between design and engineering — where a sketch becomes something you can touch, and a product becomes something people trust. This is the story of how I got here: the studios, the late nights, the detours, and the craft that tied it all together.",
  experience: [
    {
      id: "studio-nove",
      chapter: "Chapter 01",
      role: "Junior Designer",
      org: "Studio Nove",
      period: "2016 — 2017",
      location: "Porto, PT",
      summary:
        "My first studio. I learned that craft is repetition with intention — typesetting, grid work, and shipping small things every single week.",
      highlights: [
        "Shipped 20+ brand & print projects end to end",
        "Built the studio's first reusable layout kit",
      ],
      skills: ["Typography", "Layout", "Brand", "Print"],
      accent: "#e0a458",
      photos: [
        { src: ph("stage1-desk"), alt: "Designer's desk with sketches and type specimens" },
        { src: ph("stage1-print"), alt: "Freshly printed posters drying on a rack" },
        { src: ph("stage1-studio"), alt: "Small studio team reviewing work on a wall" },
      ],
    },
    {
      id: "freelance",
      chapter: "Chapter 02",
      role: "Freelance Product Designer",
      org: "Self-employed",
      period: "2017 — 2019",
      location: "Lisbon, PT",
      summary:
        "Going independent taught me the whole shape of a project: scoping, pitching, designing, and — for the first time — building what I designed.",
      highlights: [
        "Partnered with 15+ startups across fintech & culture",
        "Learned front-end to ship my own prototypes",
      ],
      skills: ["Product Design", "Prototyping", "Client Strategy", "HTML/CSS"],
      accent: "#d98b6a",
      photos: [
        { src: ph("stage2-laptop"), alt: "Laptop open to a design tool in a cafe" },
        { src: ph("stage2-sketchbook"), alt: "Sketchbook full of wireframes and flows" },
        { src: ph("stage2-workshop"), alt: "Running a workshop with sticky notes on glass" },
      ],
    },
    {
      id: "lumen-labs",
      chapter: "Chapter 03",
      role: "Product Designer",
      org: "Lumen Labs",
      period: "2019 — 2021",
      location: "Lisbon, PT",
      summary:
        "Joined a product team at last. I owned a surface end to end, ran research, and discovered how much design is really about listening.",
      highlights: [
        "Led redesign that lifted activation by 34%",
        "Introduced the team's first usability testing cadence",
      ],
      skills: ["UX Research", "Interaction Design", "Analytics", "Collaboration"],
      accent: "#8fb6a8",
      photos: [
        { src: ph("stage3-team"), alt: "Product team gathered around a screen" },
        { src: ph("stage3-whiteboard"), alt: "Whiteboard covered in journey maps" },
        { src: ph("stage3-testing"), alt: "Usability testing session in progress" },
      ],
    },
    {
      id: "atlas-health",
      chapter: "Chapter 04",
      role: "Senior Product Designer",
      org: "Atlas Health",
      period: "2021 — 2023",
      location: "Remote",
      summary:
        "Scaled a design system across four squads and mentored juniors. Accessibility stopped being a checklist and became a point of pride.",
      highlights: [
        "Built a design system used by 40+ engineers",
        "Reached WCAG AA across core patient flows",
      ],
      skills: ["Design Systems", "Accessibility", "Mentorship", "Art Direction"],
      accent: "#a9b7d6",
      photos: [
        { src: ph("stage4-system"), alt: "Design system components laid out on a grid" },
        { src: ph("stage4-remote"), alt: "Remote setup with video call on screen" },
        { src: ph("stage4-review"), alt: "Design review with annotated screens" },
      ],
    },
    {
      id: "northstar",
      chapter: "Chapter 05",
      role: "Design Lead & Creative Technologist",
      org: "Northstar",
      period: "2023 — Present",
      location: "Lisbon, PT",
      summary:
        "Today I lead a small team at the edge of design and code — prototyping in the browser, shipping motion that means something, and telling the story.",
      highlights: [
        "Lead a cross-functional team of 7",
        "Shipped an award-winning product site & motion language",
      ],
      skills: ["Leadership", "Motion Design", "Front-end (React)", "Storytelling"],
      accent: "#e8c46a",
      photos: [
        { src: ph("stage5-motion"), alt: "Motion design frames on a timeline" },
        { src: ph("stage5-code"), alt: "Code editor beside a design canvas" },
        { src: ph("stage5-stage"), alt: "Presenting work on a large stage screen" },
      ],
    },
  ],
  skillGroups: [
    {
      title: "Design & Craft",
      items: [
        { name: "Product Design", level: 94 },
        { name: "Design Systems", level: 90 },
        { name: "Typography", level: 84 },
        { name: "Prototyping", level: 88 },
      ],
    },
    {
      title: "Technical",
      items: [
        { name: "Front-end (React / TS)", level: 80 },
        { name: "Motion & Interaction", level: 86 },
        { name: "Accessibility", level: 83 },
        { name: "Design APIs / Tokens", level: 76 },
      ],
    },
    {
      title: "Leadership",
      items: [
        { name: "Art Direction", level: 87 },
        { name: "Mentorship", level: 82 },
        { name: "Stakeholder Comms", level: 89 },
        { name: "Research", level: 75 },
      ],
    },
  ],
  values: [
    {
      title: "Curiosity first",
      text: "Every project starts with questions, not answers. I'd rather understand the problem too well than solve the wrong one quickly.",
    },
    {
      title: "Craft with intent",
      text: "Details are decisions. Spacing, easing, a well-set headline — they add up to whether something feels trustworthy.",
    },
    {
      title: "People over pixels",
      text: "Design is a service to the person on the other side of the screen. Accessibility and clarity are never optional extras.",
    },
    {
      title: "Ship and learn",
      text: "A launched imperfect thing teaches more than a perfect thing in a draft. I build, measure, and iterate in the open.",
    },
  ],
  gallery: [
    { src: ph("gallery-1", 900, 1200), alt: "Studio still life with design tools" },
    { src: ph("gallery-2", 900, 700), alt: "City skyline at dusk" },
    { src: ph("gallery-3", 900, 1000), alt: "Close-up of a sketchbook page" },
    { src: ph("gallery-4", 900, 800), alt: "Team laughing during an offsite" },
    { src: ph("gallery-5", 900, 1100), alt: "Hands typing on a keyboard" },
    { src: ph("gallery-6", 900, 900), alt: "Abstract light and shadow study" },
  ],
  contact: {
    email: "hello@alexrivera.design",
    resumeHref: "/cv.pdf",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Portfolio", href: "https://dribbble.com/" },
      { label: "GitHub", href: "https://github.com/" },
    ],
  },
};

/** Convenience: the most recent stage, used for the hero's "now" framing. */
export const currentStage: Stage = cv.experience[cv.experience.length - 1];
