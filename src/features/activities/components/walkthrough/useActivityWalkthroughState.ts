/**
 * Walkthrough state and handlers — extracted from the orchestrator component.
 */

import { useState, useCallback, MouseEvent } from "react";
import type { Activity, Category } from "@/features/activities/types";

interface UseActivityWalkthroughStateArgs {
  category: Category;
  initialActivity?: Activity;
  onComplete: (activity: Activity) => void;
}

/** Manages all walkthrough form state, validation, and step transitions. */
export function useActivityWalkthroughState({
  category,
  initialActivity,
  onComplete,
}: UseActivityWalkthroughStateArgs) {
  const isEditing = !!initialActivity;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialActivity?.name ?? "");
  const [groupSize, setGroupSize] = useState(initialActivity?.groupSize ?? "");
  const [duration, setDuration] = useState(initialActivity?.duration ?? "");
  const [taskTypes, setTaskTypes] = useState<string[]>(initialActivity?.taskTypes ?? []);
  const [skills, setSkills] = useState<string[]>(initialActivity?.skills ?? []);
  const [values, setValues] = useState<string[]>(initialActivity?.values ?? []);
  const [notes, setNotes] = useState(initialActivity?.personalNotes ?? "");
  const [occurredAt, setOccurredAt] = useState<number | undefined>(initialActivity?.occurredAt);
  const [datePrecision, setDatePrecision] = useState<"year" | "month" | undefined>(
    initialActivity?.datePrecision
  );
  const initialDate = initialActivity?.occurredAt ? new Date(initialActivity.occurredAt) : null;
  const [whenYear, setWhenYear] = useState<number | null>(
    initialDate ? initialDate.getFullYear() : null
  );
  const [whenMonth, setWhenMonth] = useState<number | null>(
    initialDate && initialActivity?.datePrecision !== "year" ? initialDate.getMonth() : null
  );
  const [isCustomName, setIsCustomName] = useState(
    initialActivity ? !category.examples.includes(initialActivity.name) : false
  );
  const [explainMode, setExplainMode] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

  const autoAdvance = useCallback((nextStep: number) => {
    setTimeout(() => setStep(nextStep), 300);
  }, []);

  const toggleIn = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const emitBurst = (e: MouseEvent) => {
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
  };
  const settleBurst = (id: number) => setBursts((b) => b.filter((bx) => bx.id !== id));

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return groupSize.length > 0;
    if (step === 2) return duration.length > 0;
    if (step === 3) return true;
    if (step === 4) return taskTypes.length > 0;
    if (step === 5) return skills.length > 0;
    return true;
  };

  const handleFinish = () => {
    setCelebrating(true);
    const activity: Activity = {
      id: initialActivity?.id ?? Date.now().toString(),
      categoryId: category.id,
      name: name.trim(),
      groupSize,
      duration,
      taskTypes,
      skills,
      values,
      personalNotes: notes,
      occurredAt,
      datePrecision,
    };
    setTimeout(() => onComplete(activity), 800);
  };

  const handleBack = (onClose: () => void) => {
    if (step === 0) onClose();
    else setStep(step - 1);
  };

  const handleToggleYear = (y: number, expanded: boolean, maxMonth: number) => {
    if (expanded) {
      setWhenYear(null);
    } else {
      setWhenYear(y);
      if (whenMonth !== null && whenMonth <= maxMonth) {
        setOccurredAt(new Date(y, whenMonth, 1).getTime());
      } else {
        setWhenMonth(null);
      }
    }
  };

  const handleSelectMonth = (y: number, i: number) => {
    setWhenMonth(i);
    setOccurredAt(new Date(y, i, 1).getTime());
    setDatePrecision("month");
    autoAdvance(4);
  };

  const handleSkipOrConfirmWhen = () => {
    if (whenYear !== null) {
      setWhenMonth(null);
      setOccurredAt(new Date(whenYear, 11, 31).getTime());
      setDatePrecision("year");
    } else {
      setWhenYear(null);
      setWhenMonth(null);
      setOccurredAt(undefined);
      setDatePrecision(undefined);
    }
    autoAdvance(4);
  };

  const toggleTaskType = (t: string) => toggleIn(taskTypes, setTaskTypes, t);
  const toggleSkill = (skill: string, e?: MouseEvent) => {
    if (e && !skills.includes(skill)) emitBurst(e);
    toggleIn(skills, setSkills, skill);
  };
  const toggleValue = (value: string, e?: MouseEvent) => {
    if (e && !values.includes(value)) emitBurst(e);
    toggleIn(values, setValues, value);
  };

  return {
    isEditing,
    step,
    setStep,
    name,
    setName,
    groupSize,
    setGroupSize,
    duration,
    setDuration,
    taskTypes,
    skills,
    values,
    notes,
    setNotes,
    whenYear,
    whenMonth,
    isCustomName,
    setIsCustomName,
    explainMode,
    setExplainMode,
    celebrating,
    bursts,
    settleBurst,
    autoAdvance,
    canNext,
    handleFinish,
    handleBack,
    handleToggleYear,
    handleSelectMonth,
    handleSkipOrConfirmWhen,
    toggleTaskType,
    toggleSkill,
    toggleValue,
  };
}
