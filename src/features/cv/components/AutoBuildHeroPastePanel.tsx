/**
 * Optional paste panel inside AutoBuildHero for bio/signature text.
 *
 * Exports: AutoBuildHeroPastePanel
 * Depends on: framer-motion, lucide-react, parseQuickFill, shared ui
 */

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";
import type { QuickFillResult } from "@/features/cv/lib/parseQuickFill";

interface AutoBuildHeroPastePanelProps {
  paste: string;
  parsed: QuickFillResult;
  onPasteChange: (value: string) => void;
  onHide: () => void;
}

/** Collapsible paste box with detected-field chips. */
export function AutoBuildHeroPastePanel({
  paste,
  parsed,
  onPasteChange,
  onHide,
}: AutoBuildHeroPastePanelProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 0.7, 0.35, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4 rounded-2xl border border-border bg-white/85 p-3 backdrop-blur-sm">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Paste a bio or signature (optional)
          </p>
          <button
            type="button"
            onClick={onHide}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Hide
          </button>
        </div>
        <Textarea
          value={paste}
          onChange={(e) => onPasteChange(e.target.value)}
          placeholder="Hi, I'm Alex Chen — alex@email.com, San Francisco, linkedin.com/in/alexchen…"
          className="min-h-[72px] resize-none border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-0"
        />
        {parsed.filled.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex flex-wrap gap-1.5 border-t border-border/60 pt-2"
          >
            {parsed.filled.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
                {f}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
