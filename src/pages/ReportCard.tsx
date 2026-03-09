import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, BarChart3, Sparkles, ChevronRight, Star, Heart, Zap, Palette } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { HOBBY_OPTIONS } from "@/lib/data";

const ReportCard = () => {
  const navigate = useNavigate();
  const { activities, hobbies, setHobbies } = useAppState();

  // Aggregate skills, values, tasks
  const allSkills: Record<string, number> = {};
  const allValues: Record<string, number> = {};
  const allTasks: Record<string, number> = {};

  activities.forEach((a) => {
    a.skills.forEach((s) => (allSkills[s] = (allSkills[s] || 0) + 1));
    a.values.forEach((v) => (allValues[v] = (allValues[v] || 0) + 1));
    a.taskTypes.forEach((t) => (allTasks[t] = (allTasks[t] || 0) + 1));
  });

  const topSkills = Object.entries(allSkills).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topValues = Object.entries(allValues).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTasks = Object.entries(allTasks).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const toggleHobby = (h: string) =>
    setHobbies(hobbies.includes(h) ? hobbies.filter((x) => x !== h) : [...hobbies, h]);

  if (activities.length === 0) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 gradient-soft">
        <p className="text-lg font-semibold text-foreground mb-2">No activities yet</p>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Add some experiences first to generate your report card
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-xl gradient-warm text-primary-foreground font-semibold text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Your Report Card</h1>
      </div>

      <div className="flex-1 px-5 pb-4 space-y-5 overflow-y-auto">
        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Skills You're Building</h2>
          </div>
          <div className="space-y-3">
            {topSkills.map(([skill, count]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground font-medium">{skill}</span>
                  <span className="text-muted-foreground">{count}x</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((count / activities.length) * 100, 100)}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full gradient-warm rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-secondary" />
            <h2 className="font-bold text-foreground">Life Values You Prioritize</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {topValues.map(([value, count]) => (
              <span
                key={value}
                className="px-3 py-1.5 rounded-full text-xs font-medium gradient-teal text-secondary-foreground"
              >
                {value} ({count})
              </span>
            ))}
          </div>
        </motion.div>

        {/* Strengths Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Your Strengths</h2>
          </div>
          <div className="space-y-2">
            {topTasks.map(([task]) => (
              <div key={task} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full gradient-warm flex-shrink-0" />
                <span className="text-sm text-foreground">{task}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Based on {activities.length} experience{activities.length > 1 ? "s" : ""} across your journey
          </p>
        </motion.div>

        {/* Hobbies Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card rounded-xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Artistic Passions & Hobbies</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Select your creative interests so we can match you with events & activities
          </p>
          <div className="flex flex-wrap gap-2">
            {HOBBY_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => toggleHobby(h)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  hobbies.includes(h)
                    ? "gradient-warm text-primary-foreground border-transparent"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <BottomNav navigate={navigate} active="report" />
    </div>
  );
};

export function BottomNav({ navigate, active }: { navigate: (path: string) => void; active: string }) {
  return (
    <div className="sticky bottom-0 bg-card/90 backdrop-blur-md border-t border-border px-2 py-2 flex justify-around">
      <NavBtn icon={<Briefcase className="w-5 h-5" />} label="Dashboard" active={active === "dashboard"} onClick={() => navigate("/dashboard")} />
      <NavBtn icon={<BarChart3 className="w-5 h-5" />} label="Report" active={active === "report"} onClick={() => navigate("/report")} />
      <NavBtn icon={<Sparkles className="w-5 h-5" />} label="For You" active={active === "recommendations"} onClick={() => navigate("/recommendations")} />
      <NavBtn icon={<ChevronRight className="w-5 h-5" />} label="Dream Jobs" active={active === "dream-jobs"} onClick={() => navigate("/dream-jobs")} />
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default ReportCard;
