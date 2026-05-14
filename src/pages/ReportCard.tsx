import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Sparkles, ChevronRight, Star, Heart, Zap, Palette } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { HOBBY_OPTIONS } from "@/lib/data";

const ReportCard = () => {
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
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 gradient-soft">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground mb-1">No experiences yet</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
            Add some experiences to generate your personalized report card
          </p>
          <button
            onClick={() => navigate("/categories")}
            className="px-6 py-3 rounded-xl gradient-warm text-primary-foreground font-semibold text-sm shadow-elevated"
          >
            Add experiences
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      {/* Header */}
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
        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm">Skills you're building</h2>
              <p className="text-[11px] text-muted-foreground">What you're getting good at</p>
            </div>
          </div>
          <div className="space-y-3">
            {topSkills.map(([skill, count], i) => (
              <div key={skill}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-foreground font-semibold">{skill}</span>
                  <span className="text-muted-foreground font-medium">{count}x</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((count / activities.length) * 100, 100)}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: "easeOut" }}
                    className="h-full gradient-warm rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm">Values you prioritize</h2>
              <p className="text-[11px] text-muted-foreground">What matters most to you</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {topValues.map(([value, count]) => (
              <motion.span
                key={value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3.5 py-2 rounded-full text-xs font-semibold gradient-teal text-secondary-foreground shadow-sm"
              >
                {value}
                <span className="ml-1 opacity-70">{count}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm">Your strengths</h2>
              <p className="text-[11px] text-muted-foreground">Types of work you've done</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {topTasks.map(([task]) => (
              <div key={task} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full gradient-warm shrink-0" />
                <span className="text-sm text-foreground font-medium">{task}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hobbies */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border shadow-card p-5"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-sm">Creative side</h2>
              <p className="text-[11px] text-muted-foreground">Hobbies & passions</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Select your creative interests to find matching events
          </p>
          <div className="flex flex-wrap gap-2">
            {HOBBY_OPTIONS.map((h) => (
              <motion.button
                key={h}
                onClick={() => toggleHobby(h)}
                whileTap={{ scale: 0.94 }}
                className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                  hobbies.includes(h)
                    ? "gradient-warm text-primary-foreground border-transparent shadow-sm"
                    : "bg-card text-foreground border-border hover:border-primary/30"
                }`}
              >
                {h}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav navigate={navigate} active="report" />
    </div>
  );
};

export function BottomNav({
  navigate,
  active,
}: {
  navigate: (path: string) => void;
  active: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-xl border-t border-border/60 px-2 py-1.5 flex justify-around z-40">
      <NavBtn
        icon={<span className="text-lg">📋</span>}
        label="Activities"
        active={active === "dashboard"}
        onClick={() => navigate("/categories")}
      />
      <NavBtn
        icon={<BarChart3 className="w-5 h-5" />}
        label="Report"
        active={active === "report"}
        onClick={() => navigate("/report")}
      />
      <NavBtn
        icon={<Sparkles className="w-5 h-5" />}
        label="For You"
        active={active === "recommendations"}
        onClick={() => navigate("/recommendations")}
      />
      <NavBtn
        icon={<ChevronRight className="w-5 h-5" />}
        label="Dream Jobs"
        active={active === "dream-jobs"}
        onClick={() => navigate("/dream-jobs")}
      />
    </div>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

export default ReportCard;
