import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";

interface ToneTemplate {
  id: string;
  label: string;
  emoji: string;
  /** Prefilled body inserted when the chip is tapped. */
  template: string;
}

interface StoryTextareaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Helper text shown below the field. */
  guide?: string;
  /** Rotating placeholders shown via a soft typewriter effect when empty. */
  rotatingPlaceholders?: string[];
  /** Maximum character length. */
  maxLength?: number;
  /** Tone-chip templates that prefill the textarea when tapped. */
  tones?: ToneTemplate[];
  /** Icon shown inside the field (left side, top). */
  icon?: ReactNode;
  /** Sweet-spot character range. Counter color shifts when in range. */
  sweetSpot?: { min: number; max: number };
  minHeight?: string;
}

/**
 * A textarea that feels alive: rotating typewriter placeholder, tone-chip
 * prefills, and a colour-shifting counter that rewards entering the
 * "just right" length range.
 */
export function StoryTextarea({
  label,
  value,
  onChange,
  guide,
  rotatingPlaceholders = [],
  maxLength,
  tones,
  icon,
  sweetSpot,
  minHeight = "min-h-[140px]",
}: StoryTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState(rotatingPlaceholders[0] ?? "");
  const phIndex = useRef(0);
  const charIndex = useRef(0);
  const direction = useRef<"typing" | "deleting" | "pausing">("typing");

  // Typewriter cycle — only runs while value is empty + field not focused
  useEffect(() => {
    if (!rotatingPlaceholders.length) return;
    if (value.length > 0 || focused) return;

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const target = rotatingPlaceholders[phIndex.current] ?? "";
      const len = charIndex.current;

      if (direction.current === "typing") {
        if (len < target.length) {
          charIndex.current = len + 1;
          setPlaceholder(target.slice(0, charIndex.current));
          timer = setTimeout(tick, 38 + Math.random() * 30);
        } else {
          direction.current = "pausing";
          timer = setTimeout(tick, 1600);
        }
      } else if (direction.current === "pausing") {
        direction.current = "deleting";
        timer = setTimeout(tick, 60);
      } else {
        if (len > 0) {
          charIndex.current = len - 1;
          setPlaceholder(target.slice(0, charIndex.current));
          timer = setTimeout(tick, 16);
        } else {
          phIndex.current = (phIndex.current + 1) % rotatingPlaceholders.length;
          direction.current = "typing";
          timer = setTimeout(tick, 200);
        }
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [rotatingPlaceholders, value, focused]);

  const counter = value.length;
  const sweetState = sweetSpot
    ? counter < sweetSpot.min
      ? "low"
      : counter <= sweetSpot.max
      ? "good"
      : "high"
    : "neutral";

  const counterClass =
    sweetState === "good"
      ? "text-emerald-600"
      : sweetState === "high"
      ? "text-amber-600"
      : sweetState === "low" && counter > 0
      ? "text-primary"
      : "text-muted-foreground";

  return (
    <div>
      {tones && tones.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Wand2 className="h-3 w-3" /> Start from a tone
          </span>
          {tones.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(t.template)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <span className="text-sm leading-none">{t.emoji}</span>
              {t.label}
            </motion.button>
          ))}
        </div>
      )}

      <motion.div
        animate={focused ? "focus" : "rest"}
        variants={{
          rest: { boxShadow: "0 0 0 0 hsl(32 95% 52% / 0)" },
          focus: { boxShadow: "0 10px 30px -14px hsl(32 95% 52% / 0.45)" },
        }}
        className={`relative rounded-2xl border bg-white/85 backdrop-blur-sm transition-colors ${
          focused ? "border-primary/60" : "border-border"
        }`}
      >
        <button
          type="button"
          onClick={() => ref.current?.focus()}
          className="absolute inset-0 cursor-text rounded-2xl"
          aria-hidden
          tabIndex={-1}
        />

        <div className="relative flex gap-2.5 p-3.5">
          {icon && (
            <motion.span
              animate={focused ? { scale: 1.08, rotate: -4 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                focused || value.length > 0
                  ? "bg-accent text-primary shadow-sm"
                  : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {icon}
            </motion.span>
          )}
          <div className="relative flex-1">
            <motion.label
              animate={{
                y: focused || value.length > 0 ? -2 : 4,
                scale: focused || value.length > 0 ? 0.85 : 1,
                color:
                  focused || value.length > 0
                    ? "hsl(32 95% 42%)"
                    : "hsl(24 8% 46%)",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-none absolute left-0 top-0 origin-left text-sm font-semibold"
            >
              {label}
            </motion.label>
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={value.length === 0 && !focused ? placeholder : ""}
              maxLength={maxLength}
              className={`mt-5 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55 ${minHeight}`}
            />
          </div>
        </div>

        {/* Bottom row: guide left, counter right */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3.5 py-2">
          <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">
            {guide}
          </p>
          {maxLength && (
            <div className="flex items-center gap-2">
              {sweetState === "good" && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600"
                >
                  <Sparkles className="h-3 w-3" />
                  Sweet spot
                </motion.span>
              )}
              <span className={`text-[11px] font-bold tabular-nums ${counterClass}`}>
                {counter}/{maxLength}
              </span>
            </div>
          )}
        </div>

        {/* Animated underline */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.32, ease: [0.22, 0.7, 0.35, 1] }}
          className="pointer-events-none absolute left-3 right-3 bottom-[3px] h-[2px] origin-left rounded-full gradient-warm"
        />
      </motion.div>

      {/* Sweet-spot bar */}
      {sweetSpot && maxLength && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (counter / maxLength) * 100)}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
            className={`h-full rounded-full ${
              sweetState === "good"
                ? "bg-emerald-500"
                : sweetState === "high"
                ? "bg-amber-500"
                : "gradient-warm"
            }`}
          />
        </div>
      )}

      <AnimatePresence>
        {sweetSpot && counter > 0 && (
          <motion.p
            key={sweetState}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-[11px] font-medium text-muted-foreground"
          >
            {sweetState === "low" &&
              `A bit more — aim for ${sweetSpot.min}+ characters to give it weight.`}
            {sweetState === "good" &&
              "Right in the pocket. Recruiters love this length."}
            {sweetState === "high" &&
              "Powerful — but tighten anything that doesn't earn its place."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
