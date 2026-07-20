/**
 * Tone-chip presets above StoryTextarea.
 *
 * Exports: StoryTextareaToneChips, ToneTemplate
 * Depends on: framer-motion, lucide-react
 */

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";

export interface ToneTemplate {
  id: string;
  label: string;
  emoji: string;
  template: string;
}

interface StoryTextareaToneChipsProps {
  tones: ToneTemplate[];
  onSelect: (template: string) => void;
}

/** Row of tone presets that prefill the textarea when tapped. */
export function StoryTextareaToneChips({ tones, onSelect }: StoryTextareaToneChipsProps) {
  if (!tones.length) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Wand2 className="h-3 w-3" /> Start from a tone
      </span>
      {tones.map((t) => (
        <motion.button
          key={t.id}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => onSelect(t.template)}
          className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="text-sm leading-none">{t.emoji}</span>
          {t.label}
        </motion.button>
      ))}
    </div>
  );
}
