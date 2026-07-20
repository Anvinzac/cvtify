/**
 * Generic className merge helper for Tailwind / CVA components.
 *
 * Exports: `cn` — merges conditional class names with tailwind-merge conflict resolution.
 * Depends on: clsx, tailwind-merge
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class name inputs, resolving Tailwind utility conflicts.
 * @param inputs - Class values accepted by clsx (strings, arrays, conditionals)
 * @returns A single className string safe to pass to DOM elements
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
