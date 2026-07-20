/**
 * Empty state when no activities exist on the timeline.
 */

import { CalendarClock } from "lucide-react";

/** Placeholder shown before the user adds their first activity. */
export function TimelineEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <CalendarClock className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">Your timeline starts here</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
        Add an activity and it'll appear on your journey — with the skills and strengths you
        discovered.
      </p>
    </div>
  );
}
