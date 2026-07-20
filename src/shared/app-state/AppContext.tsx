/**
 * Global app state — React context over the local draft persistence layer.
 *
 * Exports: AppProvider, useAppState
 * Depends on: @/shared/api-client/draftStorage, @/shared/app-state/backfillOccurredAt
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Activity } from "@/features/activities/types";
import type { CvData } from "@/features/cv/types";
import { DraftData, loadDraft, saveDraft } from "@/shared/api-client/draftStorage";
import { backfillOccurredAt } from "@/shared/app-state/backfillOccurredAt";

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

/** Provides draft-backed global state and syncs changes to localStorage. */
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

/** Reads the global app state; throws when used outside AppProvider. */
export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
