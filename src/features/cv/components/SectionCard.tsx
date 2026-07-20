/**
 * Collapsible card shell for a CV builder section.
 *
 * Exports: SectionCard
 * Depends on: framer-motion, lucide-react
 */

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  prompt?: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/** Expandable section wrapper with icon header and animated body. */
export function SectionCard({
  icon, title, subtitle, prompt, count, expanded, onToggle, children,
}: SectionCardProps) {
  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-[1.35rem] border shadow-card transition-colors ${
        expanded ? "border-primary/30 bg-white" : "border-border bg-card/90"
      }`}
    >
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                expanded ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
              }`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">{title}</span>
                {count > 0 && (
                  <span className="min-w-[22px] h-5 rounded-full bg-primary flex items-center justify-center px-1.5 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {subtitle}
                </p>
              )}
              {prompt && (
                <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                  {prompt}
                </p>
              )}
            </div>
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.7, 0.35, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
