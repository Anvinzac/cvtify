/**
 * Tag-style string list input used for languages and similar fields.
 *
 * Exports: TagInput
 * Depends on: framer-motion, lucide-react, shared ui Input
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

export interface TagInputProps {
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

/** Enter-to-add tag editor with optional suggestion chips. */
export function TagInput({
  tags, onAdd, onRemove, suggestions, placeholder,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div>
      <label className="mb-3 block rounded-2xl border border-border bg-background/70 p-3 focus-within:border-primary/45 focus-within:bg-white">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-primary">
            <Globe className="h-4 w-4" />
          </span>
          Add one at a time
        </span>
        <span className="mb-2 block text-[11px] leading-relaxed text-muted-foreground">
          Include the fluency level if it helps your story.
        </span>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "English (Native), Spanish (Intermediate)..."}
          className="h-11 rounded-xl bg-white text-sm shadow-sm placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20"
        />
      </label>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions
            .filter((s) => !tags.includes(s))
            .slice(0, 12)
            .map((s) => (
              <motion.button
                key={s}
                whileTap={{ scale: 0.94 }}
                onClick={() => onAdd(s)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/60 text-accent-foreground border border-transparent hover:border-primary/40 transition-colors"
              >
                + {s}
              </motion.button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {tags.map((t) => (
            <motion.span
              key={t}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium gradient-warm text-primary-foreground shadow-sm"
            >
              {t}
              <button
                onClick={() => onRemove(t)}
                className="hover:bg-white/20 rounded-full p-0.5 -mr-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
