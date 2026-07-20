/**
 * Field and category tab bars for the skills editor.
 *
 * Exports: SkillCategoryTabs
 */

import { motion } from "framer-motion";
import { SKILL_CATEGORIES, type SkillGroup } from "@/features/cv/lib/skillCategories";
import { SKILL_FIELD_SECTIONS } from "@/features/cv/lib/constants";

interface SkillCategoryTabsProps {
  skillGroups: SkillGroup[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
}

/** Horizontal tabs for skill field sections and categories. */
export function SkillCategoryTabs({
  skillGroups,
  activeCategoryId,
  onCategoryChange,
}: SkillCategoryTabsProps) {
  const activeSection =
    SKILL_FIELD_SECTIONS.find((section) => section.categoryIds.includes(activeCategoryId)) ??
    SKILL_FIELD_SECTIONS[0];
  const visibleCategories = SKILL_CATEGORIES.filter((cat) =>
    activeSection.categoryIds.includes(cat.id)
  );

  return (
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
  );
}
