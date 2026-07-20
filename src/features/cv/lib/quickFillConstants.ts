/**
 * Labels and sample text for QuickFillCard paste parsing.
 *
 * Exports: QUICK_FILL_FIELD_LABELS, QUICK_FILL_SAMPLE_PASTE
 * Depends on: @/features/cv/types
 */

import type { CvPersonalInfo } from "@/features/cv/types";

export const QUICK_FILL_FIELD_LABELS: Record<keyof CvPersonalInfo, string> = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  location: "Location",
  linkedin: "LinkedIn",
  website: "Website",
};

export const QUICK_FILL_SAMPLE_PASTE = `Alex Chen
alex.chen@email.com · +1 (555) 234-5678
San Francisco, CA · linkedin.com/in/alexchen · alexchen.design

Computer science student & part-time barista. Building tools that help small teams move faster.`;
