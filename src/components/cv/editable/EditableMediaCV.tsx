import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { InlineList, InlinePeriod, InlineText } from "./inline-edit";
import { budgetFor, CoverControls, PhotoTrack, type MediaBudget } from "./inline-media";
import { AIAssistButton } from "./AIAssistButton";
import type { EntryItem, GradProject, MediaPhoto } from "@/lib/mediaProject";
import { emptyCertificate, emptyEntry, themeStyle } from "@/lib/mediaProject";
import "./editable-cv.css";

/** Cubic-bezier easing shared by every reveal (typed tuple keeps framer-motion happy). */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Per-theme spring personality. Each theme's art direction implies a different
 * physical feel — nebula drifts, ember snaps, mono is precise, prism bounces.
 */
const THEME_SPRINGS: Record<string, { stiffness: number; damping: number; mass: number }> = {
  nebula: { stiffness: 60, damping: 24, mass: 1 },
  ember: { stiffness: 140, damping: 16, mass: 0.8 },
  aurora: { stiffness: 100, damping: 18, mass: 0.9 },
  mono: { stiffness: 200, damping: 26, mass: 0.7 },
  prism: { stiffness: 120, damping: 12, mass: 0.85 },
};
const DEFAULT_SPRING = { stiffness: 80, damping: 20, mass: 0.8 };
const springFor = (theme?: string) => (theme && THEME_SPRINGS[theme]) || DEFAULT_SPRING;

/** The three experience buckets share one entry-card template. */
type EntrySectionKey = "activities" | "internships" | "partTimeJobs";

/** Predefined skill suggestions for the chip picker — tuned for Vietnamese fresh grads. */
const SKILL_SUGGESTIONS = [
  "React", "TypeScript", "JavaScript", "Python", "Java", "Node.js", "HTML/CSS",
  "Git", "Figma", "SQL", "MongoDB", "Docker", "AWS", "REST API",
  "Tiếng Anh", "Tiếng Nhật", "Giao tiếp", "Làm việc nhóm", "Giải quyết vấn đề",
  "Tư duy logic", "Quản lý thời gian", "Thuyết trình", "Lãnh đạo", "Sáng tạo",
  "Microsoft Office", "Excel", "PowerPoint", "Photoshop", "Illustrator",
  "Phân tích dữ liệu", "Machine Learning", "UI/UX Design", "Agile/Scrum",
];

/** Scroll-triggered fade + slide reveal for a whole section with spring physics. */
function RevealSection({ children, className, section, theme }: { children: React.ReactNode; className?: string; section?: string; theme?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      className={className}
      data-section={section}
      initial={reduced ? undefined : { opacity: 0, y: 40 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={reduced ? undefined : { type: "spring", ...springFor(theme) }}
    >
      {children}
    </motion.section>
  );
}

/** Reveals its children one after another as the section scrolls into view. */
function StaggerContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, amount: 0.08 }}
      variants={reduced ? undefined : { show: { transition: { staggerChildren: 0.06 } } }}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child (used for entry rows). */
function StaggerItem({ children, className, entryCard, theme }: { children: React.ReactNode; className?: string; entryCard?: boolean; theme?: string }) {
  const reduced = useReducedMotion();
  const spring = springFor(theme);
  return (
    <motion.div
      className={className}
      data-entry-card={entryCard ? "" : undefined}
      variants={reduced ? undefined : {
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        show: {
          opacity: 1, y: 0, scale: 1,
          transition: { type: "spring", stiffness: spring.stiffness, damping: spring.damping, mass: spring.mass },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Splits text into per-character spans for staggered letter reveal. */
function AnimatedText({ text, className, id }: { text: string; className?: string; id?: string }) {
  const reduced = useReducedMotion();
  if (reduced || !text) {
    return <span className={className} id={id}>{text}</span>;
  }
  const chars = text.split("");
  return (
    <span className={className} id={id} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: i * 0.03, type: "spring", stiffness: 120, damping: 15 }}
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

interface EditableGradCVProps {
  project: GradProject;
  /** The seeded demo project, used to recognise untouched example content. */
  samples: GradProject;
  onChange: (updater: (draft: GradProject) => GradProject) => void;
}

/**
 * EditableGradCV — the live, tap-to-type version of the Vietnamese fresh-graduate CV.
 * It mirrors GradCVDocument's `.grad-*` layout exactly, but every text field is an
 * inline editor and every photo frame is a dropzone. Motion is handled here by
 * framer-motion (not mediaMotion.js) so the editing surface stays scroll-reactive.
 */
export function EditableGradCV({ project, samples, onChange }: EditableGradCVProps) {
  const { profile, education, activities, internships, partTimeJobs, skills, hobbies, settings } = project;
  const style = themeStyle(settings);
  const budget: MediaBudget = useMemo(() => budgetFor(project), [project]);

  /* ----- field updaters ----- */
  const updateProfile = <K extends keyof GradProject["profile"]>(field: K, value: GradProject["profile"][K]) =>
    onChange((draft) => ({ ...draft, profile: { ...draft.profile, [field]: value } }));

  const updateEducation = <K extends keyof GradProject["education"]>(field: K, value: GradProject["education"][K]) =>
    onChange((draft) => ({ ...draft, education: { ...draft.education, [field]: value } }));

  const patchEntry = (section: EntrySectionKey, entryId: string, patch: Partial<EntryItem>) =>
    onChange((draft) => ({
      ...draft,
      [section]: draft[section].map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
    }) as GradProject);

  const addEntry = (section: EntrySectionKey) =>
    onChange((draft) => ({ ...draft, [section]: [...draft[section], emptyEntry()] }) as GradProject);

  const removeEntry = (section: EntrySectionKey, entryId: string) =>
    onChange((draft) => ({ ...draft, [section]: draft[section].filter((e) => e.id !== entryId) }) as GradProject);

  /* ----- certificates ----- */
  const updateCert = (certId: string, patch: Partial<Omit<GradProject["education"]["certificates"][number], "id">>) =>
    onChange((draft) => ({
      ...draft,
      education: {
        ...draft.education,
        certificates: draft.education.certificates.map((c) => (c.id === certId ? { ...c, ...patch } : c)),
      },
    }));

  const addCertificate = () =>
    onChange((draft) => ({
      ...draft,
      education: { ...draft.education, certificates: [...draft.education.certificates, emptyCertificate()] },
    }));

  const removeCertificate = (certId: string) =>
    onChange((draft) => ({
      ...draft,
      education: { ...draft.education, certificates: draft.education.certificates.filter((c) => c.id !== certId) },
    }));

  return (
    <div className="grad-document is-editing" data-editable data-media-document data-theme={settings.theme} data-motion={settings.motion} style={style}>
      {/* ---------- Hero / profile — full-viewport editorial composition ----------
          Outside .grad-container, exactly as in GradCVDocument: the hero is a
          two-column composition, and the 820px reading measure squeezed the
          name column until the name overlapped the portrait. */}
      <RevealSection className="grad-section" section="hero" theme={settings.theme}>
          <div className="grad-hero">
            {/* Ambient background layer — theme specific */}
            <div className="grad-hero-ambient" aria-hidden="true" />

            {/* Brand mark */}
            <div className="grad-hero-brand" aria-hidden="true">
              <span className="grad-hero-brand-name">CVTIFY</span>
            </div>

            {/* Main content */}
            <div className="grad-hero-content">
              <InlineText
                as="h1" className="grad-hero-name" id="profile-name"
                value={profile.name} onChange={(v) => updateProfile("name", v)}
                sample={samples.profile.name} placeholder="Họ và tên" ariaLabel="Họ và tên" maxLength={100}
              />
              <div className="grad-hero-rule" aria-hidden="true" />
              <InlineText
                as="p" className="grad-hero-objective" id="profile-objective"
                value={profile.objective} onChange={(v) => updateProfile("objective", v)}
                sample={samples.profile.objective} placeholder="Mục tiêu nghề nghiệp..." ariaLabel="Mục tiêu nghề nghiệp"
                multiline maxLength={500}
              />
              <div className="grad-hero-meta">
                <InlineText as="span" className="grad-hero-location" id="profile-address" value={profile.address} onChange={(v) => updateProfile("address", v)}
                  sample={samples.profile.address} placeholder="Địa chỉ" ariaLabel="Địa chỉ" maxLength={300} />
              </div>
              <div className="grad-hero-contact">
                <InlineText as="span" className="grad-hero-link" id="profile-email" value={profile.email} onChange={(v) => updateProfile("email", v)}
                  sample={samples.profile.email} placeholder="Email" ariaLabel="Email" maxLength={254} />
                <InlineText as="span" className="grad-hero-link" id="profile-phone" value={profile.phone} onChange={(v) => updateProfile("phone", v)}
                  sample={samples.profile.phone} placeholder="SĐT" ariaLabel="Số điện thoại" maxLength={20} />
                <InlineText as="span" className="grad-hero-link" id="profile-dob" value={profile.dob} onChange={(v) => updateProfile("dob", v)}
                  sample={samples.profile.dob} placeholder="Ngày sinh" ariaLabel="Ngày sinh" maxLength={30} />
              </div>
            </div>

            {/* Portrait — `data-hero-photo` is what mediaMotion.js drives the
                scroll parallax from, so the editor's portrait moves exactly
                like the preview's. */}
            <div className="grad-hero-photo-frame">
              <div className="grad-hero-photo-wrap">
                {profile.photo ? (
                  <img
                    className="grad-hero-photo"
                    data-hero-photo
                    src={profile.photo.src}
                    alt={profile.photo.alt || profile.name}
                    style={{ objectPosition: profile.photo.position }}
                    width={profile.photo.width}
                    height={profile.photo.height}
                    decoding="async"
                  />
                ) : (
                  <div className="grad-hero-photo grad-hero-photo--empty" data-hero-photo>
                    <span aria-hidden="true">✦</span>
                  </div>
                )}
                <CoverControls
                  photo={profile.photo}
                  budget={budget}
                  id="cover-photo"
                  onChange={(photo: MediaPhoto | null) => updateProfile("photo", photo)}
                />
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="grad-hero-scroll" aria-hidden="true">
              <span className="grad-hero-scroll-line" />
            </div>
        </div>
      </RevealSection>

      <div className="grad-container">
        {/* ---------- Education — 01 ---------- */}
        <RevealSection className="grad-section" section="education" theme={settings.theme}>
          <div className="grad-section-header">
            <span className="grad-section-number" aria-hidden="true">01</span>
            <h2 className="grad-heading" data-section-heading>Học Vấn</h2>
          </div>
          <div className="grad-education">
            <div className="grad-edu-timeline">
              <div className="grad-edu-period">
                <InlinePeriod
                  id="education-period"
                  start={education.startDate} end={education.endDate} current={false}
                  onChange={({ start, end }) =>
                    onChange((draft) => ({
                      ...draft,
                      education: {
                        ...draft.education,
                        startDate: start ?? draft.education.startDate,
                        endDate: end ?? draft.education.endDate,
                      },
                    }))
                  }
                />
              </div>
              <div className="grad-edu-content">
                <InlineText as="h3" className="grad-edu-school" id="education-school"
                  value={education.school} onChange={(v) => updateEducation("school", v)}
                  sample={samples.education.school} placeholder="Tên trường đại học" ariaLabel="Tên trường" maxLength={200} />
                <InlineText as="p" className="grad-edu-major" id="education-major"
                  value={education.major} onChange={(v) => updateEducation("major", v)}
                  sample={samples.education.major} placeholder="Chuyên ngành" ariaLabel="Chuyên ngành" maxLength={200} />
                <div className="grad-edu-meta">
                  <InlineText as="span" className="grad-edu-gpa" id="education-gpa"
                    value={education.gpa} onChange={(v) => updateEducation("gpa", v)}
                    sample={samples.education.gpa} placeholder="GPA" ariaLabel="GPA" maxLength={20} />
                  <InlineText as="span" className="grad-edu-honors" id="education-honors"
                    value={education.honors} onChange={(v) => updateEducation("honors", v)}
                    sample={samples.education.honors} placeholder="Danh hiệu, học bổng..." ariaLabel="Danh hiệu, học bổng"
                    multiline maxLength={500} />
                </div>
              </div>
            </div>

            {/* Education photo */}
            <PhotoTrack
              id="photos-education"
              photos={education.photo ? [education.photo] : []}
              onChange={(photos) => updateEducation("photo", photos[0] ?? null)}
              maxPhotos={1}
              budget={budget}
              label="Ảnh trường / lễ tốt nghiệp"
            />

            {/* Certificates */}
            <div className="grad-certificates">
              {education.certificates.map((cert) => (
                <div key={cert.id} className="grad-cert-badge" data-entry-card>
                  <InlineText as="span" className="grad-cert-name" value={cert.name} onChange={(v) => updateCert(cert.id, { name: v })}
                    placeholder="Tên chứng chỉ" ariaLabel="Tên chứng chỉ" maxLength={200} />
                  <InlineText as="span" className="grad-cert-score" value={cert.score}
                    onChange={(v) => updateCert(cert.id, { score: v })} placeholder="Điểm" ariaLabel="Điểm" maxLength={50} />
                  <InlineText as="span" className="grad-cert-issuer" value={cert.issuer}
                    onChange={(v) => updateCert(cert.id, { issuer: v })} placeholder="Đơn vị cấp" ariaLabel="Đơn vị cấp" maxLength={200} />
                  <button type="button" className="cv-list-remove" onClick={() => removeCertificate(cert.id)} aria-label="Xóa chứng chỉ">×</button>
                </div>
              ))}
              <button type="button" className="cv-add-inline" onClick={addCertificate} id="add-certificate">+ Thêm chứng chỉ</button>
            </div>
          </div>
        </RevealSection>

        {/* ---------- Experience buckets ---------- */}
        <EntrySection
          title="Hoạt Động" number="02" dataSection="activities" section="activities" entries={activities} samples={samples.activities}
          addLabel="+ Thêm hoạt động" budget={budget} theme={settings.theme}
          emptyTitle="Câu chuyện hoạt động" emptySubtitle="sẽ xuất hiện tại đây."
          onAdd={() => addEntry("activities")}
          onRemove={(id) => removeEntry("activities", id)}
          onPatch={(id, patch) => patchEntry("activities", id, patch)}
        />
        <EntrySection
          title="Thực Tập" number="03" dataSection="internships" section="internships" entries={internships} samples={samples.internships}
          addLabel="+ Thêm kỳ thực tập" budget={budget} theme={settings.theme}
          emptyTitle="Hành trình thực tập" emptySubtitle="sẽ xuất hiện tại đây."
          onAdd={() => addEntry("internships")}
          onRemove={(id) => removeEntry("internships", id)}
          onPatch={(id, patch) => patchEntry("internships", id, patch)}
        />
        <EntrySection
          title="Làm Thêm" number="04" dataSection="parttime" section="partTimeJobs" entries={partTimeJobs} samples={samples.partTimeJobs}
          addLabel="+ Thêm công việc" budget={budget} theme={settings.theme}
          emptyTitle="Kinh nghiệm làm thêm" emptySubtitle="sẽ xuất hiện tại đây."
          onAdd={() => addEntry("partTimeJobs")}
          onRemove={(id) => removeEntry("partTimeJobs", id)}
          onPatch={(id, patch) => patchEntry("partTimeJobs", id, patch)}
        />

        {/* ---------- Skills & hobbies — 05 ---------- */}
        <RevealSection className="grad-section" section="skills" theme={settings.theme}>
          <div className="grad-section-header">
            <span className="grad-section-number" aria-hidden="true">05</span>
            <h2 className="grad-heading" data-section-heading>Kỹ Năng &amp; Sở Thích</h2>
          </div>
          <div className="grad-skills-section">
            <div className="grad-skill-group">
              <h3 className="grad-skill-category">Kỹ Năng</h3>
              <InlineList
                value={skills}
                onChange={(v) => onChange((draft) => ({ ...draft, skills: v }))}
                separator=", " variant="chips"
                itemPlaceholder="Thêm kỹ năng..." addLabel="+ Thêm"
                suggestions={SKILL_SUGGESTIONS} pickerTitle="Chọn kỹ năng"
                id="skills" sample={samples.skills} ariaLabel="Kỹ năng" maxLength={1000}
              />
            </div>
            <div className="grad-skill-group">
              <h3 className="grad-skill-category">Sở Thích</h3>
              <InlineList
                value={hobbies}
                onChange={(v) => onChange((draft) => ({ ...draft, hobbies: v }))}
                separator=", " variant="chips"
                itemPlaceholder="Thêm sở thích..." addLabel="+ Thêm"
                pickerTitle="Chọn sở thích"
                id="hobbies" sample={samples.hobbies} ariaLabel="Sở thích" maxLength={500}
              />
            </div>
          </div>
        </RevealSection>

        {/* ---------- Contact / ending ---------- */}
        {(profile.email || profile.phone) && (
          <RevealSection className="grad-section grad-section--ending" section="contact" theme={settings.theme}>
            <div className="grad-ending">
              <h2 className="grad-ending-heading">KẾT NỐI</h2>
              <div className="grad-ending-links">
                {profile.email && (
                  <a className="grad-ending-link" href={`mailto:${profile.email}`}>{profile.email}</a>
                )}
                {profile.phone && (
                  <a className="grad-ending-link" href={`tel:${profile.phone}`}>{profile.phone}</a>
                )}
              </div>
              <button
                type="button"
                className="grad-ending-top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Về đầu trang"
              >
                ↑ VỀ ĐẦU TRANG
              </button>
            </div>
          </RevealSection>
        )}
      </div>
    </div>
  );
}

interface EntrySectionProps {
  title: string;
  number: string;
  dataSection: string;
  section: EntrySectionKey;
  entries: EntryItem[];
  samples: EntryItem[];
  addLabel: string;
  budget: MediaBudget;
  theme?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  onAdd: () => void;
  onRemove: (entryId: string) => void;
  onPatch: (entryId: string, patch: Partial<EntryItem>) => void;
}

/** One experience bucket (activities / internships / part-time jobs) — shared editorial row template. */
function EntrySection({ title, number, dataSection, section, entries, samples, addLabel, budget, theme, emptyTitle, emptySubtitle, onAdd, onRemove, onPatch }: EntrySectionProps) {
  return (
    <RevealSection className="grad-section" section={dataSection} theme={theme}>
      <div className="grad-section-header">
        <span className="grad-section-number" aria-hidden="true">{number}</span>
        <h2 className="grad-heading" data-section-heading>{title}</h2>
      </div>
      {entries.length === 0 ? (
        <div className="cv-empty-state">
          <p className="cv-empty-title">{emptyTitle || "Chưa có nội dung"}</p>
          <p className="cv-empty-subtitle">{emptySubtitle || "sẽ xuất hiện tại đây."}</p>
        </div>
      ) : (
      <StaggerContainer className="grad-entries">
        {entries.map((entry, idx) => (
          <StaggerItem key={entry.id} className="grad-entry-row" entryCard theme={theme}>
            <div className="grad-entry-period">
              <InlinePeriod
                id={`${entry.id}-period`}
                start={entry.startDate} end={entry.endDate} current={entry.current}
                onChange={({ start, end, current }) =>
                  onPatch(entry.id, {
                    ...(start !== undefined ? { startDate: start } : {}),
                    ...(end !== undefined ? { endDate: end } : {}),
                    ...(current !== undefined ? { current } : {}),
                  })
                }
              />
              {idx < entries.length - 1 && <span className="grad-entry-divider" aria-hidden="true" />}
            </div>
            <div className="grad-entry-content">
              <header className="grad-entry-header">
                <InlineText as="h3" className="grad-entry-title" id={`${entry.id}-title`}
                  value={entry.title} onChange={(v) => onPatch(entry.id, { title: v })}
                  sample={samples[idx]?.title} placeholder="Tên vị trí / hoạt động" ariaLabel="Tên vị trí" maxLength={200} />
                <InlineText as="span" className="grad-entry-org" id={`${entry.id}-organization`}
                  value={entry.organization} onChange={(v) => onPatch(entry.id, { organization: v })}
                  sample={samples[idx]?.organization} placeholder="Tổ chức" ariaLabel="Tổ chức" maxLength={200} />
                <button type="button" className="cv-list-remove" onClick={() => onRemove(entry.id)} aria-label="Xóa mục">×</button>
              </header>
              <InlineText as="span" className="grad-entry-location" id={`${entry.id}-location`}
                value={entry.location} onChange={(v) => onPatch(entry.id, { location: v })}
                sample={samples[idx]?.location} placeholder="Địa điểm" ariaLabel="Địa điểm" maxLength={200} />
              <InlineText as="p" className="grad-entry-description" id={`${entry.id}-description`}
                value={entry.description} onChange={(v) => onPatch(entry.id, { description: v })}
                sample={samples[idx]?.description} placeholder="Mô tả ngắn gọn..." ariaLabel="Mô tả" multiline maxLength={2000} />
              <AIAssistButton context="summary" currentValue={entry.description} role={entry.title} organization={entry.organization}
                onApply={(description) => onPatch(entry.id, { description })} />
              <InlineList
                value={entry.highlights}
                onChange={(v) => onPatch(entry.id, { highlights: v })}
                separator={"\n"} variant="bullets"
                itemPlaceholder="Thêm điểm nổi bật..." addLabel="+ Thêm"
                className="grad-entry-highlights" id={`${entry.id}-highlights`}
                sample={samples[idx]?.highlights} ariaLabel="Điểm nổi bật" maxLength={4000}
              />
              <AIAssistButton context="highlights" currentValue={entry.highlights} role={entry.title} organization={entry.organization}
                onApply={(highlights) => onPatch(entry.id, { highlights })} />
              <PhotoTrack
                id={`photos-${entry.id}`}
                photos={entry.photos}
                onChange={(photos) => onPatch(entry.id, { photos })}
                maxPhotos={4}
                budget={budget}
                label="Thêm ảnh"
              />
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      )}
      <button type="button" className="cv-add-entry" onClick={onAdd} id={`add-${section}`}>{addLabel}</button>
    </RevealSection>
  );
}

export default EditableGradCV;
