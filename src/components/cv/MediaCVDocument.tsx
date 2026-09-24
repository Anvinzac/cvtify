import type { CSSProperties } from "react";
import type { Photo, Stage } from "@/lib/cvData";
import { themeStyle, toMediaCV, type MediaProject } from "@/lib/mediaProject";

/** Semantic, script-independent markup shared by the preview and HTML export. */
export function MediaCVDocument({ project }: { project: MediaProject }) {
  const cv = toMediaCV(project);
  const settings = project.settings;
  const skills = cv.skillGroups.flatMap((group) => group.items);
  const learnings = cv.experience.filter((stage) => stage.learning);
  const showSkills = settings.showSkills && skills.length > 0;
  const showStory = settings.showStory && (cv.values.length > 0 || learnings.length > 0);
  const showGallery = settings.showGallery && cv.gallery.length > 0;
  const links = [
    { id: "overview", label: "At a glance" },
    { id: "experience", label: "Experience" },
    ...(showSkills ? [{ id: "skills", label: "Skills" }] : []),
    ...(showStory ? [{ id: "story", label: "Story" }] : []),
    ...(showGallery ? [{ id: "gallery", label: "Photos" }] : []),
    { id: "contact", label: "Contact" },
  ];
  return (
    <div className={`media-cv media-document type-${settings.typography} pace-${settings.pace}`} style={themeStyle(settings)} data-media-document data-motion={settings.motion}>
      <a className="media-skip" href="#overview">Skip to career overview</a>
      <header className="media-navigation">
        <nav className="media-container" aria-label="CV sections">
          <a href="#top" className="media-identity" aria-label={`${cv.name} — back to top`}><span>{cv.name.split(/\s+/).map((n) => n[0]).slice(0, 2).join("")}</span><b>{cv.name}</b></a>
          <ul>{links.map((link) => <li key={link.id}><a href={`#${link.id}`} data-section-link>{link.label}</a></li>)}</ul>
          <button type="button" className="media-motion-toggle" data-motion-toggle hidden aria-pressed="false">Pause motion</button>
        </nav>
      </header>
      <main>
        <section id="top" className="media-hero" aria-labelledby="media-name">
          <div className="media-hero-photo">{cv.heroPhoto.src && <img src={cv.heroPhoto.src} alt={cv.heroPhoto.alt} width={cv.heroPhoto.width} height={cv.heroPhoto.height} style={{ objectPosition: cv.heroPhoto.position }} decoding="async" />}</div>
          <div className="media-hero-shade" aria-hidden="true" />
          <div className="media-container media-hero-content">
            <p className="media-eyebrow">The person behind the work</p>
            {!!cv.availability && <p className="media-availability">{cv.availability}</p>}
            <h1 id="media-name">{cv.name}</h1>
            <p className="media-headline">{cv.role}</p>
            {!!cv.tagline && <p className="media-tagline">{cv.tagline}</p>}
            {!!cv.location && <p className="media-location">{cv.location}</p>}
            <div className="media-tags" aria-label="Signature skills">{skills.slice(0, 6).map((skill) => <span key={skill.name}>{skill.name}</span>)}</div>
            <div className="media-hero-actions"><a className="media-button" href="#overview">My experience at a glance ↓</a><a className="media-button secondary" href="#contact">Get in touch ↗</a></div>
            <dl className="media-stats">{cv.stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
            {!!cv.heroPhoto.caption && <p className="media-cover-caption">{cv.heroPhoto.caption}</p>}
          </div>
        </section>

        <section id="overview" className="media-section media-container" aria-labelledby="overview-title">
          <div className="media-section-heading"><p className="media-eyebrow">The short version</p><h2 id="overview-title">Experience, <em>at a glance.</em></h2><p>Scan the essentials. Choose a chapter to explore the work behind it.</p></div>
          <ol className="media-overview-list">{cv.experience.map((stage, index) => <li key={stage.id}>
            <span className="media-index">{String(index + 1).padStart(2, "0")}</span>
            <div><p className="media-date">{stage.period}</p><h3><a href={`#chapter-${stage.id}`}>{stage.role} <span aria-hidden="true">↗</span></a></h3><p className="media-org">{stage.org}{stage.location && ` · ${stage.location}`}</p><p className="media-excerpt">{excerpt(stage.summary, 230)}</p>
              {stage.highlights[0] && <p className="media-result">{excerpt(stage.highlights[0], 200)}</p>}
              <div className="media-tags">{stage.skills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}{stage.skills.length > 5 && <span>+{stage.skills.length - 5} more</span>}</div>
            </div><a className="media-overview-photo" href={`#chapter-${stage.id}`} tabIndex={-1} aria-hidden="true">{stage.photos[0] && <img src={stage.photos[0].src} alt="" loading="lazy" decoding="async" style={{ objectPosition: stage.photos[0].position }} />}</a>
          </li>)}</ol>
        </section>

        {!!cv.manifesto && <section id="intro" className="media-intro media-section"><div className="media-container"><p className="media-eyebrow">A little context</p><h2>The story behind my work.</h2><p className="media-prose">{cv.manifesto}</p></div></section>}

        <section id="experience" aria-labelledby="experience-title">
          <div className="media-container media-section-heading media-experience-heading"><p className="media-eyebrow">The chapters</p><h2 id="experience-title">Work. Growth. <em>Perspective.</em></h2><p>A story told through the work and the moments around it.</p></div>
          {cv.experience.map((stage, index) => <ExperienceChapter key={stage.id} stage={stage} index={index} total={cv.experience.length} />)}
        </section>

        {showSkills && <section id="skills" className="media-section media-container" aria-labelledby="skills-title">
          <div className="media-section-heading"><p className="media-eyebrow">Capabilities</p><h2 id="skills-title">What I <em>bring.</em></h2><p>Skills in context, connected to the experiences where I used them.</p></div>
          <div className="media-skill-grid">{skills.map((skill) => {
            const evidence = cv.experience.filter((stage) => stage.skills.some((s) => s.toLocaleLowerCase() === skill.name.toLocaleLowerCase()));
            return <article className="media-skill-card" key={skill.name}><h3>{skill.name}</h3>{evidence.length ? <ul>{evidence.map((stage) => <li key={stage.id}><a href={`#chapter-${stage.id}`}>{stage.role} · {stage.org} ↗</a></li>)}</ul> : <p>Signature skill</p>}</article>;
          })}</div>
        </section>}

        {showStory && <section id="story" className="media-section media-story" aria-labelledby="story-title"><div className="media-container">
          <div className="media-section-heading"><p className="media-eyebrow">Self-discovery</p><h2 id="story-title">The person <em>I’m becoming.</em></h2></div>
          {!!cv.values.length && <div className="media-value-grid">{cv.values.map((value, i) => <article key={i}><p className="media-index">{String(i + 1).padStart(2, "0")}</p><h3>{value.title}</h3><p className="media-prose">{value.text}</p></article>)}</div>}
          {!!learnings.length && <div className="media-learning-list">{learnings.map((stage) => <article key={stage.id}><a className="media-eyebrow" href={`#chapter-${stage.id}`}>{stage.role} · {stage.org} ↗</a><h3>What I discovered</h3><p className="media-prose">{stage.learning}</p></article>)}</div>}
        </div></section>}

        {showGallery && <section id="gallery" className="media-section media-container" aria-labelledby="gallery-title">
          <div className="media-section-heading"><p className="media-eyebrow">In frames</p><h2 id="gallery-title">Moments <em>along the way.</em></h2></div>
          <div className="media-gallery">{cv.experience.flatMap((stage) => stage.photos.map((photo, i) => <PhotoFigure key={`${stage.id}-${photo.id ?? i}`} photo={photo} context={`${stage.role} · ${stage.org}`} />))}</div>
        </section>}

        <section id="contact" className="media-section media-contact" aria-labelledby="contact-title"><div className="media-container">
          <p className="media-eyebrow">The next chapter</p><h2 id="contact-title">Let’s <em>connect.</em></h2>
          {!!cv.availability && <p>{cv.availability}</p>}
          <a className="media-email" href={`mailto:${encodeURIComponent(cv.contact.email)}`}>{cv.contact.email} ↗</a>
          <div className="media-contact-links">{cv.contact.links.map((link) => <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}</div>
          <footer><span>{cv.name}{cv.location && ` · ${cv.location}`}</span><a href="#top">Back to top ↑</a></footer>
        </div></section>
      </main>
    </div>
  );
}

function excerpt(value: string, max: number) {
  if (value.length <= max) return value;
  const clipped = value.slice(0, max);
  const breakAt = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, breakAt > max * .6 ? breakAt : max).trimEnd()}…`;
}

function PhotoFigure({ photo, context }: { photo: Photo; context?: string }) {
  return <figure className="media-photo-figure"><div className="media-image-frame" data-parallax-frame><img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" style={{ objectPosition: photo.position }} /></div>{(photo.caption || context) && <figcaption>{photo.caption && <span>{photo.caption}</span>}{context && <small>{context}</small>}</figcaption>}</figure>;
}

function ExperienceChapter({ stage, index, total }: { stage: Stage; index: number; total: number }) {
  return <article id={`chapter-${stage.id}`} className="media-chapter">
    <div className="media-container">
      <div className="media-chapter-top"><p className="media-eyebrow">{stage.chapter}</p><span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span></div>
      <div className="media-chapter-layout">
        <div className="media-chapter-copy"><p className="media-date">{stage.period}</p><h3>{stage.role}</h3><p className="media-org">{stage.org}</p>{stage.location && <p className="media-location">{stage.location}</p>}
          <p className="media-chapter-summary">{excerpt(stage.summary, 380)}</p>
          {!!stage.highlights.length && <ul className="media-highlights">{stage.highlights.slice(0, 2).map((highlight, i) => <li key={i}>{excerpt(highlight, 180)}</li>)}</ul>}
          <div className="media-tags">{stage.skills.slice(0, 6).map((skill) => <span key={skill}>{skill}</span>)}{stage.skills.length > 6 && <span>+{stage.skills.length - 6} more</span>}</div>
          <a className="media-detail-link" href={`#details-${stage.id}`} data-open-details>Dive into this chapter ↓</a>
          <p className="media-scroll-hint" data-scroll-hint>{stage.photos.length} frames · scroll to explore</p>
        </div>
        <div className="media-photo-track" data-photo-track data-count={stage.photos.length}>
          <div className="media-photo-stack">{stage.photos.map((photo, i) => <figure key={photo.id ?? i} className="media-cycle-photo" data-cycle-photo style={{ "--photo-order": i } as CSSProperties}>
            <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" style={{ objectPosition: photo.position }} />
            <figcaption><span>{photo.caption}</span><small>{String(i + 1).padStart(2, "0")} / {String(stage.photos.length).padStart(2, "0")}</small></figcaption>
          </figure>)}</div>
        </div>
      </div>
      <details className="media-chapter-details" id={`details-${stage.id}`}>
        <summary>Inside this chapter <span>Responsibilities, outcomes & all photos</span></summary>
        <div className="media-detail-content">
          <h4>{stage.role} · {stage.org}</h4><p className="media-date">{stage.period}{stage.location && ` · ${stage.location}`}</p>
          {!!stage.summary && <p className="media-prose">{stage.summary}</p>}
          {!!stage.duties && <section><h5>Responsibilities</h5><p className="media-prose">{stage.duties}</p></section>}
          {!!stage.highlights.length && <section><h5>Results & highlights</h5><ul className="media-highlights">{stage.highlights.map((highlight, i) => <li key={i}>{highlight}</li>)}</ul></section>}
          {!!stage.skills.length && <section><h5>Skills demonstrated</h5><div className="media-tags">{stage.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
          {!!stage.learning && <section><h5>What I discovered</h5><p className="media-prose">{stage.learning}</p></section>}
          <div className="media-detail-photos">{stage.photos.map((photo, i) => <PhotoFigure key={photo.id ?? i} photo={photo} />)}</div>
          <a href={`#chapter-${stage.id}`}>Back to chapter overview ↑</a>
        </div>
      </details>
    </div>
  </article>;
}
