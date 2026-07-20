/**
 * Grid/timeline view mode toggle for the category hub.
 *
 * Exports: ViewModeToggle
 */

import { LayoutGrid, CalendarClock } from "lucide-react";
import type { ViewMode } from "@/features/activities/components/category/constants";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

/** Segmented control switching between grid and inline timeline views. */
export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
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
