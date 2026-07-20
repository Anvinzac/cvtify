/**
 * Timeline borrow shortcut inside QuickFillCard expanded body.
 *
 * Exports: QuickFillTimelineBorrow
 * Depends on: lucide-react
 */

import { Sparkles } from "lucide-react";

interface QuickFillTimelineBorrowProps {
  timelineCount: number;
  onOpenTimelineImport: () => void;
}

/** CTA to open the activity-import sheet when timeline has entries. */
export function QuickFillTimelineBorrow({
  timelineCount,
  onOpenTimelineImport,
}: QuickFillTimelineBorrowProps) {
  if (timelineCount <= 0) return null;

  return (
    <button
      type="button"
      onClick={onOpenTimelineImport}
      className="group relative flex w-full items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-3 text-left transition-colors hover:bg-secondary/10"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Borrow from your timeline</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Turn any of your {timelineCount} captured{" "}
          {timelineCount === 1 ? "experience" : "experiences"} into a CV entry — dates,
          skills, and notes carry over.
        </p>
      </div>
      <span className="text-[11px] font-bold text-secondary">Pick →</span>
    </button>
  );
}
