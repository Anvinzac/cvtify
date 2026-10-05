import type { GradProject, EntryItem } from "@/lib/mediaProject";
import { themeStyle, splitItems, lines, monthLabel, detailSummary } from "@/lib/mediaProject";
import { DetailCue } from "./detail-cue";
import "./media-document.css";

/**
 * GradCVDocument — the read-only, script-independent markup for the Vietnamese
 * fresh-graduate CV. It renders STATIC HTML only (no framer-motion); every
 * scroll animation is layered on afterwards by mediaMotion.js, which flips
 * `data-visible="true"` on the elements it observes.
 *
 * READING MODEL — two tiers:
 *   Overview (always in the scroll): every heading, and for each item its
 *     period, title, organisation and ONE short description. A recruiter can
 *     scan the whole CV in one pass without opening anything.
 *   Detail (behind a tap): location, highlights, photos; for education the
 *     GPA, honours and certificates. Native <details>/<summary>, so it needs
 *     no JavaScript, is keyboard operable, and survives the HTML export.
 *
 * The root carries `data-media-document` (how the host finds it to attach
 * motion) and `data-motion` (the motion level the script should apply).
 *
 * `expanded` force-opens every disclosure — the in-app "expand all" control
 * and printing both use it.
 */
export function GradCVDocument({ project, expanded = false }: { project: GradProject; expanded?: boolean }) {
  const { profile, education, activities, internships, partTimeJobs, skills, hobbies, settings } = project;
  const style = themeStyle(settings);
  const eduDetail = detailSummary([
    education.gpa && "GPA",
    education.honors && "danh hiệu",
    education.certificates.length ? `${education.certificates.length} chứng chỉ` : "",
    education.photo && "ảnh",
  ]);

  return (
    <div
      className="grad-document"
      data-media-document
      data-theme={settings.theme}
      data-motion={settings.motion}
      style={style}
    >
      {/* Hero / Profile — full-viewport editorial composition.
          Deliberately OUTSIDE .grad-container: the hero is a two-column
          composition and the 820px reading measure left the name column too
          narrow for it, so the name ran over the portrait. */}
      <section className="grad-section" data-section="hero">
          <div className="grad-hero">
            {/* Ambient background layer — theme specific */}
            <div className="grad-hero-ambient" aria-hidden="true" />

            {/* Brand mark */}
            <div className="grad-hero-brand" aria-hidden="true">
              <span className="grad-hero-brand-name">CVTIFY</span>
            </div>

            {/* Main content */}
            <div className="grad-hero-content">
              <h1 className="grad-hero-name" data-hero-name>
                {profile.name || "Your Name"}
              </h1>
              <div className="grad-hero-rule" aria-hidden="true" />
              {profile.objective && (
                <p className="grad-hero-objective">{profile.objective}</p>
              )}
              <div className="grad-hero-meta">
                {profile.address && <span className="grad-hero-location">{profile.address}</span>}
              </div>
              <div className="grad-hero-contact">
                {profile.email && (
                  <a className="grad-hero-link" href={`mailto:${profile.email}`}>
                    <span className="grad-hero-link-text">{profile.email}</span>
                  </a>
                )}
                {profile.phone && (
                  <a className="grad-hero-link" href={`tel:${profile.phone}`}>
                    <span className="grad-hero-link-text">{profile.phone}</span>
                  </a>
                )}
                {profile.dob && (
                  <span className="grad-hero-link">
                    <span className="grad-hero-link-text">{profile.dob}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Portrait */}
            <div className="grad-hero-photo-frame">
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
            </div>

            {/* Scroll indicator */}
            <div className="grad-hero-scroll" aria-hidden="true">
              <span className="grad-hero-scroll-line" />
            </div>
        </div>
      </section>

      <div className="grad-container">
        {/* Education — 01 */}
        <section className="grad-section" data-section="education">
          <div className="grad-section-header">
            <span className="grad-section-number" aria-hidden="true">01</span>
            <h2 className="grad-heading" data-section-heading>Học Vấn</h2>
          </div>
          <div className="grad-education">
            <details className="grad-entry" data-entry-card open={expanded || undefined}>
              <summary className="grad-entry-summary">
                <span className="grad-entry-period">
                  {(education.startDate || education.endDate) && (
                    <span className="grad-entry-period-text">
                      {monthLabel(education.startDate)} — {monthLabel(education.endDate)}
                    </span>
                  )}
                </span>
                <span className="grad-entry-body">
                  <span className="grad-entry-headline">
                    <h3 className="grad-edu-school">{education.school}</h3>
                  </span>
                  <span className="grad-edu-major">{education.major}</span>
                  {eduDetail && <DetailCue label={eduDetail} />}
                </span>
              </summary>

              <div className="grad-entry-detail">
                <div className="grad-edu-meta">
                  {education.gpa && (
                    <span className="grad-edu-gpa" data-gpa={education.gpa}>
                      GPA: {education.gpa}
                    </span>
                  )}
                  {education.honors && (
                    <span className="grad-edu-honors">{education.honors}</span>
                  )}
                </div>

                {education.certificates.length > 0 && (
                  <div className="grad-certificates">
                    {education.certificates.map((cert) => (
                      <div className="grad-cert-badge" key={cert.id}>
                        <span className="grad-cert-name">{cert.name}</span>
                        {cert.score && <span className="grad-cert-score">{cert.score}</span>}
                        {cert.issuer && <span className="grad-cert-issuer">{cert.issuer}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {education.photo && (
                  <div className="grad-edu-photo-frame">
                    <img
                      className="grad-edu-photo"
                      src={education.photo.src}
                      alt={education.photo.alt || "Ảnh trường"}
                      style={{ objectPosition: education.photo.position }}
                      width={education.photo.width}
                      height={education.photo.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
              </div>
            </details>
          </div>
        </section>

        {/* Activities — 02 */}
        {activities.length > 0 && (
          <section className="grad-section" data-section="activities">
            <div className="grad-section-header">
              <span className="grad-section-number" aria-hidden="true">02</span>
              <h2 className="grad-heading" data-section-heading>Hoạt Động</h2>
            </div>
            <div className="grad-entries">
              {activities.map((entry, i) => (
                <EntryRow key={entry.id} entry={entry} isLast={i === activities.length - 1} expanded={expanded} />
              ))}
            </div>
          </section>
        )}

        {/* Internships — 03 */}
        {internships.length > 0 && (
          <section className="grad-section" data-section="internships">
            <div className="grad-section-header">
              <span className="grad-section-number" aria-hidden="true">03</span>
              <h2 className="grad-heading" data-section-heading>Thực Tập</h2>
            </div>
            <div className="grad-entries">
              {internships.map((entry, i) => (
                <EntryRow key={entry.id} entry={entry} isLast={i === internships.length - 1} expanded={expanded} />
              ))}
            </div>
          </section>
        )}

        {/* Part-time Jobs — 04 */}
        {partTimeJobs.length > 0 && (
          <section className="grad-section" data-section="parttime">
            <div className="grad-section-header">
              <span className="grad-section-number" aria-hidden="true">04</span>
              <h2 className="grad-heading" data-section-heading>Làm Thêm</h2>
            </div>
            <div className="grad-entries">
              {partTimeJobs.map((entry, i) => (
                <EntryRow key={entry.id} entry={entry} isLast={i === partTimeJobs.length - 1} expanded={expanded} />
              ))}
            </div>
          </section>
        )}

        {/* Skills & Hobbies — 05 */}
        {(splitItems(skills).length > 0 || splitItems(hobbies).length > 0) && (
          <section className="grad-section" data-section="skills">
            <div className="grad-section-header">
              <span className="grad-section-number" aria-hidden="true">05</span>
              <h2 className="grad-heading" data-section-heading>Kỹ Năng &amp; Sở Thích</h2>
            </div>
            <div className="grad-skills-section">
              {splitItems(skills).length > 0 && (
                <div className="grad-skill-group">
                  <h3 className="grad-skill-category">Kỹ Năng</h3>
                  <div className="grad-chips">
                    {splitItems(skills).map((skill, i) => (
                      <span className="grad-chip grad-chip--skill" key={skill} data-chip-index={i}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {splitItems(hobbies).length > 0 && (
                <div className="grad-skill-group">
                  <h3 className="grad-skill-category">Sở Thích</h3>
                  <div className="grad-chips">
                    {splitItems(hobbies).map((hobby, i) => (
                      <span className="grad-chip grad-chip--hobby" key={hobby} data-chip-index={i}>
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Contact / Ending */}
        {(profile.email || profile.phone) && (
          <section className="grad-section grad-section--ending" data-section="contact">
            <div className="grad-ending">
              <h2 className="grad-ending-heading">KẾT NỐI</h2>
              <div className="grad-ending-links">
                {profile.email && (
                  <a className="grad-ending-link" href={`mailto:${profile.email}`}>
                    {profile.email}
                  </a>
                )}
                {profile.phone && (
                  <a className="grad-ending-link" href={`tel:${profile.phone}`}>
                    {profile.phone}
                  </a>
                )}
              </div>
              <a className="grad-ending-top" href="#" aria-label="Về đầu trang">
                ↑ VỀ ĐẦU TRANG
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * One experience item, shared by activities, internships and part-time jobs.
 *
 * The summary is the overview tier: period, title, organisation and the short
 * description (clamped to two lines while collapsed — CSS releases the clamp
 * when it opens, so the text lives in exactly one place). Location, highlights
 * and photos are the detail tier.
 */
function EntryRow({ entry, isLast, expanded }: { entry: EntryItem; isLast: boolean; expanded?: boolean }) {
  const highlights = lines(entry.highlights).filter(Boolean);
  const hasPeriod = entry.startDate || entry.endDate || entry.current;
  const lead = entry.description.trim() || highlights[0] || "";
  const cue = detailSummary([
    highlights.length ? `${highlights.length} điểm nổi bật` : "",
    entry.photos.length ? `${entry.photos.length} ảnh` : "",
    entry.location && "địa điểm",
  ]);
  return (
    <details className="grad-entry" data-entry-card open={expanded || undefined}>
      <summary className="grad-entry-summary">
        <span className="grad-entry-period">
          {hasPeriod && (
            <span className="grad-entry-period-text">
              {monthLabel(entry.startDate)} — {entry.current ? "Nay" : monthLabel(entry.endDate)}
            </span>
          )}
          {!isLast && <span className="grad-entry-divider" aria-hidden="true" />}
        </span>
        <span className="grad-entry-body">
          <span className="grad-entry-headline">
            <h3 className="grad-entry-title">{entry.title}</h3>
            <span className="grad-entry-org">{entry.organization}</span>
          </span>
          {lead && <span className="grad-entry-lead">{lead}</span>}
          {cue && <DetailCue label={cue} />}
        </span>
      </summary>

      <div className="grad-entry-detail">
        {entry.location && <span className="grad-entry-location">{entry.location}</span>}
        {highlights.length > 0 && (
          <ul className="grad-entry-highlights">
            {highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
        {entry.photos.length > 0 && (
          <div className="grad-entry-photos">
            {entry.photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.src}
                alt={photo.alt || photo.caption || ""}
                style={{ objectPosition: photo.position }}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

export default GradCVDocument;
