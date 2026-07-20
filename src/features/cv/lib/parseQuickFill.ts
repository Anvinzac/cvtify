/**
 * Best-effort parsing of pasted identity text (signatures, LinkedIn About, etc.).
 *
 * Exports: QuickFillResult, parseQuickFill
 * Depends on: @/features/cv/types (CvPersonalInfo)
 */

import type { CvPersonalInfo } from "@/features/cv/types";

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{8,}\d)/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/i;
const URL_RE =
  /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]+\.(?:com|net|org|io|dev|me|co|app|design|art|studio|page|xyz|tech|info|site|portfolio)(?:\/[\w./?#&=%-]*)?)\b/i;
const CITY_RE =
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}),\s*([A-Z]{2,}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/;

const STOP_WORDS = new Set([
  "About",
  "Skills",
  "Experience",
  "Summary",
  "Education",
  "Contact",
  "Hello",
  "Hi",
  "Hey",
  "Profile",
  "Resume",
  "CV",
]);

/** Parsed personal-info fields plus which keys were confidently extracted. */
export interface QuickFillResult {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  /** Field names that were actually extracted (drives the UI summary). */
  filled: (keyof CvPersonalInfo)[];
}

/**
 * Best-effort parse of a free-form paste (LinkedIn About, email signature,
 * resume header, "Hi I'm Alex Chen — alex@example.com, +1 555 234 5678…").
 * Returns only the fields we're confident about.
 * @param text - Raw pasted identity text.
 * @returns Partial personal info and a list of filled field keys.
 */
export function parseQuickFill(text: string): QuickFillResult {
  const result: QuickFillResult = { filled: [] };
  if (!text.trim()) return result;

  const email = text.match(EMAIL_RE)?.[0];
  if (email) {
    result.email = email;
    result.filled.push("email");
  }

  const linkedin = text.match(LINKEDIN_RE)?.[0];
  if (linkedin) {
    result.linkedin = linkedin.replace(/^https?:\/\/(www\.)?/i, "");
    result.filled.push("linkedin");
  }

  const urls = Array.from(text.matchAll(new RegExp(URL_RE, "gi")))
    .map((m) => m[1])
    .filter((u) => !/linkedin\.com/i.test(u))
    .filter((u) => !email || !email.endsWith(u.replace(/^https?:\/\/(www\.)?/i, "")));
  if (urls.length > 0) {
    result.website = urls[0].replace(/^https?:\/\/(www\.)?/i, "");
    result.filled.push("website");
  }

  const safeText = email ? text.replace(email, " ") : text;
  const phone = safeText.match(PHONE_RE)?.[0];
  if (phone) {
    result.phone = phone.replace(/\s+/g, " ").trim();
    result.filled.push("phone");
  }

  const loc = text.match(CITY_RE);
  if (loc) {
    result.location = `${loc[1]}, ${loc[2]}`;
    result.filled.push("location");
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (/@|https?:|\d/.test(line)) continue;
    if (line.length > 60) continue;
    const cleaned = line
      .replace(/^(?:hi|hello|hey|i['']?m|my name is|this is)\s*[,:!\-—]?\s*/i, "")
      .replace(/[,.!—-].*$/, "")
      .trim();
    const tokens = cleaned.split(/\s+/);
    if (tokens.length >= 1 && tokens.length <= 4) {
      const allCap = tokens.every(
        (t) => /^[A-Z][A-Za-z'-]+$/.test(t) && !STOP_WORDS.has(t)
      );
      if (allCap) {
        result.fullName = tokens.join(" ");
        result.filled.push("fullName");
        break;
      }
    }
  }

  return result;
}
