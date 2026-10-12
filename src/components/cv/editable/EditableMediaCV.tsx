import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { InlineList, InlinePeriod, InlineText } from "./inline-edit";
import { budgetFor, CoverControls, PhotoTrack, type MediaBudget } from "./inline-media";
import type { GradProject, MediaPhoto } from "@/lib/mediaProject";
import { detailSummary, emptyCertificate, themeStyle } from "@/lib/mediaProject";
import { SpotlightDeck } from "../showcase/spotlight-deck";
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


/**
 * The editor's stand-in for <details>/<summary>.
 *
 * The read-only document uses the real elements, but a <summary> activates on
 * a click anywhere inside it — including on a contentEditable field — so
 * placing a caret in the title would toggle the item shut. Same classes, same
 * layout, same collapsed-by-default behaviour; an explicit toggle button
 * instead of click-anywhere.
 *
 * `data-collapsible` / `data-collapse-toggle` are what focusField() looks for
 * when a checklist jump targets a field inside a collapsed item.
 */
function Collapsible({
  cue, open, onToggle, summary, children,
}: {
  cue: string;
  open: boolean;
  onToggle: () => void;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grad-entry" data-collapsible data-open={open ? "true" : "false"}>
      <div className="grad-entry-summary">
        {summary}
        <button
          type="button"
          className="grad-entry-toggle"
          data-collapse-toggle
          aria-expanded={open}
          onClick={onToggle}
        >
          <span className="grad-entry-cue">
            <span className="grad-entry-cue-text">{cue || "Chi tiết"}</span>
            <ChevronRight className="grad-entry-cue-chevron" size={13} aria-hidden="true" />
          </span>
        </button>
      </div>
      <div className="grad-entry-detail" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

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
  /** Force every item open — the toolbar's "expand all", shared with preview. */
  expanded?: boolean;
  /** An entry the toolbar just added: the deck scrolls to it and focuses it. */
  focusEntryId?: string;
  onFocusHandled?: () => void;
}

/**
 * EditableGradCV — the live, tap-to-type version of the Vietnamese fresh-graduate CV.
 * It mirrors GradCVDocument's `.grad-*` layout exactly, but every text field is an
 * inline editor and every photo frame is a dropzone. Motion is handled here by
 * framer-motion (not mediaMotion.js) so the editing surface stays scroll-reactive.
 */
export function EditableGradCV({ project, samples, onChange, expanded = false, focusEntryId, onFocusHandled }: EditableGradCVProps) {
  const { profile, education, activities, internships, partTimeJobs, skills, hobbies, settings } = project;
  const style = themeStyle(settings);
  const budget: MediaBudget = useMemo(() => budgetFor(project), [project]);
  const [eduOpen, setEduOpen] = useState(false);
  const eduCue = detailSummary([
    education.gpa && "GPA",
    education.honors && "danh hiệu",
    education.certificates.length ? `${education.certificates.length} chứng chỉ` : "",
    education.photo && "ảnh",
  ]);

  /* ----- field updaters ----- */
  const updateProfile = <K extends keyof GradProject["profile"]>(field: K, value: GradProject["profile"][K]) =>
    onChange((draft) => ({ ...draft, profile: { ...draft.profile, [field]: value } }));

  const updateEducation = <K extends keyof GradProject["education"]>(field: K, value: GradProject["education"][K]) =>
    onChange((draft) => ({ ...draft, education: { ...draft.education, [field]: value } }));

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
            {/* Overview: period, school, major. Everything else is detail. */}
            <Collapsible
              cue={eduCue}
              open={expanded || eduOpen}
              onToggle={() => setEduOpen((v) => !v)}
              summary={
                <>
                  <div className="grad-entry-period">
                    <InlinePeriod
                      id="education-period"
                      start={education.startDate} end={education.endDate} current={false} allowCurrent={false}
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
                  <div className="grad-entry-body">
                    <div className="grad-entry-headline">
                      <InlineText as="h3" className="grad-edu-school" id="education-school"
                        value={education.school} onChange={(v) => updateEducation("school", v)}
                        sample={samples.education.school} placeholder="Tên trường đại học" ariaLabel="Tên trường" maxLength={200} />
                    </div>
                    <InlineText as="span" className="grad-edu-major" id="education-major"
                      value={education.major} onChange={(v) => updateEducation("major", v)}
                      sample={samples.education.major} placeholder="Chuyên ngành" ariaLabel="Chuyên ngành" maxLength={200} />
                  </div>
                </>
              }
            >
              <div className="grad-edu-meta">
                <InlineText as="span" className="grad-edu-gpa" id="education-gpa"
                  value={education.gpa} onChange={(v) => updateEducation("gpa", v)}
                  sample={samples.education.gpa} placeholder="GPA" ariaLabel="GPA" maxLength={20} />
                <InlineText as="span" className="grad-edu-honors" id="education-honors"
                  value={education.honors} onChange={(v) => updateEducation("honors", v)}
                  sample={samples.education.honors} placeholder="Danh hiệu, học bổng..." ariaLabel="Danh hiệu, học bổng"
                  multiline maxLength={500} />
              </div>

              {/* Certificates */}
              <div className="grad-certificates">
                {education.certificates.map((cert) => (
                  <div key={cert.id} className="grad-cert-badge">
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

              {/* Education photo */}
              <PhotoTrack
                id="photos-education"
                photos={education.photo ? [education.photo] : []}
                onChange={(photos) => updateEducation("photo", photos[0] ?? null)}
                maxPhotos={1}
                budget={budget}
                label="Ảnh trường / lễ tốt nghiệp"
              />
            </Collapsible>
          </div>
        </RevealSection>

        {/* ---------- Experience — one spotlight conveyor ---------- */}
        <SpotlightDeck
          project={project}
          samples={samples}
          onChange={onChange}
          editable
          number="02"
          title="Hành Trình"
          focusEntryId={focusEntryId}
          onFocusHandled={onFocusHandled}
        />

        {/* ---------- Skills & hobbies — 05 ---------- */}
        <RevealSection className="grad-section" section="skills" theme={settings.theme}>
          <div className="grad-section-header">
            <span className="grad-section-number" aria-hidden="true">03</span>
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

export default EditableGradCV;
