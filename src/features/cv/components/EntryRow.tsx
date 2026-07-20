/**
 * Read-only row for a CV entry in experience/education/cert lists.
 *
 * Exports: EntryRow
 * Depends on: lucide-react, @/lib/storage, formatters
 */

import { Pencil, X } from "lucide-react";
import type { CvEntry } from "@/features/cv/types";
import { formatDateRange } from "@/features/cv/lib/formatters";

export interface EntryRowProps {
  entry: CvEntry;
  onEdit: () => void;
  onRemove: () => void;
}

/** Compact summary row with edit and remove actions. */
export function EntryRow({ entry, onEdit, onRemove }: EntryRowProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 border border-border/60 group hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {entry.title || "Untitled"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {entry.organization}
        </p>
        {entry.startDate && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatDateRange(entry)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
