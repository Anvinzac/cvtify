import type { GradProject, EntryItem } from "@/lib/mediaProject";
import { themeStyle, splitItems, lines, monthLabel } from "@/lib/mediaProject";
import "./media-document.css";

/**
 * GradCVDocument — the read-only, script-independent markup for the Vietnamese
 * fresh-graduate CV. It renders STATIC HTML only (no framer-motion); every
 * scroll animation is layered on afterwards by mediaMotion.js, which flips
 * `data-visible="true"` on the elements it observes.
 *
 * The root carries `data-media-document` (how the host finds it to attach
 * motion) and `data-motion` (the motion level the script should apply).
 */
export function GradCVDocument({ project }: { project: GradProject }) {
  const { profile, education, activities, internships, partTimeJobs, skills, hobbies, settings } = project;
  const style = themeStyle(settings);

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
            <div className="grad-edu-timeline">
              <div className="grad-edu-period">
                {(education.startDate || education.endDate) && (
                  <span>
                    {monthLabel(education.startDate)} — {monthLabel(education.endDate)}
                  </span>
                )}
              </div>
              <div className="grad-edu-content">
                <h3 className="grad-edu-school">{education.school}</h3>
                <p className="grad-edu-major">{education.major}</p>
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
              </div>
            </div>

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

            {education.certificates.length > 0 && (
              <div className="grad-certificates">
                {education.certificates.map((cert) => (
                  <div className="grad-cert-badge" key={cert.id} data-entry-card>
                    <span className="grad-cert-name">{cert.name}</span>
                    {cert.score && <span className="grad-cert-score">{cert.score}</span>}
                    {cert.issuer && <span className="grad-cert-issuer">{cert.issuer}</span>}
                  </div>
                ))}
              </div>
            )}
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
                <EntryRow key={entry.id} entry={entry} isLast={i === activities.length - 1} />
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
                <EntryRow key={entry.id} entry={entry} isLast={i === internships.length - 1} />
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
                <EntryRow key={entry.id} entry={entry} isLast={i === partTimeJobs.length - 1} />
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

/** Editorial experience row shared by activities, internships and part-time jobs. */
function EntryRow({ entry, isLast }: { entry: EntryItem; isLast: boolean }) {
  const highlights = lines(entry.highlights).filter(Boolean);
  const hasPeriod = entry.startDate || entry.endDate || entry.current;
  return (
    <article className="grad-entry-row" data-entry-card>
      <div className="grad-entry-period">
        {hasPeriod && (
          <span className="grad-entry-period-text">
            {monthLabel(entry.startDate)} — {entry.current ? "Nay" : monthLabel(entry.endDate)}
          </span>
        )}
        {!isLast && <span className="grad-entry-divider" aria-hidden="true" />}
      </div>
      <div className="grad-entry-content">
        <header className="grad-entry-header">
          <h3 className="grad-entry-title">{entry.title}</h3>
          <span className="grad-entry-org">{entry.organization}</span>
        </header>
        {entry.location && <span className="grad-entry-location">{entry.location}</span>}
        {entry.description && <p className="grad-entry-description">{entry.description}</p>}
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
    </article>
  );
}

export default GradCVDocument;
