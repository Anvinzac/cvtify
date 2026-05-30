import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ArrowRight, Plus, X, Pencil,
  User, FileText, Briefcase, GraduationCap, Wrench, Award, Globe, Eye,
  Sparkles, Mail, Phone, MapPin, Link2, Building2, Calendar, Wand2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/context/AppContext";
import { CvEntry, CvPersonalInfo, SKILL_CATEGORIES, SkillGroup } from "@/lib/storage";

function formatDateRange(entry: CvEntry): string {
  const fmt = (d: string) => {
    const [y, m] = d.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1] ?? ""} ${y}`;
  };
  const start = fmt(entry.startDate);
  if (entry.isCurrent) return `${start} – Present`;
  if (entry.endDate) return `${start} – ${fmt(entry.endDate)}`;
  return start;
}

function emailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CvBuilder() {
  const navigate = useNavigate();
  const { cv, setCvData } = useAppState();

  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [educationExpanded, setEducationExpanded] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [certsExpanded, setCertsExpanded] = useState(false);
  const [languagesExpanded, setLanguagesExpanded] = useState(false);

  const [editingSection, setEditingSection] = useState<"workExperience" | "education" | "certifications" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showLinks, setShowLinks] = useState(!!(cv.personalInfo.linkedin || cv.personalInfo.website));
  const [activeCategoryId, setActiveCategoryId] = useState(SKILL_CATEGORIES[0].id);

  const updatePersonal = (field: keyof CvPersonalInfo, value: string) => {
    setCvData({ ...cv, personalInfo: { ...cv.personalInfo, [field]: value } });
  };

  const addEntry = (section: "workExperience" | "education" | "certifications") => {
    const entry: CvEntry = {
      id: Date.now().toString(),
      title: "",
      organization: "",
      startDate: "",
    };
    setCvData({ ...cv, [section]: [...cv[section], entry] });
    setEditingSection(section);
    setEditingId(entry.id);
  };

  const updateEntry = (section: "workExperience" | "education" | "certifications", entry: CvEntry) => {
    setCvData({
      ...cv,
      [section]: cv[section].map((e) => (e.id === entry.id ? entry : e)),
    });
  };

  const removeEntry = (section: "workExperience" | "education" | "certifications", id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setEditingSection(null);
    }
    setCvData({ ...cv, [section]: cv[section].filter((e) => e.id !== id) });
  };

  const startEditing = (section: "workExperience" | "education" | "certifications", id: string) => {
    setEditingSection(section);
    setEditingId(id);
  };

  const cancelEditing = () => {
    if (editingSection && editingId) {
      const entry = cv[editingSection].find((e) => e.id === editingId);
      if (entry && !entry.title && !entry.organization) {
        setCvData({ ...cv, [editingSection]: cv[editingSection].filter((e) => e.id !== editingId) });
      }
    }
    setEditingId(null);
    setEditingSection(null);
  };

  const saveEditing = () => {
    setEditingId(null);
    setEditingSection(null);
  };

  const addTag = (field: "languages", value: string) => {
    const trimmed = value.trim();
    if (trimmed && !cv[field].includes(trimmed)) {
      setCvData({ ...cv, [field]: [...cv[field], trimmed] });
    }
  };

  const removeTag = (field: "languages", value: string) => {
    setCvData({ ...cv, [field]: cv[field].filter((t) => t !== value) });
  };

  const addSkill = (categoryId: string, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const newGroups = cv.skills.map((g) => ({ ...g, skills: [...g.skills] }));
    const existingGroup = newGroups.find((g) => g.category === categoryId);

    if (existingGroup) {
      if (existingGroup.skills.includes(trimmed)) return;
      existingGroup.skills = [...existingGroup.skills, trimmed];
    } else {
      newGroups.push({ id: Date.now().toString(), category: categoryId, skills: [trimmed] });
    }

    setCvData({ ...cv, skills: newGroups });
  };

  const removeSkill = (categoryId: string, skillName: string) => {
    const newGroups = cv.skills
      .map((g) => (g.category === categoryId ? { ...g, skills: g.skills.filter((s) => s !== skillName) } : g))
      .filter((g) => g.skills.length > 0);

    setCvData({ ...cv, skills: newGroups });
  };

  const hasAnyData = cv.personalInfo.fullName || cv.professionalSummary ||
    cv.workExperience.length > 0 || cv.education.length > 0 ||
    cv.skills.some((g) => g.skills.length > 0) || cv.certifications.length > 0 ||
    cv.languages.length > 0;
  const completedSections = [
    !!cv.personalInfo.fullName,
    !!cv.professionalSummary,
    cv.workExperience.length > 0,
    cv.education.length > 0,
    cv.skills.some((g) => g.skills.length > 0),
  ].filter(Boolean).length;
  const progressPct = Math.round((completedSections / 5) * 100);

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-gradient-to-b from-secondary/10 via-primary/5 to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative px-4 pt-6 pb-3"
      >
        <div className="rounded-[1.65rem] border border-white/70 bg-white/70 p-4 shadow-elevated backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                <Sparkles className="h-3 w-3" />
                Guided CV studio
              </div>
              <h1 className="text-3xl font-bold leading-tight text-foreground">
                {hasAnyData ? "Shape your story" : "Build a CV that feels like you"}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Move through one inviting chapter at a time. Each prompt is tuned to help you sound specific, capable, and ready.
              </p>
            </div>
            <button
              onClick={() => navigate("/cv-preview")}
              className="shrink-0 inline-flex h-11 items-center gap-2 rounded-2xl border border-primary/20 bg-white px-3.5 text-xs font-bold text-primary shadow-sm transition-transform active:scale-[0.98]"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-border/70 bg-background/80 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Onboarding momentum</span>
              <span className="font-bold text-primary">{progressPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full gradient-warm"
              />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {["Identity", "Voice", "Proof", "School", "Skills"].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-xl px-2 py-1.5 text-center text-[10px] font-bold ${
                    i < completedSections
                      ? "bg-primary/10 text-primary"
                      : "bg-card text-muted-foreground"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative flex-1 px-4 pt-2 pb-6 space-y-3">
        <SectionCard
          icon={<User className="w-4 h-4 text-muted-foreground" />}
          title="Identity"
          subtitle="Set the first impression"
          prompt="Start with the details a recruiter needs to remember and reach you."
          count={cv.personalInfo.fullName ? 1 : 0}
          expanded={personalExpanded}
          onToggle={() => setPersonalExpanded(!personalExpanded)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              icon={<User className="h-4 w-4" />}
              label="Your headline name"
              value={cv.personalInfo.fullName}
              onChange={(v) => updatePersonal("fullName", v)}
              placeholder="Alex Chen"
              guide="Use the name you want at the top of the page."
              required
              error={cv.personalInfo.fullName.length > 0 && cv.personalInfo.fullName.length < 2 ? "Min 2 characters" : ""}
            />
            <InputField
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={cv.personalInfo.email}
              onChange={(v) => updatePersonal("email", v)}
              placeholder="alex@email.com"
              guide="Choose the inbox you actually check."
              type="email"
              error={cv.personalInfo.email.length > 0 && !emailValid(cv.personalInfo.email) ? "Invalid email" : ""}
            />
            <InputField
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={cv.personalInfo.phone}
              onChange={(v) => updatePersonal("phone", v)}
              placeholder="+1 (555) 123-4567"
              guide="Optional, but useful for fast follow-ups."
            />
            <InputField
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={cv.personalInfo.location}
              onChange={(v) => updatePersonal("location", v)}
              placeholder="San Francisco, CA"
              guide="City and country/state is enough."
            />
          </div>

          {!showLinks && (
            <button
              onClick={() => setShowLinks(true)}
              className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add link
            </button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <InputField
                    icon={<Link2 className="h-4 w-4" />}
                    label="LinkedIn"
                    value={cv.personalInfo.linkedin ?? ""}
                    onChange={(v) => updatePersonal("linkedin", v)}
                    placeholder="linkedin.com/in/you"
                    guide="A polished profile can carry extra proof."
                  />
                  <InputField
                    icon={<Sparkles className="h-4 w-4" />}
                    label="Website"
                    value={cv.personalInfo.website ?? ""}
                    onChange={(v) => updatePersonal("website", v)}
                    placeholder="yourportfolio.com"
                    guide="Portfolio, GitHub, Behance, writing, or personal site."
                  />
                </div>
                <button
                  onClick={() => {
                    updatePersonal("linkedin", "");
                    updatePersonal("website", "");
                    setShowLinks(false);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground mt-1.5 transition-colors"
                >
                  Remove links
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        <SectionCard
          icon={<FileText className="w-4 h-4 text-muted-foreground" />}
          title="Opening Story"
          subtitle="Write the 10-second version of you"
          prompt="Blend your strengths, experience, and direction into a confident introduction."
          count={cv.professionalSummary ? 1 : 0}
          expanded={summaryExpanded}
          onToggle={() => setSummaryExpanded(!summaryExpanded)}
        >
          <GuidedTextarea
            icon={<Wand2 className="h-4 w-4" />}
            label="Professional summary"
            value={cv.professionalSummary}
            onChange={(value) => setCvData({ ...cv, professionalSummary: value })}
            placeholder="Curious computer science student with hands-on experience in customer service, community projects, and React dashboards. I enjoy turning messy problems into clear, useful tools."
            guide="Try: who you are, what you have done, what kind of work energizes you."
            maxLength={600}
            minHeight="min-h-[132px]"
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {cv.professionalSummary.length}/600 characters
          </p>
        </SectionCard>

        <EntryListSection
          icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
          title="Experience Proof"
          subtitle="Turn roles into evidence"
          prompt="Add jobs, internships, projects, volunteering, or leadership work."
          entries={cv.workExperience}
          sectionKey="workExperience"
          expanded={experienceExpanded}
          onToggle={() => setExperienceExpanded(!experienceExpanded)}
          editingId={editingId}
          editingSection={editingSection}
          onAdd={() => addEntry("workExperience")}
          onEdit={(id) => startEditing("workExperience", id)}
          onRemove={(id) => removeEntry("workExperience", id)}
          onUpdateEntry={(e) => updateEntry("workExperience", e)}
          onSaveEdit={saveEditing}
          onCancelEdit={cancelEditing}
        />

        <EntryListSection
          icon={<GraduationCap className="w-4 h-4 text-muted-foreground" />}
          title="Education"
          subtitle="Show your learning path"
          prompt="Include degrees, schools, courses, bootcamps, or programs that shaped your direction."
          entries={cv.education}
          sectionKey="education"
          expanded={educationExpanded}
          onToggle={() => setEducationExpanded(!educationExpanded)}
          editingId={editingId}
          editingSection={editingSection}
          onAdd={() => addEntry("education")}
          onEdit={(id) => startEditing("education", id)}
          onRemove={(id) => removeEntry("education", id)}
          onUpdateEntry={(e) => updateEntry("education", e)}
          onSaveEdit={saveEditing}
          onCancelEdit={cancelEditing}
        />

        <SectionCard
          icon={<Wrench className="w-4 h-4 text-muted-foreground" />}
          title="Skill Palette"
          subtitle="Choose what you can bring"
          prompt="Browse fields, tap chips, and build a skill profile that feels specific."
          count={cv.skills.reduce((sum, g) => sum + g.skills.length, 0)}
          expanded={skillsExpanded}
          onToggle={() => setSkillsExpanded(!skillsExpanded)}
        >
          <SkillsEditor
            skillGroups={cv.skills}
            activeCategoryId={activeCategoryId}
            onCategoryChange={setActiveCategoryId}
            onAddSkill={addSkill}
            onRemoveSkill={removeSkill}
          />
        </SectionCard>

        <EntryListSection
          icon={<Award className="w-4 h-4 text-muted-foreground" />}
          title="Certifications"
          subtitle="Add extra signals"
          prompt="Certificates, licenses, workshops, and awards all help your CV feel credible."
          entries={cv.certifications}
          sectionKey="certifications"
          expanded={certsExpanded}
          onToggle={() => setCertsExpanded(!certsExpanded)}
          editingId={editingId}
          editingSection={editingSection}
          onAdd={() => addEntry("certifications")}
          onEdit={(id) => startEditing("certifications", id)}
          onRemove={(id) => removeEntry("certifications", id)}
          onUpdateEntry={(e) => updateEntry("certifications", e)}
          onSaveEdit={saveEditing}
          onCancelEdit={cancelEditing}
        />

        <SectionCard
          icon={<Globe className="w-4 h-4 text-muted-foreground" />}
          title="Languages"
          subtitle="Add communication range"
          prompt="Show the languages and fluency levels you can work with."
          count={cv.languages.length}
          expanded={languagesExpanded}
          onToggle={() => setLanguagesExpanded(!languagesExpanded)}
        >
          <TagInput
            tags={cv.languages}
            onAdd={(v) => addTag("languages", v)}
            onRemove={(v) => removeTag("languages", v)}
            placeholder="English (Native), Spanish (Intermediate)..."
          />
        </SectionCard>

        <div className="pt-4 pb-6 space-y-3">
          <button
            onClick={() => navigate("/cv-preview")}
            className="w-full h-12 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview &amp; Print CV
          </button>

          <button
            onClick={() => navigate("/categories")}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Discover your career fit
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon, title, subtitle, prompt, count, expanded, onToggle, children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  prompt?: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-[1.35rem] border shadow-card transition-colors ${
        expanded ? "border-primary/30 bg-white" : "border-border bg-card/90"
      }`}
    >
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                expanded ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
              }`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">{title}</span>
                {count > 0 && (
                  <span className="min-w-[22px] h-5 rounded-full bg-primary flex items-center justify-center px-1.5 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {subtitle}
                </p>
              )}
              {prompt && (
                <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
                  {prompt}
                </p>
              )}
            </div>
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 0.7, 0.35, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InputField({
  icon, label, value, onChange, placeholder, guide, type = "text", required, error,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  guide?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="group block rounded-2xl border border-border bg-background/70 p-3 transition-colors focus-within:border-primary/45 focus-within:bg-white">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-primary">
            {icon}
          </span>
        )}
        <span>{label}{required ? " *" : ""}</span>
      </span>
      {guide && (
        <span className="mb-2 block text-[11px] leading-relaxed text-muted-foreground">
          {guide}
        </span>
      )}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 rounded-xl bg-white text-sm shadow-sm placeholder:text-muted-foreground/55 ${
          error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary/20"
        } transition-shadow`}
      />
      {error && (
        <p className="text-[11px] text-destructive mt-1">{error}</p>
      )}
    </label>
  );
}

function GuidedTextarea({
  icon,
  label,
  value,
  onChange,
  placeholder,
  guide,
  maxLength,
  minHeight = "min-h-[96px]",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  guide?: string;
  maxLength?: number;
  minHeight?: string;
}) {
  return (
    <label className="group block rounded-2xl border border-border bg-background/70 p-3 transition-colors focus-within:border-primary/45 focus-within:bg-white">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-primary">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </span>
      {guide && (
        <span className="mb-2 block text-[11px] leading-relaxed text-muted-foreground">
          {guide}
        </span>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-xl bg-white text-sm shadow-sm placeholder:text-muted-foreground/55 focus:ring-2 focus:ring-primary/20 transition-shadow resize-none ${minHeight}`}
        maxLength={maxLength}
      />
    </label>
  );
}

function EntryListSection({
  icon, title, subtitle, prompt, entries, sectionKey, expanded, onToggle,
  editingId, editingSection,
  onAdd, onEdit, onRemove, onUpdateEntry, onSaveEdit, onCancelEdit,
}: {
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
}) {
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

function EntryRow({ entry, onEdit, onRemove }: {
  entry: CvEntry;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 border border-border/60 group hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {entry.title || "Untitled"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {entry.organization}
        </p>
        {entry.startDate && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatDateRange(entry)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EntryForm({
  entry, sectionKey, onUpdate, onSave, onCancel,
}: {
  entry: CvEntry;
  sectionKey: "workExperience" | "education" | "certifications";
  onUpdate: (entry: CvEntry) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
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
        <div className="space-y-3">
          <InputField
            icon={isCert ? <Award className="h-4 w-4" /> : sectionKey === "education" ? <GraduationCap className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
            label={titleLabel}
            value={entry.title}
            onChange={(value) => onUpdate({ ...entry, title: value })}
            placeholder={titlePlaceholder}
            guide={titleGuide}
            required
          />
          <InputField
            icon={<Building2 className="h-4 w-4" />}
            label={orgLabel}
            value={entry.organization}
            onChange={(value) => onUpdate({ ...entry, organization: value })}
            placeholder={orgPlaceholder}
            guide={orgGuide}
            required
          />
          {!isCert && (
            <InputField
              icon={<MapPin className="h-4 w-4" />}
              label="Place"
              value={entry.location ?? ""}
              onChange={(value) => onUpdate({ ...entry, location: value || undefined })}
              placeholder="Berkeley, CA"
              guide="Optional. City, remote, hybrid, or campus is enough."
            />
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <InputField
              icon={<Calendar className="h-4 w-4" />}
              label={isCert ? "Year earned" : "Started"}
              value={entry.startDate}
              onChange={(value) => onUpdate({ ...entry, startDate: value })}
              placeholder={isCert ? "2024" : "2024-06"}
              guide={isCert ? "Just the year works." : "Use YYYY-MM for clean sorting."}
              required
            />
            {isCert ? (
              <div />
            ) : !entry.isCurrent ? (
              <InputField
                icon={<Calendar className="h-4 w-4" />}
                label="Ended"
                value={entry.endDate ?? ""}
                onChange={(value) => onUpdate({ ...entry, endDate: value || undefined })}
                placeholder="2024-12"
                guide="Leave empty if the timing is open."
              />
            ) : (
              <div />
            )}
          </div>
          {!isCert && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-2xl border border-border bg-background/70 p-3">
              <div
                className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
                  entry.isCurrent ? "bg-primary" : "bg-muted"
                }`}
                onClick={() => onUpdate({
                  ...entry,
                  isCurrent: !entry.isCurrent,
                  endDate: entry.isCurrent ? undefined : entry.endDate,
                })}
              >
                <motion.div
                  className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm"
                  animate={{ left: entry.isCurrent ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                I currently {sectionKey === "education" ? "study" : "work"} here
              </span>
            </label>
          )}
          {!isCert && (
            <GuidedTextarea
              icon={<FileText className="h-4 w-4" />}
              label="Proof notes"
              value={entry.description ?? ""}
              onChange={(value) => onUpdate({ ...entry, description: value || undefined })}
              placeholder="Prepared drinks during busy shifts, trained new team members, and improved inventory handoff notes so weekend stockouts happened less often."
              guide="Use action verbs. Mention tools, people, pressure, outcomes, or what changed because of you."
              maxLength={500}
              minHeight="min-h-[104px]"
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

function SkillsEditor({
  skillGroups,
  activeCategoryId,
  onCategoryChange,
  onAddSkill,
  onRemoveSkill,
}: {
  skillGroups: SkillGroup[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  onAddSkill: (categoryId: string, skillName: string) => void;
  onRemoveSkill: (categoryId: string, skillName: string) => void;
}) {
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

const SKILL_FIELD_SECTIONS = [
  {
    id: "digital",
    label: "Digital",
    categoryIds: ["programming-tech", "data-analytics", "ai-automation"],
  },
  {
    id: "creative",
    label: "Creative",
    categoryIds: ["design-creative", "content-media", "marketing-sales"],
  },
  {
    id: "business",
    label: "Business",
    categoryIds: ["business-management", "finance-accounting", "admin-operations", "people-hr"],
  },
  {
    id: "specialized",
    label: "Specialized",
    categoryIds: ["healthcare", "engineering", "legal-compliance", "science-research"],
  },
  {
    id: "fieldwork",
    label: "Fieldwork",
    categoryIds: ["logistics-supply-chain", "sustainability-environment", "trades-manual", "hospitality-service", "education-teaching"],
  },
];

function TagInput({
  tags, onAdd, onRemove, suggestions, placeholder,
}: {
  tags: string[];
  onAdd: (s: string) => void;
  onRemove: (s: string) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
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
