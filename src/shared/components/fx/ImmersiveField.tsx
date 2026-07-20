/**
 * Immersive text input with floating label, focus glow, and validity chip.
 *
 * Exports: ImmersiveField
 * Depends on: framer-motion, ImmersiveFieldStatus, ImmersiveFieldGuide
 */

import { useId, useRef, useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImmersiveFieldStatus } from "@/shared/components/fx/ImmersiveFieldStatus";
import { ImmersiveFieldGuide } from "@/shared/components/fx/ImmersiveFieldGuide";

interface ImmersiveFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Static helper text shown below the field. */
  guide?: string;
  /** Icon shown inside the field (left side). */
  icon?: ReactNode;
  type?: string;
  required?: boolean;
  error?: string;
  /** When true, validity-pass chip shows on right when value is non-empty + no error. */
  showValidity?: boolean;
  /** Optional additional content (e.g. live preview chip) rendered above the field. */
  topAccessory?: ReactNode;
  /** Optional content rendered below the field (e.g. inline date picker). */
  bottomAccessory?: ReactNode;
  inputMode?: "text" | "email" | "tel" | "url" | "numeric";
  autoComplete?: string;
  className?: string;
}

/**
 * Immersive input with floating label, gradient focus ring, and validity indicator.
 */
export function ImmersiveField({
  label,
  value,
  onChange,
  placeholder,
  guide,
  icon,
  type = "text",
  required,
  error,
  showValidity = true,
  topAccessory,
  bottomAccessory,
  inputMode,
  autoComplete,
  className = "",
}: ImmersiveFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [justTyped, setJustTyped] = useState(false);
  const lifted = focused || value.length > 0;
  const isValid = !error && value.trim().length > 0;

  useEffect(() => {
    if (justTyped) {
      const t = setTimeout(() => setJustTyped(false), 240);
      return () => clearTimeout(t);
    }
  }, [justTyped]);

  return (
    <div className={className}>
      {topAccessory}
      <motion.div
        animate={focused ? "focus" : "rest"}
        variants={{
          rest: { boxShadow: "0 0 0 0 hsl(32 95% 52% / 0)" },
          focus: { boxShadow: "0 6px 22px -10px hsl(32 95% 52% / 0.45)" },
        }}
        className={`relative rounded-2xl border bg-white/85 backdrop-blur-sm transition-colors ${
          error
            ? "border-destructive/60"
            : focused
            ? "border-primary/60"
            : "border-border"
        }`}
      >
        <AnimatePresence>
          {focused && (
            <motion.span
              key="sheen"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, hsl(32 95% 60% / 0.08) 50%, transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="absolute inset-0 z-0 cursor-text rounded-2xl"
          aria-hidden
          tabIndex={-1}
        />

        <div className="relative z-10 flex items-center gap-2.5 px-3.5">
          {icon && (
            <motion.span
              animate={
                focused
                  ? { scale: 1.08, rotate: -4 }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                focused || value.length > 0
                  ? "bg-accent text-primary shadow-sm"
                  : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {icon}
            </motion.span>
          )}

          <div className="relative flex-1 pt-5 pb-2">
            <motion.label
              htmlFor={id}
              animate={{
                y: lifted ? -16 : 0,
                scale: lifted ? 0.82 : 1,
                color: lifted
                  ? error
                    ? "hsl(0 68% 48%)"
                    : "hsl(32 95% 42%)"
                  : "hsl(24 8% 46%)",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-none absolute left-0 top-5 origin-left text-sm font-semibold leading-none"
            >
              {label}
              {required && <span className="ml-0.5 text-primary">*</span>}
            </motion.label>
            <input
              id={id}
              ref={inputRef}
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                if (!justTyped) setJustTyped(true);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={lifted ? placeholder : ""}
              className="block w-full bg-transparent text-sm font-medium leading-tight text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>

          <ImmersiveFieldStatus
            error={error}
            isValid={isValid}
            showValidity={showValidity}
          />
        </div>

        <motion.div
          aria-hidden
          initial={false}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.32, ease: [0.22, 0.7, 0.35, 1] }}
          className="pointer-events-none absolute left-3 right-3 bottom-[3px] h-[2px] origin-left rounded-full gradient-warm"
        />

        <AnimatePresence>
          {justTyped && (
            <motion.span
              key="pulse"
              initial={{ opacity: 0.4, scale: 0.96 }}
              animate={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.24 }}
              className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/40"
            />
          )}
        </AnimatePresence>
      </motion.div>

      <ImmersiveFieldGuide error={error} guide={guide} focused={focused} />

      {bottomAccessory}
    </div>
  );
}
