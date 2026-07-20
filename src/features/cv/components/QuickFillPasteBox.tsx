/**
 * Paste textarea and toolbar for QuickFillCard.
 *
 * Exports: QuickFillPasteBox
 * Depends on: lucide-react, shared ui, quickFillConstants
 */

import { Clipboard } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import { QUICK_FILL_SAMPLE_PASTE } from "@/features/cv/lib/quickFillConstants";

interface QuickFillPasteBoxProps {
  text: string;
  onTextChange: (value: string) => void;
  onParse: (raw: string) => void;
  onPasteFromClipboard: () => void;
}

/** Free-form paste area with clipboard and sample shortcuts. */
export function QuickFillPasteBox({
  text,
  onTextChange,
  onParse,
  onPasteFromClipboard,
}: QuickFillPasteBoxProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/85 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Clipboard className="h-3 w-3" />
          Paste anything about you
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPasteFromClipboard}
            className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Paste
          </button>
          <button
            type="button"
            onClick={() => {
              onTextChange(QUICK_FILL_SAMPLE_PASTE);
              onParse(QUICK_FILL_SAMPLE_PASTE);
            }}
            className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Try sample
          </button>
        </div>
      </div>
      <Textarea
        value={text}
        onChange={(e) => {
          onTextChange(e.target.value);
          onParse(e.target.value);
        }}
        placeholder="Hi, I'm Alex Chen — alex@email.com, based in San Francisco. linkedin.com/in/alexchen…"
        className="min-h-[88px] resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-0"
      />
    </div>
  );
}
