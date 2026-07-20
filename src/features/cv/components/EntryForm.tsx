/**
 * Inline edit form for a single CV entry (work, education, or certification).
 *
 * Exports: EntryForm
 * Depends on: framer-motion, lucide-react, shared fx components, constants
 */

import { motion } from "framer-motion";
import {
  Award, Briefcase, Building2, FileText, GraduationCap, MapPin, Sparkles,
} from "lucide-react";
import type { CvEntry } from "@/features/cv/types";
import { ImmersiveField } from "@/shared/components/fx/ImmersiveField";
import { StoryTextarea } from "@/shared/components/fx/StoryTextarea";
import { MonthYearField } from "@/shared/components/fx/MonthYearField";
import { PROOF_PLACEHOLDERS } from "@/features/cv/lib/constants";

export interface EntryFormProps {
  entry: CvEntry;
  sectionKey: "workExperience" | "education" | "certifications";
  onUpdate: (entry: CvEntry) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Full-screen inline editor for one CV list entry. */
export function EntryForm({
  entry, sectionKey, onUpdate, onSave, onCancel,
}: EntryFormProps) {
  const isCert = sectionKey === "certifications";
  const titleLabel = isCert ? "Certification Name" : sectionKey === "education" ? "Degree / Field" : "Job Title";
  const orgLabel = isCert ? "Issuer" : sectionKey === "education" ? "School" : "Company";
  const titlePlaceholder = isCert
    ? "Google Data Analytics Certificate"
    : sectionKey === "education"
    ? "B.S. Computer Science"
    : "Customer Experience Associate";
  const orgPlaceholder = isCert
    ? "Coursera / Google"
    : sectionKey === "education"
    ? "University of California, Berkeley"
    : "Campus Coffee Co.";
  const titleGuide = isCert
    ? "Name the credential exactly as it should appear."
    : sectionKey === "education"
    ? "Use the degree, major, program, or course name."
    : "Use the role title that best represents what you did.";
  const orgGuide = isCert
    ? "Who issued or hosted it?"
    : sectionKey === "education"
    ? "Where did you study or train?"
    : "Where did this work happen?";

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 space-y-3">
      <div className="rounded-2xl border border-primary/20 bg-white/75 p-3">
        <div className="mb-3 flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-warm text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Capture this chapter</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Keep it concrete: what you did, where it happened, and the result or skill it proves.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <ImmersiveField
            icon={isCert ? <Award className="h-4 w-4" /> : sectionKey === "education" ? <GraduationCap className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
            label={titleLabel}
            value={entry.title}
            onChange={(value) => onUpdate({ ...entry, title: value })}
            placeholder={titlePlaceholder}
            guide={titleGuide}
            required
          />
          <ImmersiveField
            icon={<Building2 className="h-4 w-4" />}
            label={orgLabel}
            value={entry.organization}
            onChange={(value) => onUpdate({ ...entry, organization: value })}
            placeholder={orgPlaceholder}
            guide={orgGuide}
            required
          />
          {!isCert && (
            <ImmersiveField
              icon={<MapPin className="h-4 w-4" />}
              label="Place"
              value={entry.location ?? ""}
              onChange={(value) => onUpdate({ ...entry, location: value || undefined })}
              placeholder="Berkeley, CA"
              guide="Optional. City, remote, hybrid, or campus is enough."
            />
          )}
          <div className={`grid gap-2.5 ${isCert || entry.isCurrent ? "grid-cols-1" : "grid-cols-2"}`}>
            <MonthYearField
              label={isCert ? "Year earned" : "Started"}
              value={entry.startDate}
              onChange={(value) => onUpdate({ ...entry, startDate: value })}
              precision={isCert ? "year" : "month"}
              required
              guide={isCert ? "Just the year works." : undefined}
            />
            {!isCert && !entry.isCurrent && (
              <MonthYearField
                label="Ended"
                value={entry.endDate ?? ""}
                onChange={(value) => onUpdate({ ...entry, endDate: value || undefined })}
                guide="Leave empty if open-ended."
              />
            )}
          </div>
          {!isCert && (
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  ...entry,
                  isCurrent: !entry.isCurrent,
                  endDate: entry.isCurrent ? undefined : entry.endDate,
                })
              }
              className={`group flex w-full items-center gap-2.5 rounded-2xl border p-3 text-left transition-colors ${
                entry.isCurrent
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-background/70 hover:border-primary/25"
              }`}
            >
              <span
                className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
                  entry.isCurrent ? "bg-primary" : "bg-muted"
                }`}
              >
                <motion.span
                  className="absolute top-[2px] block h-4 w-4 rounded-full bg-white shadow-sm"
                  animate={{ left: entry.isCurrent ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </span>
              <span className={`text-xs font-semibold ${entry.isCurrent ? "text-primary" : "text-foreground"}`}>
                I currently {sectionKey === "education" ? "study" : "work"} here
              </span>
              {entry.isCurrent && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-auto text-[10px] font-bold uppercase tracking-wider text-primary"
                >
                  Live
                </motion.span>
              )}
            </button>
          )}
          {!isCert && (
            <StoryTextarea
              icon={<FileText className="h-4 w-4" />}
              label="Proof notes"
              value={entry.description ?? ""}
              onChange={(value) => onUpdate({ ...entry, description: value || undefined })}
              rotatingPlaceholders={PROOF_PLACEHOLDERS}
              guide="Use action verbs. Mention tools, people, pressure, outcomes, or what changed because of you."
              sweetSpot={{ min: 120, max: 360 }}
              maxLength={500}
              minHeight="min-h-[108px]"
            />
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-border hover:bg-muted/60 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-2.5 text-xs font-semibold rounded-xl gradient-warm text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
        >
          Save
        </button>
      </div>
    </div>
  );
}
