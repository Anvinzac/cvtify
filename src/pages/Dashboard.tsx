import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BarChart3, Briefcase, Sparkles, ChevronRight, X } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { useAppState } from "@/context/AppContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedCategories, activities, removeActivity } = useAppState();

  const cats = CATEGORIES.filter((c) => selectedCategories.includes(c.id));

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">My Experiences</h1>
          <p className="text-sm text-muted-foreground">
            Tap a category to add activities you've done
          </p>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {cats.map((cat, i) => {
            const catActivities = activities.filter((a) => a.categoryId === cat.id);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
              >
                <div className="p-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h3 className="font-semibold text-foreground text-xs mt-2 leading-tight">
                    {cat.name}
                  </h3>

                  {/* Activity pills */}
                  {catActivities.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {catActivities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center gap-1 bg-accent rounded-md px-2 py-1"
                        >
                          <span className="text-[10px] text-accent-foreground font-medium truncate flex-1">
                            {act.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeActivity(act.id);
                            }}
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/add-activity/${cat.id}`)}
                    className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-accent transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Add</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add more categories */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/categories")}
          className="w-full mt-4 p-3 rounded-xl border border-dashed border-border text-muted-foreground text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors text-center"
        >
          + Explore more categories
        </motion.button>
      </div>

      {/* Bottom Nav */}
      <div className="sticky bottom-0 bg-card/90 backdrop-blur-md border-t border-border px-2 py-2 flex justify-around">
        <NavBtn icon={<Briefcase className="w-5 h-5" />} label="Dashboard" active onClick={() => {}} />
        <NavBtn
          icon={<BarChart3 className="w-5 h-5" />}
          label="Report"
          onClick={() => navigate("/report")}
          badge={activities.length > 0}
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
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors relative ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {badge && (
        <span className="absolute top-1 right-2 w-2 h-2 rounded-full gradient-warm" />
      )}
    </button>
  );
}

export default Dashboard;
