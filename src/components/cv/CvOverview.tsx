import { motion } from "framer-motion";
import { User, FileText, Briefcase, Wrench, GraduationCap, Pencil, PlusCircle } from "lucide-react";
import { CvData } from "@/lib/storage";

interface CvOverviewProps {
  cv: CvData;
  onEditSection: (
    section: "identity" | "story" | "experience" | "skills" | "education"
  ) => void;
}

/**
 * Compact "what's in your CV right now" panel — replaces the long form
 * by default. Each tile shows a glance of the section's current state and
 * a single tap-to-edit affordance. No labels to fill, no fields to skim
 * past.
 */
export default function CvOverview({ cv, onEditSection }: CvOverviewProps) {
  const identityFilled =
    [cv.personalInfo.fullName, cv.personalInfo.email, cv.personalInfo.location].filter(Boolean).length;
  const skillsTotal = cv.skills.reduce((sum, g) => sum + g.skills.length, 0);

  const tiles = [
    {
      key: "identity" as const,
      icon: User,
      title: "Identity",
      done: identityFilled >= 2,
      summary: cv.personalInfo.fullName
        ? cv.personalInfo.fullName +
          (cv.personalInfo.location ? ` · ${cv.personalInfo.location}` : "")
        : "Name, contact, links",
      meta: identityFilled > 0 ? `${identityFilled} fields filled` : "Empty",
    },
    {
      key: "story" as const,
      icon: FileText,
      title: "Story",
      done: cv.professionalSummary.trim().length >= 80,
      summary:
        cv.professionalSummary.trim()
          ? cv.professionalSummary.slice(0, 90) +
            (cv.professionalSummary.length > 90 ? "…" : "")
          : "Your professional summary",
      meta:
        cv.professionalSummary.trim().length === 0
          ? "Empty"
          : `${cv.professionalSummary.length} chars`,
    },
    {
      key: "experience" as const,
      icon: Briefcase,
      title: "Experience",
      done: cv.workExperience.length > 0,
      summary:
        cv.workExperience.length > 0
          ? cv.workExperience
              .slice(0, 2)
              .map((e) => e.title || "Untitled")
              .join(", ") + (cv.workExperience.length > 2 ? ` +${cv.workExperience.length - 2}` : "")
          : "Roles, internships, projects",
      meta: cv.workExperience.length > 0 ? `${cv.workExperience.length} entries` : "Empty",
    },
    {
      key: "skills" as const,
      icon: Wrench,
      title: "Skills",
      done: skillsTotal >= 4,
      summary:
        skillsTotal > 0
          ? cv.skills
              .flatMap((g) => g.skills)
              .slice(0, 4)
              .join(", ") + (skillsTotal > 4 ? ` +${skillsTotal - 4}` : "")
          : "Tools, strengths, languages",
      meta: skillsTotal > 0 ? `${skillsTotal} skills` : "Empty",
    },
    {
      key: "education" as const,
      icon: GraduationCap,
      title: "Education",
      done: cv.education.length > 0,
      summary:
        cv.education.length > 0
          ? cv.education
              .slice(0, 2)
              .map((e) => e.title || "Untitled")
              .join(", ")
          : "School, degree, courses",
      meta: cv.education.length > 0 ? `${cv.education.length} entries` : "Empty",
    },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          What's in your CV
        </p>
        <p className="text-[11px] font-bold text-primary">
          Tap any block to refine
        </p>
      </div>
      <div className="space-y-2">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <motion.button
              key={tile.key}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onEditSection(tile.key)}
              className={`group flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                tile.done
                  ? "border-primary/20 bg-white shadow-card"
                  : "border-dashed border-border bg-background/70 hover:border-primary/30 hover:bg-white"
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                  tile.done
                    ? "border-primary/20 bg-accent text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {tile.title}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      tile.done
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    {tile.done ? "Looking good" : tile.meta}
                  </span>
                </div>
                <p
                  className={`mt-1 truncate text-xs ${
                    tile.done ? "text-foreground/80" : "text-muted-foreground/70 italic"
                  }`}
                >
                  {tile.summary}
                </p>
              </div>
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                {tile.done ? <Pencil className="h-3 w-3" /> : <PlusCircle className="h-3.5 w-3.5" />}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
