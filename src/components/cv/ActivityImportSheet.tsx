import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Calendar, Tag } from "lucide-react";
import { Activity, CATEGORIES } from "@/lib/data";
import { activityToCvEntry } from "@/lib/cvAutofill";
import { CvEntry } from "@/lib/storage";

interface ActivityImportSheetProps {
  open: boolean;
  activities: Activity[];
  onClose: () => void;
  /** Receives the chosen CV entries (already converted). */
  onImport: (entries: CvEntry[]) => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function activityWhenLabel(act: Activity): string {
  if (typeof act.occurredAt === "number") {
    const d = new Date(act.occurredAt);
    if (act.datePrecision === "year") return String(d.getFullYear());
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return "Date unknown";
}

/**
 * Bottom sheet that lists every captured activity and lets the user
 * pick which ones to promote to CV work-experience entries. Skills,
 * task types, dates, and personal notes are all carried over.
 */
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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl border-t border-border bg-card shadow-elevated"
          >
            {/* Handle */}
            <div className="flex justify-center pt-2">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-2">
              <div>
                <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  <Sparkles className="h-3 w-3" />
                  Borrow from your timeline
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground leading-tight">
                  {sorted.length === 0
                    ? "No experiences yet"
                    : `Pick experiences to add`}
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

            {/* Select-all bar */}
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

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
              {sorted.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Head over to Activities to capture your first experience.
                  </p>
                </div>
              ) : (
                sorted.map((act) => {
                  const cat = CATEGORIES.find((c) => c.id === act.categoryId);
                  const isSelected = selected.has(act.id);
                  return (
                    <motion.button
                      key={act.id}
                      layout
                      onClick={() => toggle(act.id)}
                      whileTap={{ scale: 0.985 }}
                      className={`w-full text-left rounded-2xl border p-3 transition-colors ${
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-background hover:border-primary/25"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl leading-none mt-0.5">
                          {cat?.emoji ?? "✨"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground leading-tight">
                            {act.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {cat?.name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {activityWhenLabel(act)}
                            </span>
                            {act.duration && (
                              <span className="inline-flex items-center gap-1">
                                <Tag className="h-2.5 w-2.5" />
                                {act.duration}
                              </span>
                            )}
                          </div>
                          {act.skills.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {act.skills.slice(0, 3).map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full bg-accent/60 px-2 py-0.5 text-[9px] font-semibold text-accent-foreground"
                                >
                                  {s}
                                </span>
                              ))}
                              {act.skills.length > 3 && (
                                <span className="text-[9px] text-muted-foreground">
                                  +{act.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <motion.span
                          animate={
                            isSelected
                              ? { scale: 1, opacity: 1 }
                              : { scale: 0.8, opacity: 0.4 }
                          }
                          transition={{ type: "spring", stiffness: 380, damping: 22 }}
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? "border-transparent gradient-warm text-primary-foreground shadow-sm"
                              : "border-border bg-background text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </motion.span>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Footer CTA */}
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
