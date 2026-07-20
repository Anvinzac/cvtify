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
import { SKILL_FIELD_SECTIONS } from "@/features/cv/lib/constants";

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
  const activeSection =
    SKILL_FIELD_SECTIONS.find((section) => section.categoryIds.includes(activeCategoryId)) ??
    SKILL_FIELD_SECTIONS[0];
  const visibleCategories = SKILL_CATEGORIES.filter((cat) =>
    activeSection.categoryIds.includes(cat.id)
  );

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

      <div className="mb-3 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-0.5">
          {SKILL_FIELD_SECTIONS.map((section) => {
            const isActive = section.id === activeSection.id;
            const count = section.categoryIds.reduce(
              (sum, categoryId) =>
                sum + (skillGroups.find((g) => g.category === categoryId)?.skills.length ?? 0),
              0
            );

            return (
              <motion.button
                key={section.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => onCategoryChange(section.categoryIds[0])}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <span>{section.label}</span>
                {count > 0 && (
                  <span className="min-w-[16px] h-4 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center px-1 text-[10px]">
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {visibleCategories.map((cat) => {
          const count = skillGroups.find((g) => g.category === cat.id)?.skills.length ?? 0;
          const isActive = cat.id === activeCategoryId;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 inline-flex min-w-[132px] max-w-[190px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition-colors ${
                isActive
                  ? `${cat.pillClasses} shadow-sm`
                  : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:bg-accent/30 hover:text-foreground"
              }`}
            >
              <span className="text-sm leading-none">{cat.emoji}</span>
              <span className="min-w-0 flex-1 truncate">{cat.label}</span>
              {count > 0 && (
                <span className="shrink-0 min-w-[18px] h-5 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center px-1 text-[10px] font-bold">
                  {count}
                </span>
              )}
            </motion.button>
          );
          })}
        </div>
      </div>

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
