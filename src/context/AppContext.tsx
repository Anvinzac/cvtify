import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Activity } from "@/lib/data";
import { DraftData, loadDraft, saveDraft, CvData } from "@/lib/storage";

/**
 * Backfill `occurredAt` for any legacy activities that don't have one.
 * Spreads them evenly across the previous 3 years based on creation order,
 * so the timeline view has visual depth across months/years.
 * Deterministic — same input always produces same output.
 */
function backfillOccurredAt(activities: Activity[]): Activity[] {
  if (activities.length === 0) return activities;
  if (activities.every((a) => typeof a.occurredAt === "number")) return activities;

  // Sort by numeric id when possible (real activities use Date.now().toString()),
  // falling back to original array order for non-numeric ids (e.g. "mock-1").
  const idIndex = new Map(activities.map((a, i) => [a.id, i]));
  const sortKey = (a: Activity): number => {
    const n = Number(a.id);
    return Number.isFinite(n) ? n : (idIndex.get(a.id) ?? 0);
  };
  const sorted = [...activities].sort((a, b) => sortKey(a) - sortKey(b));

  const now = Date.now();
  const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
  const start = now - threeYears;
  const span = threeYears - 30 * 24 * 60 * 60 * 1000; // keep newest at least 1mo back

  // Deterministic per-id jitter (0-25 days), works for any id string.
  const hashJitter = (id: string): number => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h % 25) * 24 * 60 * 60 * 1000;
  };

  const byId = new Map<string, number>();
  sorted.forEach((act, i) => {
    if (typeof act.occurredAt === "number") {
      byId.set(act.id, act.occurredAt);
      return;
    }
    const ratio = sorted.length === 1 ? 1 : i / (sorted.length - 1);
    const ts = start + Math.round(ratio * span) + hashJitter(act.id);
    byId.set(act.id, ts);
  });

  return activities.map((a) => ({
    ...a,
    occurredAt: typeof a.occurredAt === "number" ? a.occurredAt : byId.get(a.id),
  }));
}

interface AppState extends DraftData {
  setSelectedCategories: (cats: string[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  setHobbies: (hobbies: string[]) => void;
  toggleFavoriteJob: (jobId: string) => void;
  setCvData: (cv: CvData) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DraftData>(() => {
    const raw = loadDraft();
    return { ...raw, activities: backfillOccurredAt(raw.activities) };
  });

  useEffect(() => {
    saveDraft(data);
  }, [data]);

  const setSelectedCategories = (cats: string[]) =>
    setData((d) => ({ ...d, selectedCategories: cats }));

  const addActivity = (activity: Activity) =>
    setData((d) => ({
      ...d,
      activities: [...d.activities, activity],
      selectedCategories: d.selectedCategories.includes(activity.categoryId)
        ? d.selectedCategories
        : [...d.selectedCategories, activity.categoryId],
    }));

  const updateActivity = (activity: Activity) =>
    setData((d) => ({ ...d, activities: d.activities.map((a) => a.id === activity.id ? activity : a) }));

  const removeActivity = (id: string) =>
    setData((d) => ({ ...d, activities: d.activities.filter((a) => a.id !== id) }));

  const setHobbies = (hobbies: string[]) =>
    setData((d) => ({ ...d, hobbies }));

  const toggleFavoriteJob = (jobId: string) =>
    setData((d) => ({
      ...d,
      favoritedJobs: d.favoritedJobs.includes(jobId)
        ? d.favoritedJobs.filter((j) => j !== jobId)
        : [...d.favoritedJobs, jobId],
    }));

  const setCvData = (cv: CvData) =>
    setData((d) => ({ ...d, cv }));

  return (
    <AppContext.Provider
      value={{ ...data, setSelectedCategories, addActivity, updateActivity, removeActivity, setHobbies, toggleFavoriteJob, setCvData }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
