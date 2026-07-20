/**
 * Secondary actions and completeness progress for AutoBuildHero.
 *
 * Exports: AutoBuildHeroFooter
 * Depends on: framer-motion, lucide-react
 */

import { motion } from "framer-motion";
import {
  Eye,
  Settings2,
  ArrowRight,
  ClipboardPaste,
} from "lucide-react";

interface AutoBuildHeroFooterProps {
  showPaste: boolean;
  hasAnyData: boolean;
  customizing: boolean;
  filledCount: number;
  totalCount: number;
  onClipboardPaste: () => void;
  onPreview: () => void;
  onCustomize: () => void;
}

/** Paste shortcut, preview/customize links, and optional progress bar. */
export function AutoBuildHeroFooter({
  showPaste,
  hasAnyData,
  customizing,
  filledCount,
  totalCount,
  onClipboardPaste,
  onPreview,
  onCustomize,
}: AutoBuildHeroFooterProps) {
  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {!showPaste && (
            <button
              type="button"
              onClick={onClipboardPaste}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <ClipboardPaste className="h-3 w-3" />
              Paste a bio first
            </button>
          )}
          {hasAnyData && (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onCustomize}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          <Settings2 className="h-3 w-3" />
          {customizing ? "Hide the form" : "Customize every field"}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {hasAnyData && (
        <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">CV completeness</span>
            <span className="font-bold text-primary">
              {filledCount}/{totalCount} sections
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={false}
              animate={{ width: `${(filledCount / totalCount) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 0.7, 0.35, 1] }}
              className="h-full rounded-full gradient-warm"
            />
          </div>
        </div>
      )}
    </>
  );
}
