import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Check, BarChart3, Sparkles, ChevronRight } from "lucide-react";
import { CATEGORIES, Activity } from "@/lib/data";
import { useAppState } from "@/context/AppContext";
import ActivityWalkthrough from "@/components/ActivityWalkthrough";

const CategorySelect = () => {
  const navigate = useNavigate();
  const { activities, addActivity, removeActivity } = useAppState();
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, DOMRect | null>>({});

  const expandedCategory = CATEGORIES.find((c) => c.id === expandedCatId);

  const handleCardTap = (catId: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    cardRefs.current[catId] = rect;
    setExpandedCatId(catId);
  };

  const handleActivityComplete = (activity: Activity) => {
    addActivity(activity);
    setExpandedCatId(null);
  };

  const handleClose = () => {
    setExpandedCatId(null);
  };

  const hasActivities = activities.length > 0;

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 pt-6 pb-20 gradient-soft relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <p className="text-xs font-medium text-primary mb-1 tracking-wide uppercase">
          Your Experiences
        </p>
        <h1 className="text-xl font-bold text-foreground leading-tight mb-0.5">
          {hasActivities ? "My Experiences" : "Tap a category to add an activity"}
        </h1>
        <p className="text-muted-foreground text-xs">
          {hasActivities
            ? `${activities.length} ${activities.length === 1 ? "activity" : "activities"} added · Tap to add more`
            : "Each card expands into a quick walkthrough. Add as many as you like."}
        </p>
      </motion.div>

      {/* Categories Grid — compact for 7 items */}
      <div className="flex-1 grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat, i) => {
          const catActivities = activities.filter((a) => a.categoryId === cat.id);
          return (
            <motion.div
              key={cat.id}
              layoutId={`card-${cat.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => handleCardTap(cat.id, e.currentTarget as HTMLElement)}
              className="w-full text-left p-3 rounded-xl border-2 border-border bg-card hover:border-primary/40 transition-all duration-200 relative overflow-visible cursor-pointer shadow-card"
            >
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">{cat.emoji}</span>
                <h3 className="font-semibold text-foreground text-xs leading-tight flex-1">
                  {cat.name}
                </h3>
              </div>

              {catActivities.length === 0 ? (
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug pl-6">
                  {cat.examples.slice(0, 2).join(" · ")}
                </p>
              ) : (
                <div className="mt-1.5 space-y-0.5 pl-6">
                  {catActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-1 bg-accent rounded-md px-1.5 py-0.5"
                    >
                      <Check className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                      <span className="text-[9px] text-accent-foreground font-medium truncate flex-1">
                        {act.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeActivity(act.id);
                        }}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  <p className="text-[9px] text-primary font-medium">+ Add more</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom nav bar when has activities */}
      {hasActivities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border px-2 py-2 flex justify-around z-40"
        >
          <NavBtn icon={<span className="text-lg">📋</span>} label="Activities" active onClick={() => {}} />
          <NavBtn
            icon={<BarChart3 className="w-5 h-5" />}
            label="Report"
            onClick={() => navigate("/report")}
            badge
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
        </motion.div>
      )}

      {/* Floating continue button when no activities yet — hidden once nav bar shows */}
      {!hasActivities && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* placeholder — button only shows when there are activities, handled by nav bar */}
        </div>
      )}

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
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              layoutId={`card-${expandedCatId}`}
              className="relative z-10 m-2 mt-4 flex-1 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden flex flex-col"
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
            >
              <ActivityWalkthrough
                category={expandedCategory}
                onComplete={handleActivityComplete}
                onClose={handleClose}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

export default CategorySelect;
