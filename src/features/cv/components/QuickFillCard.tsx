/**
 * Paste-to-fill card for extracting identity fields from free-form text.
 *
 * Exports: QuickFillCard (default)
 * Depends on: framer-motion, parseQuickFill, QuickFill* subcomponents
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseQuickFill, type QuickFillResult } from "@/features/cv/lib/parseQuickFill";
import type { CvPersonalInfo } from "@/features/cv/types";
import { QuickFillCardHeader } from "@/features/cv/components/QuickFillCardHeader";
import { QuickFillTimelineBorrow } from "@/features/cv/components/QuickFillTimelineBorrow";
import { QuickFillPasteBox } from "@/features/cv/components/QuickFillPasteBox";
import { QuickFillResultPreview } from "@/features/cv/components/QuickFillResultPreview";

interface QuickFillCardProps {
  onApply: (patch: Partial<CvPersonalInfo>) => void;
  onOpenTimelineImport: () => void;
  timelineCount: number;
}

/** Paste-anything box that extracts identity fields and links to timeline import. */
export default function QuickFillCard({
  onApply,
  onOpenTimelineImport,
  timelineCount,
}: QuickFillCardProps) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [result, setResult] = useState<QuickFillResult | null>(null);
  const [applied, setApplied] = useState<(keyof CvPersonalInfo)[] | null>(null);

  const handleParse = (raw: string) => {
    setResult(parseQuickFill(raw));
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setText(clip);
        handleParse(clip);
      }
    } catch {
      // permission denied — user can paste manually
    }
  };

  const handleApply = () => {
    if (!result) return;
    const patch: Partial<CvPersonalInfo> = {};
    for (const k of result.filled) {
      const v = result[k];
      if (typeof v === "string") patch[k] = v;
    }
    onApply(patch);
    setApplied(result.filled);
    setTimeout(() => {
      setExpanded(false);
      setText("");
      setResult(null);
    }, 1400);
  };

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-white to-accent/30 shadow-card"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-12 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-12 h-36 w-36 rounded-full bg-secondary/15 blur-2xl"
      />

      <QuickFillCardHeader expanded={expanded} onToggle={() => setExpanded((e) => !e)} />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.7, 0.35, 1] }}
            className="relative z-10 overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              <QuickFillTimelineBorrow
                timelineCount={timelineCount}
                onOpenTimelineImport={onOpenTimelineImport}
              />
              <QuickFillPasteBox
                text={text}
                onTextChange={setText}
                onParse={handleParse}
                onPasteFromClipboard={handlePasteFromClipboard}
              />
              <QuickFillResultPreview
                result={result}
                applied={applied}
                onClear={() => {
                  setText("");
                  setResult(null);
                }}
                onApply={handleApply}
                onDismissApplied={() => setApplied(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
