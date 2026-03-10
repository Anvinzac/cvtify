import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-[100dvh] flex flex-col px-5 py-8 gradient-soft relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
          Your Experiences
        </p>
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-1">
          Tap a category to add an activity
        </h1>
        <p className="text-muted-foreground text-sm">
          Each card expands into a quick walkthrough. Add as many as you like.
        </p>
      </motion.div>

      {/* Categories Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => {
          const catActivities = activities.filter((a) => a.categoryId === cat.id);
          return (
            <motion.div
              key={cat.id}
              layoutId={`card-${cat.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => handleCardTap(cat.id, e.currentTarget as HTMLElement)}
              className="w-full text-left p-4 pt-5 rounded-xl border-2 border-border bg-card hover:border-primary/40 transition-all duration-200 relative overflow-visible cursor-pointer shadow-card"
            >
              <span className="absolute -top-3 -left-3 text-lg bg-card border border-border rounded-full w-9 h-9 flex items-center justify-center shadow-sm">
                {cat.emoji}
              </span>

              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {cat.name}
              </h3>

              {catActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
                  {cat.examples.slice(0, 2).join(" · ")}
                </p>
              ) : (
                <div className="mt-2 space-y-1">
                  {catActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-1 bg-accent rounded-md px-2 py-1"
                    >
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
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

              {catActivities.length > 0 && (
                <p className="text-[10px] text-primary font-medium mt-2">+ Add more</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Continue button */}
      {hasActivities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-2"
        >
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-14 text-base font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
            size="lg"
          >
            Continue with {activities.length} {activities.length === 1 ? "activity" : "activities"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
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
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Expanded card */}
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

export default CategorySelect;
