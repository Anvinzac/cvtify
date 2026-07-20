/**
 * Hobbies picker section on the report card.
 *
 * Exports: ReportHobbiesSection
 */

import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import { HOBBY_OPTIONS } from "@/features/insights/lib/catalog";

interface ReportHobbiesSectionProps {
  hobbies: string[];
  onToggleHobby: (hobby: string) => void;
}

/** Lets the user select creative hobbies for event matching. */
export function ReportHobbiesSection({ hobbies, onToggleHobby }: ReportHobbiesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border shadow-card p-5"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
          <Palette className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">Creative side</h2>
          <p className="text-[11px] text-muted-foreground">Hobbies & passions</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Select your creative interests to find matching events
      </p>
      <div className="flex flex-wrap gap-2">
        {HOBBY_OPTIONS.map((h) => (
          <motion.button
            key={h}
            onClick={() => onToggleHobby(h)}
            whileTap={{ scale: 0.94 }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
              hobbies.includes(h)
                ? "gradient-warm text-primary-foreground border-transparent shadow-sm"
                : "bg-card text-foreground border-border hover:border-primary/30"
            }`}
          >
            {h}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
