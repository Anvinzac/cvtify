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

  const contact = [
    profile.email,
    profile.phone,
    profile.dob,
    profile.address,
  ].filter((value) => value && value.trim());

  return (
    <div
      className="grad-document"
      data-media-document
      data-motion={settings.motion}
      style={style}
    >
      <div className="grad-container">
        {/* Hero / Profile */}
        <section className="grad-section" data-section="hero">
          <div className="grad-hero">
            {profile.photo && (
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
            )}
            <div className="grad-hero-info">
              <h1 className="grad-hero-name" data-hero-name>{profile.name}</h1>
              {profile.objective && <p className="grad-hero-objective">{profile.objective}</p>}
              {contact.length > 0 && (
                <div className="grad-hero-contact">
                  {contact.map((value, i) => (
                    <span key={i}>{value}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="grad-section" data-section="education">
          <h2 className="grad-heading" data-section-heading>Học Vấn</h2>
          <div className="grad-education">
            <div className="grad-edu-header">
              <div>
                <div className="grad-edu-school">{education.school}</div>
                <div className="grad-edu-major">{education.major}</div>
              </div>
            </div>
            <div className="grad-edu-meta">
              {(education.startDate || education.endDate) && (
                <span>
                  {monthLabel(education.startDate)} — {monthLabel(education.endDate)}
                </span>
              )}
              {education.gpa && <span className="grad-edu-gpa">GPA: {education.gpa}</span>}
            </div>
            {education.honors && <p className="grad-edu-honors">{education.honors}</p>}

            {education.certificates.length > 0 && (
              <div className="grad-certificates">
                {education.certificates.map((cert) => (
                  <span key={cert.id} className="grad-cert-badge">
                    {cert.name}
                    {cert.score && <span className="grad-cert-score">{cert.score}</span>}
                    {cert.issuer && <span className="grad-cert-issuer">— {cert.issuer}</span>}
                  </span>
                ))}
              </div>
            )}

            {education.photo && (
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
            )}
          </div>
        </section>

        {/* Activities */}
        {activities.length > 0 && (
          <section className="grad-section" data-section="activities">
            <h2 className="grad-heading" data-section-heading>Hoạt Động</h2>
            <div className="grad-entries">
              {activities.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Internships */}
        {internships.length > 0 && (
          <section className="grad-section" data-section="internships">
            <h2 className="grad-heading" data-section-heading>Thực Tập</h2>
            <div className="grad-entries">
              {internships.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Part-time Jobs */}
        {partTimeJobs.length > 0 && (
          <section className="grad-section" data-section="parttime">
            <h2 className="grad-heading" data-section-heading>Làm Thêm</h2>
            <div className="grad-entries">
              {partTimeJobs.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Skills & Hobbies */}
        {(splitItems(skills).length > 0 || splitItems(hobbies).length > 0) && (
          <section className="grad-section" data-section="skills">
            <h2 className="grad-heading" data-section-heading>Kỹ Năng &amp; Sở Thích</h2>
            <div className="grad-skills-section">
              {splitItems(skills).length > 0 && (
                <div className="grad-chip-group">
                  <h4>Kỹ năng</h4>
                  <div className="grad-chips">
                    {splitItems(skills).map((skill, i) => (
                      <span key={i} className="grad-chip grad-chip--skill">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {splitItems(hobbies).length > 0 && (
                <div className="grad-chip-group">
                  <h4>Sở thích</h4>
                  <div className="grad-chips">
                    {splitItems(hobbies).map((hobby, i) => (
                      <span key={i} className="grad-chip grad-chip--hobby">{hobby}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/** Compact experience card shared by activities, internships and part-time jobs. */
function EntryCard({ entry }: { entry: EntryItem }) {
  const highlights = lines(entry.highlights).filter(Boolean);
  return (
    <div className="grad-entry-card" data-entry-card>
      <div className="grad-entry-header">
        <div>
          <div className="grad-entry-title">{entry.title}</div>
          <div className="grad-entry-org">{entry.organization}</div>
        </div>
        {(entry.startDate || entry.endDate || entry.current) && (
          <span className="grad-entry-period">
            {monthLabel(entry.startDate)} — {entry.current ? "Nay" : monthLabel(entry.endDate)}
          </span>
        )}
      </div>
      {entry.location && <div className="grad-entry-location">{entry.location}</div>}
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
  );
}

export default GradCVDocument;
