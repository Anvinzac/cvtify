/**
 * Category grid and inline timeline — main activities hub page.
 *
 * Exports: CategorySelectPage (default)
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { CATEGORIES } from "@/features/activities/lib/catalog";
import type { Activity } from "@/features/activities/types";
import { useAppState } from "@/shared/app-state/AppContext";
import TimelineView from "@/features/activities/components/timeline/TimelineView";
import { BottomNav } from "@/shared/components/BottomNav";
import type { ViewMode } from "@/features/activities/components/category/constants";
import { ViewModeToggle } from "@/features/activities/components/category/ViewModeToggle";
import { CategoryGrid } from "@/features/activities/components/category/CategoryGrid";
import { WalkthroughOverlay } from "@/features/activities/components/category/WalkthroughOverlay";

/** Grid/timeline view for browsing categories and managing activities. */
export default function CategorySelectPage() {
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

      {hasActivities && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 flex justify-center"
        >
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </motion.div>
      )}

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
        <CategoryGrid
          activities={activities}
          onCardTap={handleCardTap}
          onEditActivity={handleEditActivity}
          onRemoveActivity={removeActivity}
        />
      )}

      <AnimatePresence>
        {hasActivities && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <BottomNav navigate={navigate} active="dashboard" />
          </motion.div>
        )}
      </AnimatePresence>

      <WalkthroughOverlay
        categoryId={expandedCatId}
        category={expandedCategory}
        editingActivity={editingActivity}
        onComplete={handleActivityComplete}
        onClose={handleClose}
      />
    </div>
  );
}
