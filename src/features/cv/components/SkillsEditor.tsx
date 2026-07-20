/**
 * Skill palette editor with category tabs and suggestion chips.
 *
 * Exports: SkillsEditor
 * Depends on: framer-motion, lucide-react, shared ui Input, @/lib/storage, constants
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { SKILL_CATEGORIES, type SkillGroup } from "@/features/cv/lib/skillCategories";
import { SkillCategoryTabs } from "@/features/cv/components/SkillCategoryTabs";

export interface SkillsEditorProps {
  skillGroups: SkillGroup[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  onAddSkill: (categoryId: string, skillName: string) => void;
  onRemoveSkill: (categoryId: string, skillName: string) => void;
}

/** Browse-and-add skill editor grouped by field and category. */
export function SkillsEditor({
  skillGroups,
  activeCategoryId,
  onCategoryChange,
  onAddSkill,
  onRemoveSkill,
}: SkillsEditorProps) {
  const [input, setInput] = useState("");

  const activeCategory = SKILL_CATEGORIES.find((c) => c.id === activeCategoryId)!;

  const activeGroupSkills = new Set(
    skillGroups.find((g) => g.category === activeCategoryId)?.skills ?? []
  );
  const availableSuggestions = activeCategory.skills.filter(
    (s) => !activeGroupSkills.has(s)
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAddSkill(activeCategoryId, input.trim());
      setInput("");
    }
  };

  const fallbackPillClasses = "bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";

  return (
    <div>
      <label className="mb-3 block rounded-2xl border border-border bg-background/70 p-3 focus-within:border-primary/45 focus-within:bg-white">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-primary">
            <Wand2 className="h-4 w-4" />
          </span>
          Add your own skill
        </span>
        <span className="mb-2 block text-[11px] leading-relaxed text-muted-foreground">
          Type a skill that is missing from the chips, then press Enter.
        </span>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Example: ${activeCategory.skills[0] ?? activeCategory.label}`}
          className="h-11 rounded-xl bg-white text-sm shadow-sm placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <SkillCategoryTabs
        skillGroups={skillGroups}
        activeCategoryId={activeCategoryId}
        onCategoryChange={onCategoryChange}
      />

      {availableSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {availableSuggestions.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.94 }}
              onClick={() => onAddSkill(activeCategoryId, s)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/60 text-accent-foreground border border-transparent hover:border-primary/40 transition-colors"
            >
              + {s}
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic mb-3">
          All {activeCategory.label} suggestions added ✨
        </p>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {skillGroups.map((group) => {
            if (group.skills.length === 0) return null;
            const cat = SKILL_CATEGORIES.find((c) => c.id === group.category);
            const displayLabel = cat?.label ?? (group.category === "general" ? "General" : group.category);
            const displayEmoji = cat?.emoji ?? "📌";
            const pillClasses = cat?.pillClasses ?? fallbackPillClasses;

            return (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {displayEmoji} {displayLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${pillClasses}`}
                    >
                      {skill}
                      <button
                        onClick={() => onRemoveSkill(group.category, skill)}
                        className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 -mr-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {skillGroups.filter((g) => g.skills.length > 0).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            No skills added yet. Browse categories above for suggestions, or type your own.
          </p>
        )}
      </div>
    </div>
  );
}
