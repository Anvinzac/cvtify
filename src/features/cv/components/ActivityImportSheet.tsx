/**
 * Bottom sheet for importing timeline activities as CV experience entries.
 *
 * Exports: ActivityImportSheet (default)
 * Depends on: framer-motion, lucide-react, @/lib/data, ActivityImportRow
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Activity } from "@/lib/data";
import { activityToCvEntry } from "@/features/cv/lib/activityAutofill";
import type { CvEntry } from "@/features/cv/types";
import { ActivityImportRow } from "@/features/cv/components/ActivityImportRow";

interface ActivityImportSheetProps {
  open: boolean;
  activities: Activity[];
  onClose: () => void;
  onImport: (entries: CvEntry[]) => void;
}

/** Bottom sheet to pick timeline activities and promote them to CV entries. */
export default function ActivityImportSheet({
  open,
  activities,
  onClose,
  onImport,
}: ActivityImportSheetProps) {
  const sorted = useMemo(
    () =>
      [...activities].sort((a, b) => {
        const at = a.occurredAt ?? Number(a.id);
        const bt = b.occurredAt ?? Number(b.id);
        return bt - at;
      }),
    [activities]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map((a) => a.id)));
  };

  const handleImport = () => {
    if (selected.size === 0) return;
    const entries = sorted
      .filter((a) => selected.has(a.id))
      .map(activityToCvEntry);
    onImport(entries);
    setSelected(new Set());
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl border-t border-border bg-card shadow-elevated"
          >
            <div className="flex justify-center pt-2">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2">
              <div>
                <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  <Sparkles className="h-3 w-3" />
                  Borrow from your timeline
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground leading-tight">
                  {sorted.length === 0 ? "No experiences yet" : "Pick experiences to add"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {sorted.length === 0
                    ? "Capture some activities first — we'll let you import them later."
                    : "Dates, durations, skills, and notes will all carry over."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sorted.length > 1 && (
              <div className="flex items-center justify-between px-5 py-2 border-y border-border/60 bg-muted/30">
                <button
                  onClick={toggleAll}
                  className="text-[11px] font-bold uppercase tracking-wider text-primary"
                >
                  {selected.size === sorted.length ? "Clear all" : "Select all"}
                </button>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {selected.size}/{sorted.length} selected
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {sorted.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Head over to Activities to capture your first experience.
                  </p>
                </div>
              ) : (
                sorted.map((act) => (
                  <ActivityImportRow
                    key={act.id}
                    activity={act}
                    isSelected={selected.has(act.id)}
                    onToggle={() => toggle(act.id)}
                  />
                ))
              )}
            </div>

            {sorted.length > 0 && (
              <div className="border-t border-border bg-card/85 px-5 py-3 backdrop-blur-xl">
                <button
                  onClick={handleImport}
                  disabled={selected.size === 0}
                  className="w-full rounded-xl gradient-warm py-3 text-sm font-bold text-primary-foreground shadow-sm transition-opacity disabled:opacity-30"
                >
                  {selected.size === 0
                    ? "Pick at least one"
                    : `Add ${selected.size} to my CV`}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
