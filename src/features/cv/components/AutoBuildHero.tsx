/**
 * Hero banner with one-tap auto-build from pasted identity text.
 *
 * Exports: AutoBuildHero (default)
 * Depends on: framer-motion, lucide-react, parseQuickFill, AutoBuildHero* subcomponents
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { parseQuickFill } from "@/features/cv/lib/parseQuickFill";
import type { CvPersonalInfo } from "@/features/cv/types";
import { AutoBuildHeroPastePanel } from "@/features/cv/components/AutoBuildHeroPastePanel";
import { AutoBuildHeroBuildButton } from "@/features/cv/components/AutoBuildHeroBuildButton";
import { AutoBuildHeroFooter } from "@/features/cv/components/AutoBuildHeroFooter";

interface AutoBuildHeroProps {
  timelineCount: number;
  filledCount: number;
  totalCount?: number;
  hasAnyData: boolean;
  onAutoBuild: (paste: Partial<CvPersonalInfo>) => void;
  onCustomize: () => void;
  customizing: boolean;
  onPreview: () => void;
}

/**
 * Top-of-page hero owning the single highest-value action: "Build it for me".
 */
export default function AutoBuildHero({
  timelineCount,
  filledCount,
  totalCount = 5,
  hasAnyData,
  onAutoBuild,
  onCustomize,
  customizing,
  onPreview,
}: AutoBuildHeroProps) {
  const [paste, setPaste] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [building, setBuilding] = useState(false);
  const [justBuilt, setJustBuilt] = useState(false);

  const parsed = useMemo(() => parseQuickFill(paste), [paste]);

  const handleBuild = () => {
    setBuilding(true);
    const patch: Partial<CvPersonalInfo> = {};
    for (const k of parsed.filled) {
      const v = parsed[k];
      if (typeof v === "string") patch[k] = v;
    }
    setTimeout(() => {
      onAutoBuild(patch);
      setBuilding(false);
      setJustBuilt(true);
      setPaste("");
      setShowPaste(false);
      setTimeout(() => setJustBuilt(false), 2400);
    }, 360);
  };

  const handleClipboardPaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        setShowPaste(true);
        setPaste(clip);
      }
    } catch {
      setShowPaste(true);
    }
  };

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-[1.65rem] border border-primary/20 bg-gradient-to-br from-white via-white to-accent/40 p-5 shadow-elevated"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-secondary/15 blur-3xl"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> 30-second CV
            </span>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground">
              {hasAnyData ? "Your CV in motion" : "Skip the form."}
              <br />
              {hasAnyData ? (
                <span className="text-gradient-warm-anim">Polish it your way.</span>
              ) : (
                <span className="text-gradient-warm-anim">We'll build it for you.</span>
              )}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {timelineCount > 0
                ? `We'll turn your ${timelineCount} captured ${
                    timelineCount === 1 ? "experience" : "experiences"
                  } into a draft CV — dates, skills, summary and all. You step in only to refine.`
                : "Capture a few experiences in your timeline first, then we'll write your CV from them. Or paste any bio below and we'll start there."}
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showPaste && (
            <AutoBuildHeroPastePanel
              paste={paste}
              parsed={parsed}
              onPasteChange={setPaste}
              onHide={() => {
                setShowPaste(false);
                setPaste("");
              }}
            />
          )}
        </AnimatePresence>

        <AutoBuildHeroBuildButton
          building={building}
          justBuilt={justBuilt}
          hasAnyData={hasAnyData}
          timelineCount={timelineCount}
          onBuild={handleBuild}
        />

        <AutoBuildHeroFooter
          showPaste={showPaste}
          hasAnyData={hasAnyData}
          customizing={customizing}
          filledCount={filledCount}
          totalCount={totalCount}
          onClipboardPaste={handleClipboardPaste}
          onPreview={onPreview}
          onCustomize={onCustomize}
        />
      </div>
    </motion.div>
  );
}
