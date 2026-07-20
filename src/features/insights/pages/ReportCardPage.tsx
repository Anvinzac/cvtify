/**
 * Insights feature — personalized report card from activity data.
 *
 * Exports: ReportCardPage (default)
 * Depends on: @/shared/app-state/AppContext, report section components, BottomNav
 */

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAppState } from "@/shared/app-state/AppContext";
import { BottomNav } from "@/shared/components/BottomNav";
import ScrollProgress from "@/shared/components/fx/ScrollProgress";
import { ReportEmptyState } from "@/features/insights/components/report/ReportEmptyState";
import { ReportSkillsSection } from "@/features/insights/components/report/ReportSkillsSection";
import { ReportValuesSection } from "@/features/insights/components/report/ReportValuesSection";
import { ReportStrengthsSection } from "@/features/insights/components/report/ReportStrengthsSection";
import { ReportHobbiesSection } from "@/features/insights/components/report/ReportHobbiesSection";

export default function ReportCardPage() {
  const navigate = useNavigate();
  const { activities, hobbies, setHobbies } = useAppState();

  const allSkills: Record<string, number> = {};
  const allValues: Record<string, number> = {};
  const allTasks: Record<string, number> = {};

  activities.forEach((a) => {
    a.skills.forEach((s) => (allSkills[s] = (allSkills[s] || 0) + 1));
    a.values.forEach((v) => (allValues[v] = (allValues[v] || 0) + 1));
    a.taskTypes.forEach((t) => (allTasks[t] = (allTasks[t] || 0) + 1));
  });

  const topSkills = Object.entries(allSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const topValues = Object.entries(allValues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topTasks = Object.entries(allTasks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const toggleHobby = (h: string) =>
    setHobbies(hobbies.includes(h) ? hobbies.filter((x) => x !== h) : [...hobbies, h]);

  if (activities.length === 0) {
    return <ReportEmptyState onAddExperiences={() => navigate("/categories")} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      <ScrollProgress />
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/categories")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Your report card</h1>
          <p className="text-xs text-muted-foreground">
            {activities.length} experience{activities.length > 1 ? "s" : ""} analyzed
          </p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-24 space-y-4 overflow-y-auto">
        <ReportSkillsSection topSkills={topSkills} activityCount={activities.length} />
        <ReportValuesSection topValues={topValues} />
        <ReportStrengthsSection topTasks={topTasks} />
        <ReportHobbiesSection hobbies={hobbies} onToggleHobby={toggleHobby} />
      </div>

      <BottomNav navigate={navigate} active="report" />
    </div>
  );
}
