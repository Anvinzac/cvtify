/**
 * Identity section of the CV builder (personal info + live header preview).
 *
 * Exports: PersonalSection
 * Depends on: framer-motion, lucide-react, shared fx, SectionCard, HeaderPreview, formatters
 */

import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Link2, Sparkles, Plus } from "lucide-react";
import type { CvPersonalInfo } from "@/features/cv/types";
import { ImmersiveField } from "@/shared/components/fx/ImmersiveField";
import { SectionCard } from "@/features/cv/components/SectionCard";
import { HeaderPreview } from "@/features/cv/components/HeaderPreview";
import { emailValid } from "@/features/cv/lib/formatters";

export interface PersonalSectionProps {
  personalInfo: CvPersonalInfo;
  expanded: boolean;
  showLinks: boolean;
  onToggle: () => void;
  onUpdatePersonal: (field: keyof CvPersonalInfo, value: string) => void;
  onShowLinks: (show: boolean) => void;
}

/** Collapsible identity editor with optional LinkedIn/website fields. */
export function PersonalSection({
  personalInfo,
  expanded,
  showLinks,
  onToggle,
  onUpdatePersonal,
  onShowLinks,
}: PersonalSectionProps) {
  return (
    <>
      <div id="cv-section-identity" />
      <SectionCard
        icon={<User className="w-4 h-4 text-muted-foreground" />}
        title="Identity"
        subtitle="Set the first impression"
        prompt="Start with the details a recruiter needs to remember and reach you."
        count={personalInfo.fullName ? 1 : 0}
        expanded={expanded}
        onToggle={onToggle}
      >
        <HeaderPreview info={personalInfo} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
          <ImmersiveField
            icon={<User className="h-4 w-4" />}
            label="Your headline name"
            value={personalInfo.fullName}
            onChange={(v) => onUpdatePersonal("fullName", v)}
            placeholder="Alex Chen"
            guide="Use the name you want at the top of the page."
            autoComplete="name"
            required
            error={personalInfo.fullName.length > 0 && personalInfo.fullName.length < 2 ? "Min 2 characters" : ""}
          />
          <ImmersiveField
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={personalInfo.email}
            onChange={(v) => onUpdatePersonal("email", v)}
            placeholder="alex@email.com"
            guide="Choose the inbox you actually check."
            type="email"
            inputMode="email"
            autoComplete="email"
            error={personalInfo.email.length > 0 && !emailValid(personalInfo.email) ? "Not a valid email" : ""}
          />
          <ImmersiveField
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={personalInfo.phone}
            onChange={(v) => onUpdatePersonal("phone", v)}
            placeholder="+1 (555) 123-4567"
            guide="Optional, but useful for fast follow-ups."
            inputMode="tel"
            autoComplete="tel"
          />
          <ImmersiveField
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={personalInfo.location}
            onChange={(v) => onUpdatePersonal("location", v)}
            placeholder="San Francisco, CA"
            guide="City and country/state is enough."
            autoComplete="address-level2"
          />
        </div>

        {!showLinks && (
          <motion.button
            onClick={() => onShowLinks(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-3 w-3" />
            Add a link · LinkedIn, portfolio…
          </motion.button>
        )}

        <AnimatePresence>
          {showLinks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 0.7, 0.35, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 mt-3">
                <ImmersiveField
                  icon={<Link2 className="h-4 w-4" />}
                  label="LinkedIn"
                  value={personalInfo.linkedin ?? ""}
                  onChange={(v) => onUpdatePersonal("linkedin", v)}
                  placeholder="linkedin.com/in/you"
                  guide="A polished profile can carry extra proof."
                  inputMode="url"
                />
                <ImmersiveField
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Website"
                  value={personalInfo.website ?? ""}
                  onChange={(v) => onUpdatePersonal("website", v)}
                  placeholder="yourportfolio.com"
                  guide="Portfolio, GitHub, Behance, writing, or personal site."
                  inputMode="url"
                />
              </div>
              <button
                onClick={() => {
                  onUpdatePersonal("linkedin", "");
                  onUpdatePersonal("website", "");
                  onShowLinks(false);
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground mt-2 transition-colors"
              >
                Remove links
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>
    </>
  );
}
