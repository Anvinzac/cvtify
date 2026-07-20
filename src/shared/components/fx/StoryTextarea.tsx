/**
 * Animated textarea with typewriter placeholder, tone chips, and sweet-spot counter.
 *
 * Exports: StoryTextarea
 * Depends on: framer-motion, lucide-react, StoryTextarea* subcomponents, useStoryTextareaTypewriter
 */

import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StoryTextareaToneChips, type ToneTemplate } from "@/shared/components/fx/StoryTextareaToneChips";
import { StoryTextareaSweetSpot } from "@/shared/components/fx/StoryTextareaSweetSpot";
import { useStoryTextareaTypewriter } from "@/shared/components/fx/useStoryTextareaTypewriter";

export type { ToneTemplate };

interface StoryTextareaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  guide?: string;
  rotatingPlaceholders?: string[];
  maxLength?: number;
  tones?: ToneTemplate[];
  icon?: ReactNode;
  sweetSpot?: { min: number; max: number };
  minHeight?: string;
}

/** Textarea with rotating placeholder, tone prefills, and length coaching. */
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
  const placeholder = useStoryTextareaTypewriter(rotatingPlaceholders, value, focused);

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
      {tones && <StoryTextareaToneChips tones={tones} onSelect={onChange} />}

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

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3.5 py-2">
          <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">{guide}</p>
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

        <motion.div
          aria-hidden
          initial={false}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.32, ease: [0.22, 0.7, 0.35, 1] }}
          className="pointer-events-none absolute left-3 right-3 bottom-[3px] h-[2px] origin-left rounded-full gradient-warm"
        />
      </motion.div>

      <StoryTextareaSweetSpot
        sweetSpot={sweetSpot}
        maxLength={maxLength}
        counter={counter}
        sweetState={sweetState}
      />
    </div>
  );
}
