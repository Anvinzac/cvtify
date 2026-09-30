import { memo, useMemo } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  emptyExperience, MAX_EXPERIENCES, MAX_PHOTOS, newId, themeStyle, toMediaCV,
  type MediaExperience, type MediaProject,
} from "@/lib/mediaProject";
import { InlineList, InlinePeriod, InlineText } from "./inline-edit";
import { budgetFor, CoverControls, PhotoTrack, type MediaBudget } from "./inline-media";
import type { Photo } from "@/lib/cvData";

const pad = (n: number) => String(n).padStart(2, "0");

interface EditableProps {
  project: MediaProject;
  update: (fn: (draft: MediaProject) => MediaProject) => void;
  onBusy?: (busy: boolean) => void;
  disabled?: boolean;
}

/**
 * The live, tap-to-type CV. It renders the same semantic layout and theme as the
 * shipping document, but every field is editable in place and every media frame is
 * a dropzone. Motion is intentionally off here so editing stays stable; the parent
 * page switches to the read-only MediaCVDocument + parallax for the "Preview" lens.
 */
export function EditableMediaCV({ project, update, onBusy, disabled }: EditableProps) {
  const cv = useMemo(() => toMediaCV(project), [project]);
  const settings = project.settings;
  const p = project.profile;
  const skills = cv.skillGroups.flatMap((group) => group.items);
  const learnings = cv.experience.filter((stage) => stage.learning);
  const showSkills = settings.showSkills && skills.length > 0;
  const showStory = settings.showStory;
  const showGallery = settings.showGallery && cv.gallery.length > 0;
  const budget: MediaBudget = useMemo(() => budgetFor(project), [project]);

  const setProfile = (key: keyof MediaProject["profile"]) => (value: string) =>
    update((d) => ({ ...d, profile: { ...d.profile, [key]: value } }));
  const links = [
    { id: "overview", label: "At a glance" },
    { id: "experience", label: "Experience" },
    ...(showSkills ? [{ id: "skills", label: "Skills" }] : []),
    ...(showStory ? [{ id: "story", label: "Story" }] : []),
    ...(showGallery ? [{ id: "gallery", label: "Photos" }] : []),
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className={`media-cv media-document is-editing type-${settings.typography} pace-${settings.pace}`} style={themeStyle(settings)} data-media-document data-motion="still">
      <header className="media-navigation">
        <nav className="media-container" aria-label="CV sections">
          <a href="#top" className="media-identity" aria-label={`${p.name || "Your name"} — back to top`}>
            <span>{(p.name.trim() || "Y N").split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase()}</span>
            <b>{p.name || "Your name"}</b>
          </a>
          <ul>{links.map((link) => <li key={link.id}><a href={`#${link.id}`}>{link.label}</a></li>)}</ul>
        </nav>
      </header>
      <main>
        {/* ---------- Hero ---------- */}
        <section id="top" className="media-hero" aria-labelledby="media-name">
          <div className="media-hero-photo">
            {p.cover?.src
              ? <img src={p.cover.src} alt={p.cover.alt} width={p.cover.width} height={p.cover.height} style={{ objectPosition: p.cover.position }} decoding="async" />
              : <div className="cv-cover-empty">Your cover photo fills this space</div>}
          </div>
          <div className="media-hero-shade" aria-hidden="true" />
          <div className="media-container media-hero-content">
            <p className="media-eyebrow">The person behind the work</p>
            <InlineText as="p" className="media-availability" value={p.availability} maxLength={160} disabled={disabled}
              placeholder="What are you looking for? e.g. Open to senior roles" ariaLabel="Availability" onChange={setProfile("availability")} />
            <InlineText as="h1" id="media-name" value={p.name} maxLength={100} disabled={disabled} placeholder="Your name" ariaLabel="Your name" onChange={setProfile("name")} />
            <InlineText as="p" className="media-headline" id="profile-headline" value={p.headline} maxLength={160} disabled={disabled}
              placeholder="Your role — e.g. Product Designer & Researcher" ariaLabel="Professional headline" onChange={setProfile("headline")} />
            <InlineText as="p" className="media-tagline" multiline value={p.tagline} maxLength={360} disabled={disabled}
              placeholder="One line about what you bring to a team." ariaLabel="Introduction line" onChange={setProfile("tagline")} />
            <InlineText as="p" className="media-location" value={p.location} maxLength={140} disabled={disabled} placeholder="Where you're based · Remote" ariaLabel="Location" onChange={setProfile("location")} />
            <div className="media-tags" aria-label="Signature skills">{skills.slice(0, 6).map((skill) => <span key={skill.name}>{skill.name}</span>)}</div>
            <div className="media-hero-actions"><a className="media-button" href="#overview">My experience at a glance ↓</a><a className="media-button secondary" href="#contact">Get in touch ↗</a></div>
            <dl className="media-stats">{cv.stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
            <CoverControls photo={p.cover} budget={budget} disabled={disabled} onBusy={onBusy} onChange={(cover) => update((d) => ({ ...d, profile: { ...d.profile, cover } }))} />
          </div>
        </section>

        {/* ---------- Overview (derived) ---------- */}
        <section id="overview" className="media-section media-container" aria-labelledby="overview-title">
          <div className="media-section-heading"><p className="media-eyebrow">The short version</p><h2 id="overview-title">Experience, <em>at a glance.</em></h2><p>This summary builds itself from your chapters below. Edit a chapter and it updates here instantly.</p></div>
          <ol className="media-overview-list">{cv.experience.map((stage, index) => <li key={stage.id}>
            <span className="media-index">{pad(index + 1)}</span>
            <div><p className="media-date">{stage.period}</p><h3><a href={`#chapter-${stage.id}`}>{stage.role || "Untitled role"} <span aria-hidden="true">↗</span></a></h3>
              <p className="media-org">{stage.org || "Organization not set"}{stage.location && ` · ${stage.location}`}</p>
              <p className="media-excerpt">{stage.summary}</p>
              {stage.highlights[0] && <p className="media-result">{stage.highlights[0]}</p>}
              <div className="media-tags">{stage.skills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}</div>
            </div>
            <a className="media-overview-photo" href={`#chapter-${stage.id}`} tabIndex={-1} aria-hidden="true">{stage.photos[0] && <img src={stage.photos[0].src} alt="" loading="lazy" decoding="async" style={{ objectPosition: stage.photos[0].position }} />}</a>
          </li>)}</ol>
          {!project.experiences.length && <button type="button" className="cv-add-block" onClick={() => update((d) => ({ ...d, experiences: [emptyExperience()] }))}><Plus size={16} /> Add your first chapter</button>}
        </section>

        {/* ---------- Intro / manifesto ---------- */}
        <section id="intro" className="media-intro media-section"><div className="media-container">
          <p className="media-eyebrow">A little context</p>
          <h2>The story behind my work.</h2>
          <InlineText as="p" className="media-prose" multiline value={p.about} maxLength={2200} disabled={disabled}
            placeholder="What brought you here, what matters to you, and where you're going. This is your opening narrative." ariaLabel="About you" onChange={setProfile("about")} />
          <div className="cv-signature">
            <p className="media-eyebrow">Signature skills</p>
            <InlineList variant="chips" separator=", " id="profile-skills" value={p.skills} maxLength={1000} disabled={disabled}
              itemPlaceholder="Add a skill" addLabel="Add skill" ariaLabel="Signature skills" onChange={setProfile("skills")} />
          </div>
        </div></section>

        {/* ---------- Experience chapters ---------- */}
        <section id="experience" aria-labelledby="experience-title">
          <div className="media-container media-section-heading media-experience-heading"><p className="media-eyebrow">The chapters</p><h2 id="experience-title">Work. Growth. <em>Perspective.</em></h2><p>Each chapter is a role, project, or period. Tap any line to rewrite it; drop photos into the frame.</p></div>
          {project.experiences.map((e, index) => (
            <EditableChapter key={e.id} e={e} index={index} total={project.experiences.length} remaining={budget.remaining}
              remainingBytes={budget.remainingBytes} update={update} onBusy={onBusy} disabled={disabled} />
          ))}
          <div className="media-container">
            <button type="button" id="add-experience" className="cv-add-block" disabled={project.experiences.length >= MAX_EXPERIENCES}
              onClick={() => update((d) => ({ ...d, experiences: [...d.experiences, emptyExperience()] }))}>
              <Plus size={17} /> Add another chapter
            </button>
            <p className="cv-hint">{project.experiences.length} / {MAX_EXPERIENCES} chapters · reorder with the arrows on each chapter.</p>
          </div>
        </section>

        {/* ---------- Skills (derived) ---------- */}
        {showSkills && <section id="skills" className="media-section media-container" aria-labelledby="skills-title">
          <div className="media-section-heading"><p className="media-eyebrow">Capabilities</p><h2 id="skills-title">What I <em>bring.</em></h2><p>Collected automatically from your signature skills and the skills on each chapter — no invented levels.</p></div>
          <div className="media-skill-grid">{skills.map((skill) => {
            const evidence = cv.experience.filter((stage) => stage.skills.some((s) => s.toLocaleLowerCase() === skill.name.toLocaleLowerCase()));
            return <article className="media-skill-card" key={skill.name}><h3>{skill.name}</h3>{evidence.length ? <ul>{evidence.map((stage) => <li key={stage.id}><a href={`#chapter-${stage.id}`}>{stage.role} · {stage.org} ↗</a></li>)}</ul> : <p>Signature skill</p>}</article>;
          })}</div>
        </section>}

        {/* ---------- Story / values ---------- */}
        {showStory && <section id="story" className="media-section media-story" aria-labelledby="story-title"><div className="media-container">
          <div className="media-section-heading"><p className="media-eyebrow">Self-discovery</p><h2 id="story-title">The person <em>I’m becoming.</em></h2></div>
          <div className="media-value-grid">
            {project.values.map((v, i) => <article className="cv-value" key={v.id}>
              <div className="cv-value-tools cv-block-tools">
                <button type="button" className="cv-tool-button danger" disabled={disabled} aria-label="Remove value"
                  onClick={() => update((d) => ({ ...d, values: d.values.filter((x) => x.id !== v.id) }))}><Trash2 size={14} /></button>
              </div>
              <p className="media-index">{pad(i + 1)}</p>
              <InlineText as="h3" id={`value-${v.id}`} value={v.title} maxLength={100} disabled={disabled} placeholder="A value that guides you" ariaLabel="Value title"
                onChange={(title) => update((d) => ({ ...d, values: d.values.map((x) => x.id === v.id ? { ...x, title } : x) }))} />
              <InlineText as="p" className="media-prose" multiline value={v.text} maxLength={800} disabled={disabled} placeholder="What this looks like in your work" ariaLabel="Value description"
                onChange={(text) => update((d) => ({ ...d, values: d.values.map((x) => x.id === v.id ? { ...x, text } : x) }))} />
            </article>)}
          </div>
          {project.values.length < 6 && <button type="button" className="cv-add-block" disabled={disabled}
            onClick={() => update((d) => ({ ...d, values: [...d.values, { id: newId(), title: "", text: "" }] }))}><Plus size={16} /> Add a value</button>}
          {!!learnings.length && <div className="media-learning-list">{learnings.map((stage) => <article key={stage.id}><a className="media-eyebrow" href={`#chapter-${stage.id}`}>{stage.role} · {stage.org} ↗</a><h3>What I discovered</h3><p className="media-prose">{stage.learning}</p></article>)}</div>}
        </div></section>}

        {/* ---------- Gallery (derived) ---------- */}
        {showGallery && <section id="gallery" className="media-section media-container" aria-labelledby="gallery-title">
          <div className="media-section-heading"><p className="media-eyebrow">In frames</p><h2 id="gallery-title">Moments <em>along the way.</em></h2><p>Every photo you add to a chapter gathers here automatically.</p></div>
          <div className="media-gallery">{cv.experience.flatMap((stage) => stage.photos.map((photo, i) => <GalleryFigure key={`${stage.id}-${photo.id ?? i}`} photo={photo} context={`${stage.role} · ${stage.org}`} />))}</div>
        </section>}

        {/* ---------- Contact ---------- */}
        <section id="contact" className="media-section media-contact" aria-labelledby="contact-title"><div className="media-container">
          <p className="media-eyebrow">The next chapter</p><h2 id="contact-title">Let’s <em>connect.</em></h2>
          <InlineText as="span" className="media-email" id="profile-email" value={p.email} maxLength={254} disabled={disabled} placeholder="you@example.com" ariaLabel="Contact email" onChange={setProfile("email")} />
          <div className="cv-contact-fields">
            <label className="cv-contact-field"><span>Website / portfolio</span>
              <InlineText as="span" id="profile-website" value={p.website} maxLength={500} disabled={disabled} placeholder="https://your-portfolio.com" ariaLabel="Website" onChange={setProfile("website")} /></label>
            <label className="cv-contact-field"><span>LinkedIn</span>
              <InlineText as="span" id="profile-linkedin" value={p.linkedin} maxLength={500} disabled={disabled} placeholder="https://linkedin.com/in/you" ariaLabel="LinkedIn" onChange={setProfile("linkedin")} /></label>
          </div>
          <footer><span>{p.name || "Your name"}{p.location && ` · ${p.location}`}</span><a href="#top">Back to top ↑</a></footer>
        </div></section>
      </main>
    </div>
  );
}

function GalleryFigure({ photo, context }: { photo: Photo; context?: string }) {
  return <figure className="media-photo-figure"><div className="media-image-frame"><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" style={{ objectPosition: photo.position }} /></div>{(photo.caption || context) && <figcaption>{photo.caption && <span>{photo.caption}</span>}{context && <small>{context}</small>}</figcaption>}</figure>;
}

interface ChapterProps extends Omit<EditableProps, "project"> { e: MediaExperience; index: number; total: number; remaining: number; remainingBytes: number; }

const EditableChapter = memo(function EditableChapter({ e, index, total, remaining, remainingBytes, update, onBusy, disabled }: ChapterProps) {
  const patch = (fields: Partial<MediaExperience>) => update((d) => ({ ...d, experiences: d.experiences.map((x) => x.id === e.id ? { ...x, ...fields } : x) }));
  function move(offset: number) {
    update((d) => {
      const next = [...d.experiences];
      const target = index + offset;
      if (target < 0 || target >= next.length) return d;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...d, experiences: next };
    });
  }
  const budget: MediaBudget = { remaining, remainingBytes };

  return (
    <article id={`chapter-${e.id}`} className="media-chapter cv-chapter">
      <div className="media-container">
        <div className="media-chapter-top">
          <p className="media-eyebrow">Chapter {pad(index + 1)}</p>
          <div className="cv-block-tools">
            <span className="media-date">{pad(index + 1)} / {pad(total)}</span>
            <button type="button" className="cv-tool-button" disabled={disabled || index === 0} aria-label="Move chapter earlier" onClick={() => move(-1)}><ArrowUp size={14} /></button>
            <button type="button" className="cv-tool-button" disabled={disabled || index === total - 1} aria-label="Move chapter later" onClick={() => move(1)}><ArrowDown size={14} /></button>
            <button type="button" className="cv-tool-button danger" disabled={disabled} aria-label="Remove chapter"
              onClick={() => { if (window.confirm(`Remove ${e.role || "this chapter"} and its photos?`)) update((d) => ({ ...d, experiences: d.experiences.filter((x) => x.id !== e.id) })); }}><Trash2 size={14} /></button>
          </div>
        </div>
        <div className="media-chapter-layout">
          <div className="media-chapter-copy">
            <InlinePeriod id={`${e.id}-startDate`} start={e.startDate} end={e.endDate} current={e.current} disabled={disabled} onChange={patch} />
            <InlineText as="h3" id={`${e.id}-role`} value={e.role} maxLength={140} disabled={disabled} placeholder="Your role or title" ariaLabel="Role" onChange={(role) => patch({ role })} />
            <InlineText as="p" className="media-org" id={`${e.id}-organization`} value={e.organization} maxLength={140} disabled={disabled} placeholder="Organization or project" ariaLabel="Organization" onChange={(organization) => patch({ organization })} />
            <InlineText as="p" className="media-location" value={e.location} maxLength={140} disabled={disabled} placeholder="Location · Remote · Hybrid" ariaLabel="Location" onChange={(location) => patch({ location })} />
            <InlineText as="p" className="media-chapter-summary" multiline value={e.summary} maxLength={320} disabled={disabled} placeholder="The takeaway for employers — one or two sentences that capture this chapter." ariaLabel="Chapter summary" onChange={(summary) => patch({ summary })} />

            <p className="media-eyebrow cv-field-label">Results & highlights</p>
            <InlineList variant="bullets" separator={"\n"} id={`${e.id}-highlights`} value={e.highlights} maxLength={2000} disabled={disabled}
              itemPlaceholder="A result you can stand behind" addLabel="Add a result" ariaLabel="Results and highlights" onChange={(highlights) => patch({ highlights })} />

            <p className="media-eyebrow cv-field-label">Skills demonstrated</p>
            <InlineList variant="chips" separator=", " id={`${e.id}-skills`} value={e.skills} maxLength={800} disabled={disabled}
              itemPlaceholder="Add a skill" addLabel="Add skill" ariaLabel="Skills demonstrated" onChange={(skills) => patch({ skills })} />

            <details className="media-chapter-details" id={`details-${e.id}`}>
              <summary>Inside this chapter <span>Responsibilities & what you discovered</span></summary>
              <div className="media-detail-content">
                <section><h5>Responsibilities</h5>
                  <InlineText as="p" className="media-prose" multiline id={`${e.id}-duties`} value={e.duties} maxLength={4000} disabled={disabled}
                    placeholder="Describe what you actually did, who you worked with, and what you were responsible for." ariaLabel="Responsibilities" onChange={(duties) => patch({ duties })} /></section>
                <section><h5>What I discovered</h5>
                  <InlineText as="p" className="media-prose" multiline value={e.learning} maxLength={1600} disabled={disabled}
                    placeholder="A lesson, a turning point, or a strength you discovered along the way." ariaLabel="What you discovered" onChange={(learning) => patch({ learning })} /></section>
              </div>
            </details>
          </div>
          <PhotoTrack id={`photos-${e.id}`} photos={e.photos} label={`Chapter ${index + 1} photos`} budget={budget} limit={MAX_PHOTOS}
            disabled={disabled} onBusy={onBusy} onChange={(photos) => patch({ photos })} />
        </div>
      </div>
    </article>
  );
});
