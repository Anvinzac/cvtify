import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Activity } from "@/lib/data";
import { DraftData, loadDraft, saveDraft } from "@/lib/storage";

interface AppState extends DraftData {
  setSelectedCategories: (cats: string[]) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  setHobbies: (hobbies: string[]) => void;
  toggleFavoriteJob: (jobId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DraftData>(loadDraft);

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

  return (
    <AppContext.Provider
      value={{ ...data, setSelectedCategories, addActivity, removeActivity, setHobbies, toggleFavoriteJob }}
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
