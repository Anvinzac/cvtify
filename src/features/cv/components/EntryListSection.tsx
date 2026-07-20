/**
 * Collapsible list section for CV entries with inline add/edit/remove.
 *
 * Exports: EntryListSection
 * Depends on: framer-motion, lucide-react, SectionCard, EntryRow, EntryForm
 */

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import type { CvEntry } from "@/features/cv/types";
import { SectionCard } from "@/features/cv/components/SectionCard";
import { EntryRow } from "@/features/cv/components/EntryRow";
import { EntryForm } from "@/features/cv/components/EntryForm";

export interface EntryListSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  prompt?: string;
  entries: CvEntry[];
  sectionKey: "workExperience" | "education" | "certifications";
  expanded: boolean;
  onToggle: () => void;
  editingId: string | null;
  editingSection: "workExperience" | "education" | "certifications" | null;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateEntry: (entry: CvEntry) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  topAction?: React.ReactNode;
}

/** SectionCard wrapper around a list of editable CV entries. */
export function EntryListSection({
  icon, title, subtitle, prompt, entries, sectionKey, expanded, onToggle,
  editingId, editingSection,
  onAdd, onEdit, onRemove, onUpdateEntry, onSaveEdit, onCancelEdit,
  topAction,
}: EntryListSectionProps) {
  const addLabel =
    sectionKey === "workExperience"
      ? "Add experience"
      : sectionKey === "education"
      ? "Add education"
      : "Add certification";

  return (
    <SectionCard
      icon={icon}
      title={title}
      subtitle={subtitle}
      prompt={prompt}
      count={entries.length}
      expanded={expanded}
      onToggle={onToggle}
    >
      {topAction && <div className="mb-3">{topAction}</div>}
      <div className="space-y-2">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {editingSection === sectionKey && editingId === entry.id ? (
                <EntryForm
                  entry={entry}
                  sectionKey={sectionKey}
                  onUpdate={onUpdateEntry}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                />
              ) : (
                <EntryRow entry={entry} onEdit={() => onEdit(entry.id)} onRemove={() => onRemove(entry.id)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/40 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      </div>
    </SectionCard>
  );
}
