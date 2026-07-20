/**
 * Collapsible header row for QuickFillCard.
 *
 * Exports: QuickFillCardHeader
 * Depends on: framer-motion, lucide-react
 */

import { motion } from "framer-motion";
import { Sparkles, Wand2, ChevronDown } from "lucide-react";

interface QuickFillCardHeaderProps {
  expanded: boolean;
  onToggle: () => void;
}

/** Tap-to-expand header with title and smart-fill badge. */
export function QuickFillCardHeader({ expanded, onToggle }: QuickFillCardHeaderProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative z-10 flex w-full items-start gap-3 p-4 text-left"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-warm text-primary-foreground shadow-glow">
        <Wand2 className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">Skip the typing</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> Smart fill
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Paste your LinkedIn bio, email signature, or a sentence about yourself — or
          borrow what you've already captured in your timeline.
        </p>
      </div>
      <motion.span
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </motion.span>
    </button>
  );
}
