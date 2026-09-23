import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clipboard,
  Sparkles,
  Wand2,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { parseQuickFill, QuickFillResult } from "@/lib/cvAutofill";
import { CvPersonalInfo } from "@/lib/storage";

const FIELD_LABELS: Record<keyof CvPersonalInfo, string> = {
  fullName: "Name",
  email: "Email",
  phone: "Phone",
  location: "Location",
  linkedin: "LinkedIn",
  website: "Website",
};

const SAMPLE_PASTE = `Alex Chen
alex.chen@email.com · +1 (555) 234-5678
San Francisco, CA · linkedin.com/in/alexchen · alexchen.design

Computer science student & part-time barista. Building tools that help small teams move faster.`;

interface QuickFillCardProps {
  /** Called with the parsed personal info — caller decides which fields to commit. */
  onApply: (patch: Partial<CvPersonalInfo>) => void;
  /** Open the "borrow from your timeline" sheet. */
  onOpenTimelineImport: () => void;
  /** Number of activities the user has captured in the timeline. */
  timelineCount: number;
}

/**
 * A single paste-anything box at the top of the CV builder that extracts
 * what it can (name, email, phone, location, links) so users don't have to
 * type into every field individually. Also surfaces a "borrow from your
 * timeline" shortcut for experience entries.
 */
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
    const parsed = parseQuickFill(raw);
    setResult(parsed);
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
    // Quietly collapse after a beat
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

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="relative z-10 flex w-full items-start gap-3 p-4 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-warm text-primary-foreground shadow-glow">
          <Wand2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">
              Skip the typing
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Smart fill
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Paste your LinkedIn bio, email signature, or a sentence about
            yourself — or borrow what you've already captured in your timeline.
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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.7, 0.35, 1] }}
            className="relative z-10 overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Borrow from timeline */}
              {timelineCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenTimelineImport}
                  className="group relative flex w-full items-center gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-3 text-left transition-colors hover:bg-secondary/10"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      Borrow from your timeline
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      Turn any of your {timelineCount} captured{" "}
                      {timelineCount === 1 ? "experience" : "experiences"} into a
                      CV entry — dates, skills, and notes carry over.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-secondary">
                    Pick →
                  </span>
                </button>
              )}

              {/* Paste box */}
              <div className="rounded-2xl border border-border bg-white/85 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 px-3 pt-3">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Clipboard className="h-3 w-3" />
                    Paste anything about you
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setText(SAMPLE_PASTE);
                        handleParse(SAMPLE_PASTE);
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
                    setText(e.target.value);
                    handleParse(e.target.value);
                  }}
                  placeholder="Hi, I'm Alex Chen — alex@email.com, based in San Francisco. linkedin.com/in/alexchen…"
                  className="min-h-[88px] resize-none border-0 bg-transparent px-3 py-2 text-sm shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-0"
                />
              </div>

              {/* Result preview */}
              <AnimatePresence>
                {result && result.filled.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="rounded-2xl border border-primary/20 bg-primary/5 p-3"
                  >
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                      Detected {result.filled.length}{" "}
                      {result.filled.length === 1 ? "field" : "fields"}
                    </p>
                    <div className="space-y-1.5">
                      {result.filled.map((field) => {
                        const val = result[field];
                        if (typeof val !== "string") return null;
                        return (
                          <div
                            key={field}
                            className="flex items-center gap-2 text-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="font-bold text-foreground">
                              {FIELD_LABELS[field]}
                            </span>
                            <span className="truncate text-muted-foreground">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setText("");
                          setResult(null);
                        }}
                        className="flex-1 rounded-xl border border-border py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-muted/60"
                      >
                        Start over
                      </button>
                      <button
                        type="button"
                        onClick={handleApply}
                        className="flex-[2] rounded-xl gradient-warm py-2 text-[11px] font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
                      >
                        Fill {result.filled.length}{" "}
                        {result.filled.length === 1 ? "field" : "fields"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {applied && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {applied.length} {applied.length === 1 ? "field" : "fields"} added to your CV
                    <button
                      type="button"
                      onClick={() => setApplied(null)}
                      className="ml-auto text-emerald-700/70 hover:text-emerald-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
