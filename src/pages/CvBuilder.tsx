import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ArrowRight, Plus, X, Pencil,
  User, FileText, Briefcase, GraduationCap, Wrench, Award, Globe, Eye
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

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 pt-6 pb-2"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              CV Builder
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {hasAnyData ? "Your CV" : "Build Your CV"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/cv-preview")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-warm text-primary-foreground text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Fill in your details to create a professional CV. Your data is saved automatically.
        </p>
      </motion.div>

      <div className="flex-1 px-4 pt-3 pb-6 space-y-3">
        <SectionCard
          icon={<User className="w-4 h-4 text-muted-foreground" />}
          title="Personal Info"
          count={cv.personalInfo.fullName ? 1 : 0}
          expanded={personalExpanded}
          onToggle={() => setPersonalExpanded(!personalExpanded)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Full Name"
              value={cv.personalInfo.fullName}
              onChange={(v) => updatePersonal("fullName", v)}
              placeholder="John Smith"
              required
              error={cv.personalInfo.fullName.length > 0 && cv.personalInfo.fullName.length < 2 ? "Min 2 characters" : ""}
            />
            <InputField
              label="Email"
              value={cv.personalInfo.email}
              onChange={(v) => updatePersonal("email", v)}
              placeholder="john@email.com"
              type="email"
              error={cv.personalInfo.email.length > 0 && !emailValid(cv.personalInfo.email) ? "Invalid email" : ""}
            />
            <InputField
              label="Phone"
              value={cv.personalInfo.phone}
              onChange={(v) => updatePersonal("phone", v)}
              placeholder="+1 (555) 123-4567"
            />
            <InputField
              label="Location"
              value={cv.personalInfo.location}
              onChange={(v) => updatePersonal("location", v)}
              placeholder="City, State"
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
                    label="LinkedIn"
                    value={cv.personalInfo.linkedin ?? ""}
                    onChange={(v) => updatePersonal("linkedin", v)}
                    placeholder="linkedin.com/in/you"
                  />
                  <InputField
                    label="Website"
                    value={cv.personalInfo.website ?? ""}
                    onChange={(v) => updatePersonal("website", v)}
                    placeholder="yourportfolio.com"
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
          title="Professional Summary"
          count={cv.professionalSummary ? 1 : 0}
          expanded={summaryExpanded}
          onToggle={() => setSummaryExpanded(!summaryExpanded)}
        >
          <Textarea
            value={cv.professionalSummary}
            onChange={(e) => setCvData({ ...cv, professionalSummary: e.target.value })}
            placeholder="Brief overview of your background, skills, and career goals..."
            className="rounded-xl bg-background border-border min-h-[100px] text-sm focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
            maxLength={600}
          />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {cv.professionalSummary.length}/600 characters
          </p>
        </SectionCard>

        <EntryListSection
          icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
          title="Work Experience"
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
          title="Skills"
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
  icon, title, count, expanded, onToggle, children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
          {count > 0 && (
            <span className="min-w-[20px] h-5 rounded-full bg-primary flex items-center justify-center px-1.5 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </div>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.span>
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
  label, value, onChange, placeholder, type = "text", required, error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}{required ? " *" : ""}
      </span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 text-sm rounded-xl bg-background ${error ? "border-destructive focus:ring-destructive/20" : "border-border focus:ring-primary/20"} transition-shadow`}
      />
      {error && (
        <p className="text-[11px] text-destructive mt-1">{error}</p>
      )}
    </label>
  );
}

function EntryListSection({
  icon, title, entries, sectionKey, expanded, onToggle,
  editingId, editingSection,
  onAdd, onEdit, onRemove, onUpdateEntry, onSaveEdit, onCancelEdit,
}: {
  icon: React.ReactNode;
  title: string;
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
  return (
    <SectionCard icon={icon} title={title} count={entries.length} expanded={expanded} onToggle={onToggle}>
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
          Add {title.replace(/s$/, "")}
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

  return (
    <div className="p-3.5 rounded-xl bg-accent/30 border border-primary/30 space-y-3">
      <div className="space-y-2.5">
        <Input
          value={entry.title}
          onChange={(e) => onUpdate({ ...entry, title: e.target.value })}
          placeholder={titleLabel}
          className="h-10 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
        />
        <Input
          value={entry.organization}
          onChange={(e) => onUpdate({ ...entry, organization: e.target.value })}
          placeholder={orgLabel}
          className="h-10 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
        />
        {!isCert && (
          <Input
            value={entry.location ?? ""}
            onChange={(e) => onUpdate({ ...entry, location: e.target.value || undefined })}
            placeholder="Location (optional)"
            className="h-10 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
          />
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
              {isCert ? "Year" : "Start"} *
            </span>
            <Input
              value={entry.startDate}
              onChange={(e) => onUpdate({ ...entry, startDate: e.target.value })}
              placeholder={isCert ? "2024" : "YYYY-MM"}
              maxLength={7}
              className="h-10 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {isCert ? (
            <div />
          ) : !entry.isCurrent ? (
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                End
              </span>
              <Input
                value={entry.endDate ?? ""}
                onChange={(e) => onUpdate({ ...entry, endDate: e.target.value || undefined })}
                placeholder="YYYY-MM"
                maxLength={7}
                className="h-10 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ) : (
            <div />
          )}
        </div>
        {!isCert && (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
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
          <Textarea
            value={entry.description ?? ""}
            onChange={(e) => onUpdate({ ...entry, description: e.target.value || undefined })}
            placeholder="Brief description of your role and achievements..."
            className="rounded-xl bg-background border-border min-h-[64px] text-sm focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
            maxLength={500}
          />
        )}
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
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Add a skill to ${activeCategory.label}...`}
        className="h-10 text-sm rounded-xl bg-background border-border mb-3 focus:ring-2 focus:ring-primary/20"
      />

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
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Type and press Enter..."}
        className="h-10 text-sm rounded-xl bg-background border-border mb-3 focus:ring-2 focus:ring-primary/20"
      />
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
