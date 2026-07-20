/**
 * Live preview of the CV header as identity fields are edited.
 *
 * Exports: HeaderPreview
 * Depends on: framer-motion, lucide-react, @/lib/storage
 */

import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sparkles } from "lucide-react";
import type { CvPersonalInfo } from "@/lib/storage";

export interface HeaderPreviewProps {
  info: CvPersonalInfo;
}

/** Animated preview card showing name, contact, and link badges. */
export function HeaderPreview({ info }: HeaderPreviewProps) {
  const hasName = !!info.fullName;
  const meta = [info.email, info.phone, info.location].filter(Boolean);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative mb-4 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-white via-white to-accent/30 p-4 shadow-card"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
      />
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
        Live header preview
      </p>
      <AnimatePresence mode="wait">
        <motion.h3
          key={hasName ? info.fullName : "placeholder"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`text-2xl font-bold leading-tight ${
            hasName ? "text-foreground" : "text-muted-foreground/55"
          }`}
        >
          {hasName ? info.fullName : "Your name appears here"}
        </motion.h3>
      </AnimatePresence>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
        {meta.length > 0 ? (
          meta.map((m) => (
            <motion.span
              key={m}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center"
            >
              {m}
            </motion.span>
          ))
        ) : (
          <span className="text-muted-foreground/45">Contact details appear here</span>
        )}
      </div>
      {(info.linkedin || info.website) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {info.linkedin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Link2 className="h-2.5 w-2.5" /> LinkedIn
            </span>
          )}
          {info.website && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Sparkles className="h-2.5 w-2.5" /> Site
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
