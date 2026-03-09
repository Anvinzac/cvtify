import { Activity, DreamJob } from "./data";

const STORAGE_KEY = "skillcompass_draft";

export interface DraftData {
  selectedCategories: string[];
  activities: Activity[];
  hobbies: string[];
  favoritedJobs: string[];
}

export function loadDraft(): DraftData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { selectedCategories: [], activities: [], hobbies: [], favoritedJobs: [] };
}

export function saveDraft(data: DraftData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}
