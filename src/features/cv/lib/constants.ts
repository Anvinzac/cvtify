/**
 * Copy, tone presets, and skill taxonomy constants for the CV builder UI.
 *
 * Exports: SUMMARY_PLACEHOLDERS, PROOF_PLACEHOLDERS, SUMMARY_TONES, SKILL_FIELD_SECTIONS
 * Depends on: none
 */

export const SUMMARY_PLACEHOLDERS = [
  "Curious computer-science student turning messy problems into clean React tools…",
  "Designer-marketer hybrid who ships fast and ships kind…",
  "Operations lead with eight years of building calm systems out of busy ones…",
  "Career-changer trading legal research for product work — empathetic, exacting, and shipping…",
];

export const PROOF_PLACEHOLDERS = [
  "Trained 4 new baristas, rewrote the closing checklist, and cut weekend stockouts by half…",
  "Led a 6-person design sprint that shipped the v2 onboarding — engagement up 22%…",
  "Built a small Python script that saved the team ~3 hours a week on reporting…",
];

export const SUMMARY_TONES = [
  {
    id: "confident",
    label: "Confident",
    emoji: "🔥",
    template:
      "Results-driven professional with proven experience delivering impact across teams. I combine sharp execution with clear communication to help organizations move faster on what matters most.",
  },
  {
    id: "curious",
    label: "Curious",
    emoji: "🌱",
    template:
      "Curious learner energized by hard problems and new tools. I enjoy building things that are useful end-to-end — from research to shipping — and asking why one more time than feels comfortable.",
  },
  {
    id: "concise",
    label: "Concise",
    emoji: "✂️",
    template:
      "Generalist who ships. Strong at communication, decision-making, and turning unclear briefs into useful work.",
  },
  {
    id: "story",
    label: "Story",
    emoji: "📖",
    template:
      "Started in customer support, fell in love with the systems behind the conversations, and have been building them ever since. Today I help teams turn chaotic data into decisions people actually use.",
  },
];

export const SKILL_FIELD_SECTIONS = [
  {
    id: "digital",
    label: "Digital",
    categoryIds: ["programming-tech", "data-analytics", "ai-automation"],
  },
  {
    id: "creative",
    label: "Creative",
    categoryIds: ["design-creative", "content-media", "marketing-sales"],
  },
  {
    id: "business",
    label: "Business",
    categoryIds: ["business-management", "finance-accounting", "admin-operations", "people-hr"],
  },
  {
    id: "specialized",
    label: "Specialized",
    categoryIds: ["healthcare", "engineering", "legal-compliance", "science-research"],
  },
  {
    id: "fieldwork",
    label: "Fieldwork",
    categoryIds: ["logistics-supply-chain", "sustainability-environment", "trades-manual", "hospitality-service", "education-teaching"],
  },
];
