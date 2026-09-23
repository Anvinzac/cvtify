import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, BarChart3, Sparkles, ChevronRight, Plus, LayoutGrid, CalendarClock, ClipboardList, FileText } from "lucide-react";
import { CATEGORIES, Activity } from "@/lib/data";
import { useAppState } from "@/context/AppContext";
import ActivityWalkthrough from "@/components/ActivityWalkthrough";
import SpotlightCard from "@/components/fx/SpotlightCard";
import TimelineView from "@/components/TimelineView";

const CATEGORY_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  "home-business": { bar: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
  "social-works": { bar: "bg-rose-400", bg: "bg-rose-50", text: "text-rose-700" },
  "part-time": { bar: "bg-sky-400", bg: "bg-sky-50", text: "text-sky-700" },
  "projects-internship": { bar: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  "extra-curriculum": { bar: "bg-violet-400", bg: "bg-violet-50", text: "text-violet-700" },
  professional: { bar: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-700" },
  "supplemental-education": { bar: "bg-indigo-400", bg: "bg-indigo-50", text: "text-indigo-700" },
};

type ViewMode = "grid" | "timeline";

export default function CategorySelect() {
  const navigate = useNavigate();
  const { activities, addActivity, updateActivity, removeActivity } = useAppState();
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const cardRefs = useRef<Record<string, DOMRect | null>>({});
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("cvtify.viewMode") as ViewMode) || "grid";
  });

  useEffect(() => {
    localStorage.setItem("cvtify.viewMode", viewMode);
  }, [viewMode]);

  const expandedCategory = CATEGORIES.find((c) => c.id === expandedCatId);

  const handleCardTap = (catId: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    cardRefs.current[catId] = rect;
    setExpandedCatId(catId);
  };

  const handleActivityComplete = (activity: Activity) => {
    if (editingActivity) {
      updateActivity(activity);
    } else {
      addActivity(activity);
    }
    setExpandedCatId(null);
    setEditingActivity(null);
  };

  const handleClose = () => {
    setExpandedCatId(null);
    setEditingActivity(null);
  };

  const handleEditActivity = (act: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingActivity(act);
    setExpandedCatId(act.categoryId);
  };

  const hasActivities = activities.length > 0;

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 pt-6 pb-24 gradient-soft relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              Your experiences
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">
              {hasActivities ? "Your journey" : "What have you done?"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-card border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            CV
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {hasActivities
            ? `${activities.length} ${activities.length === 1 ? "experience" : "experiences"} captured. ${viewMode === "timeline" ? "Scroll back to see your story." : "Tap any category to add more."}`
            : "Tap a category to add your first experience. Each one helps us understand you better."}
        </p>
      </motion.div>

      {/* View mode toggle */}
      {hasActivities && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 flex justify-center"
        >
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </motion.div>
      )}

      {/* Conditional view */}
      {viewMode === "timeline" && hasActivities ? (
        <motion.div
          key="timeline"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1"
        >
          <TimelineView
            activities={activities}
            onEdit={(act) => {
              setEditingActivity(act);
              setExpandedCatId(act.categoryId);
            }}
            onRemove={removeActivity}
          />
        </motion.div>
      ) : (
      <div className="flex-1 grid grid-cols-2 gap-2.5 content-start">
        {CATEGORIES.map((cat, i) => {
          const catActivities = activities.filter((a) => a.categoryId === cat.id);
          const colors = CATEGORY_COLORS[cat.id];
          const hasItems = catActivities.length > 0;

          return (
            <motion.div
              key={cat.id}
              layoutId={`card-${cat.id}`}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -3 }}
              onClick={(e) => handleCardTap(cat.id, e.currentTarget as HTMLElement)}
              className={`w-full text-left rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-elevated transition-all duration-200 relative overflow-hidden cursor-pointer group ${
                hasItems ? "shadow-card" : ""
              }`}
            >
              <SpotlightCard radius={260} tilt={5} className="rounded-2xl">
              {/* Top color bar */}
              <div className={`h-1 w-full ${colors.bar} rounded-t-2xl`} />

              <div className="p-3.5">
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-xl leading-none mt-0.5">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                  {hasItems && (
                    <span className={`shrink-0 w-5 h-5 rounded-full ${colors.bar} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                      {catActivities.length}
                    </span>
                  )}
                </div>

                {!hasItems ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {cat.examples.slice(0, 2).join(" · ")}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {catActivities.slice(0, 3).map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-1.5 bg-accent/60 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-accent transition-colors group/pill"
                        onClick={(e) => handleEditActivity(act, e)}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${colors.bar} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="text-[11px] text-accent-foreground font-medium leading-snug flex-1 break-words">
                          {act.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeActivity(act.id);
                          }}
                          className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover/pill:opacity-100 transition-opacity mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {catActivities.length > 3 && (
                      <p className="text-[11px] text-muted-foreground pl-1">
                        +{catActivities.length - 3} more
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardTap(cat.id, (e.target as HTMLElement).closest("[class*='group']") as HTMLElement);
                      }}
                      className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:text-primary/80 transition-colors pt-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      Add another
                    </button>
                  </div>
                )}
              </div>

              {/* Hover indicator */}
              {!hasItems && (
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.03] transition-colors rounded-2xl" />
              )}
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* Bottom nav — shown when there are activities */}
      <AnimatePresence>
        {hasActivities && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-xl border-t border-border/60 px-1 py-1.5 flex justify-around z-40 safe-bottom"
          >
            <NavBtn icon={<ClipboardList className="w-5 h-5" />} label="Activities" active onClick={() => {}} />
            <NavBtn icon={<CalendarClock className="w-5 h-5" />} label="Timeline" onClick={() => navigate("/timeline")} />
            <NavBtn icon={<BarChart3 className="w-5 h-5" />} label="Report" onClick={() => navigate("/report")} />
            <NavBtn icon={<Sparkles className="w-5 h-5" />} label="For You" onClick={() => navigate("/recommendations")} />
            <NavBtn icon={<ChevronRight className="w-5 h-5" />} label="Dream Jobs" onClick={() => navigate("/dream-jobs")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded overlay */}
      <AnimatePresence>
        {expandedCatId && expandedCategory && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-background/70 backdrop-blur-md"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              layoutId={`card-${expandedCatId}`}
              className="relative z-10 m-2 mt-4 flex-1 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden flex flex-col"
              transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
            >
              <ActivityWalkthrough
                category={expandedCategory}
                onComplete={handleActivityComplete}
                onClose={handleClose}
                initialActivity={editingActivity ?? undefined}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
        active
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function ViewToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  return (
    <div className="relative grid grid-cols-2 w-full max-w-sm bg-muted/60 rounded-2xl p-1 text-sm font-semibold">
      <div
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-card shadow-sm"
        style={{
          transform: mode === "grid" ? "translateX(0%)" : "translateX(100%)",
          transition: "transform 320ms cubic-bezier(0.22, 0.7, 0.35, 1)",
          willChange: "transform",
        }}
      />
      <button
        onClick={() => onChange("grid")}
        className={`relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors duration-200 ${
          mode === "grid" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Grid
      </button>
      <button
        onClick={() => onChange("timeline")}
        className={`relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors duration-200 ${
          mode === "timeline" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <CalendarClock className="w-4 h-4" />
        Timeline
      </button>
    </div>
  );
}
