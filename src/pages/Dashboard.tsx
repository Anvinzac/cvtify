import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BarChart3, Sparkles, ChevronRight, X, ArrowRight, ClipboardList } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useAppState } from "@/context/AppContext";

const CATEGORY_COLORS: Record<string, string> = {
  "home-business": "bg-amber-400",
  "social-works": "bg-rose-400",
  "part-time": "bg-sky-400",
  "projects-internship": "bg-emerald-400",
  "extra-curriculum": "bg-violet-400",
  professional: "bg-slate-400",
  "supplemental-education": "bg-indigo-400",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedCategories, activities, removeActivity } = useAppState();

  const cats = CATEGORIES.filter((c) => selectedCategories.includes(c.id));

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">My experiences</h1>
          <p className="text-sm text-muted-foreground">
            {activities.length > 0
              ? `${activities.length} experience${activities.length > 1 ? "s" : ""} across ${cats.length} categor${cats.length > 1 ? "ies" : "y"}`
              : "Add activities to build your profile"}
          </p>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 px-5 pb-24">
        {cats.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No categories yet</p>
            <p className="text-xs text-muted-foreground mb-4">Select categories to start tracking experiences</p>
            <button
              onClick={() => navigate("/categories")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-warm text-primary-foreground text-sm font-semibold shadow-elevated"
            >
              Browse categories
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {cats.map((cat, i) => {
              const catActivities = activities.filter((a) => a.categoryId === cat.id);
              const barColor = CATEGORY_COLORS[cat.id] || "bg-primary";

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
                >
                  <div className={`h-1 w-full ${barColor} rounded-t-2xl`} />
                  <div className="p-3.5">
                    <span className="text-xl leading-none">{cat.emoji}</span>
                    <h3 className="font-semibold text-foreground text-xs mt-2 leading-tight">
                      {cat.name}
                    </h3>

                    {catActivities.length > 0 && (
                      <div className="mt-2.5 space-y-1">
                        {catActivities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center gap-1.5 bg-accent/50 rounded-lg px-2 py-1.5 group/pill"
                          >
                            <span className="text-[10px] text-accent-foreground font-medium truncate flex-1">
                              {act.name}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeActivity(act.id);
                              }}
                              className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover/pill:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/add-activity/${cat.id}`)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-primary/30 text-primary hover:bg-accent/30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-[11px] font-semibold">Add</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add more categories */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate("/categories")}
          className="w-full mt-4 p-3.5 rounded-xl border border-dashed border-border text-muted-foreground text-sm font-semibold hover:border-primary/30 hover:text-primary transition-all duration-200 text-center"
        >
          + Explore more categories
        </motion.button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-xl border-t border-border/60 px-2 py-1.5 flex justify-around z-40">
        <NavBtn
          icon={<ClipboardList className="w-5 h-5" />}
          label="Activities"
          active
          onClick={() => {}}
        />
        <NavBtn
          icon={<BarChart3 className="w-5 h-5" />}
          label="Report"
          onClick={() => navigate("/report")}
        />
        <NavBtn
          icon={<Sparkles className="w-5 h-5" />}
          label="For You"
          onClick={() => navigate("/recommendations")}
        />
        <NavBtn
          icon={<ChevronRight className="w-5 h-5" />}
          label="Dream Jobs"
          onClick={() => navigate("/dream-jobs")}
        />
      </div>
    </div>
  );
};

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

export default Dashboard;
