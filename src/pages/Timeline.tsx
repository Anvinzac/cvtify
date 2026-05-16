import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { Activity, CATEGORIES } from "@/lib/data";
import TimelineView from "@/components/TimelineView";
import ActivityWalkthrough from "@/components/ActivityWalkthrough";
import ScrollProgress from "@/components/fx/ScrollProgress";
import { BottomNav } from "./ReportCard";

export default function Timeline() {
  const navigate = useNavigate();
  const { activities, updateActivity, removeActivity } = useAppState();
  const [editing, setEditing] = useState<Activity | null>(null);

  const editCategory = editing
    ? CATEGORIES.find((c) => c.id === editing.categoryId)
    : null;

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft relative">
      <ScrollProgress />

      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/categories")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            Your journey
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {activities.length > 0
              ? `${activities.length} experience${activities.length > 1 ? "s" : ""} mapped through time`
              : "Add experiences to start your journey"}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 pt-3"
      >
        <TimelineView
          activities={activities}
          onEdit={setEditing}
          onRemove={removeActivity}
        />
      </motion.div>

      <AnimatePresence>
        {editing && editCategory && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-background/70 backdrop-blur-md"
              onClick={() => setEditing(null)}
            />
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="relative z-10 m-2 mt-4 flex-1 bg-card rounded-2xl border border-border shadow-elevated overflow-hidden flex flex-col"
            >
              <ActivityWalkthrough
                category={editCategory}
                initialActivity={editing}
                onComplete={(updated) => {
                  updateActivity(updated);
                  setEditing(null);
                }}
                onClose={() => setEditing(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav navigate={navigate} active="timeline" />
    </div>
  );
}
