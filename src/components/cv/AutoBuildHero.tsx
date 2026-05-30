import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  Eye,
  Settings2,
  ArrowRight,
  ClipboardPaste,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { parseQuickFill } from "@/lib/cvAutofill";
import { CvPersonalInfo } from "@/lib/storage";

interface AutoBuildHeroProps {
  /** Number of activities in the timeline. */
  timelineCount: number;
  /** Number of fields already filled across the CV. Used to drive the message. */
  filledCount: number;
  /** Total addressable fields/sections (5 = identity, story, experience, skills, education). */
  totalCount?: number;
  /** Whether the CV has any meaningful content yet. */
  hasAnyData: boolean;
  /** Called when the user taps the big magic action. Receives the parsed paste (may be empty). */
  onAutoBuild: (paste: Partial<CvPersonalInfo>) => void;
  /** Reveal the detailed editor. */
  onCustomize: () => void;
  /** Whether detailed customization is currently visible. */
  customizing: boolean;
  /** Open the preview/print page. */
  onPreview: () => void;
}

/**
 * The new top-of-page hero. It owns the single highest-value action:
 * "Build it for me", which combines:
 *   - paste-parse (if the user dropped text in the box)
 *   - timeline → experience import
 *   - skill auto-derivation
 *   - summary draft
 * The rest of the builder is hidden until the user explicitly asks to
 * customize.
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
      {/* Background flourishes */}
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

        {/* Optional paste assist */}
        <AnimatePresence initial={false}>
          {showPaste && (
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
                    onClick={() => {
                      setShowPaste(false);
                      setPaste("");
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Hide
                  </button>
                </div>
                <Textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
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
          )}
        </AnimatePresence>

        {/* Big action button */}
        <motion.button
          type="button"
          onClick={handleBuild}
          whileHover={!building ? { y: -2 } : undefined}
          whileTap={!building ? { scale: 0.985 } : undefined}
          disabled={building}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-warm py-4 text-base font-bold text-primary-foreground shadow-elevated shadow-glow transition-opacity hover:opacity-95"
        >
          <AnimatePresence mode="wait">
            {building ? (
              <motion.span
                key="building"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="h-5 w-5" />
                </motion.span>
                Conjuring your CV…
              </motion.span>
            ) : justBuilt ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Built! Refine anything below
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Wand2 className="h-5 w-5" />
                {hasAnyData
                  ? `Re-build from my ${timelineCount} ${
                      timelineCount === 1 ? "experience" : "experiences"
                    }`
                  : timelineCount > 0
                  ? `Build it for me (${timelineCount} ${
                      timelineCount === 1 ? "experience" : "experiences"
                    })`
                  : "Build a starter draft"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Secondary actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {!showPaste && (
              <button
                type="button"
                onClick={handleClipboardPaste}
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

        {/* Progress bar */}
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
      </div>
    </motion.div>
  );
}
