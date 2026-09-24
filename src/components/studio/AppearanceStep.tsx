import { Check, ImageIcon } from "lucide-react";
import { THEMES, STYLES, themeStyle, toMediaCV, type MediaProject, type MediaSettings } from "@/lib/mediaProject";

export function AppearanceStep({ project, onChange }: { project: MediaProject; onChange: (settings: Partial<MediaSettings>) => void }) {
  const settings = project.settings;
  return (
    <div className="studio-stack">
      <fieldset className="studio-stack"><legend>01 / Choose a color theme</legend>
        <div className="studio-theme-grid">
          {THEMES.map((theme) => (
            <label key={theme.id} className={`studio-choice ${settings.theme === theme.id ? "selected" : ""}`}>
              <input type="radio" name="theme" value={theme.id} checked={settings.theme === theme.id} onChange={() => onChange({ theme: theme.id })} />
              <div className="studio-theme-sample" style={{ background: theme.background, color: theme.foreground }}>
                <span style={{ color: theme.accent }}>A story in frames.</span><b>Aa</b>
                <div>{[theme.accent, theme.foreground, theme.muted].map((color) => <i key={color} style={{ background: color }} />)}</div>
              </div>
              <strong>{theme.name}{settings.theme === theme.id && <Check size={15} />}</strong><p>{theme.description}</p>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="studio-stack"><legend>02 / Set the typography & frame style</legend>
        <div className="studio-theme-grid">
          {STYLES.map((style) => (
            <label key={style.id} className={`studio-choice ${settings.typography === style.id ? "selected" : ""}`}>
              <input type="radio" name="typography" checked={settings.typography === style.id} onChange={() => onChange({ typography: style.id })} />
              <div className="studio-type-sample" style={{ fontFamily: style.font, fontWeight: style.id === "minimal" ? 300 : 600 }}>Your<br />next chapter.</div>
              <strong>{style.name}{settings.typography === style.id && <Check size={15} />}</strong><p>{style.description}</p>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="studio-stack"><legend>03 / Choose how the story moves</legend>
        {([
          ["immersive", "Parallax chapters", "Photos transition with scrolling; the story stays in view."],
          ["subtle", "Gentle transitions", "A flowing layout with small, scroll-linked photo movements."],
          ["still", "No motion", "A completely static, accessible photo story."],
        ] as const).map(([value, title, description]) => (
          <label key={value} className={`studio-option ${settings.motion === value ? "selected" : ""}`}>
            <input type="radio" name="motion" checked={settings.motion === value} onChange={() => onChange({ motion: value })} />
            <span><strong>{title}</strong><small>{description}</small></span>
          </label>
        ))}
        <p className="studio-muted">Device-level reduced-motion preferences always take priority. Smaller screens use a flowing layout.</p>
      </fieldset>
      <fieldset className="studio-stack"><legend>04 / Reading pace</legend>
        <label className="studio-option"><input type="radio" name="pace" checked={settings.pace === "quick"} onChange={() => onChange({ pace: "quick" })} /><span><strong>Quick scan</strong><small>A short overview and compact chapters. Details are one click away.</small></span></label>
        <label className="studio-option"><input type="radio" name="pace" checked={settings.pace === "detailed"} onChange={() => onChange({ pace: "detailed" })} /><span><strong>Take your time</strong><small>Longer scroll windows for each set of photos.</small></span></label>
      </fieldset>
      <fieldset className="studio-stack"><legend>05 / Include optional sections</legend>
        {([
          ["showSkills", "Skills summary"], ["showStory", "Values & self-discovery"], ["showGallery", "Photo gallery"],
        ] as const).map(([key, label]) => (
          <label key={key} className="studio-check"><input type="checkbox" checked={settings[key]} onChange={(e) => onChange({ [key]: e.target.checked })} />{label}</label>
        ))}
        <p className="studio-muted">Empty sections are automatically hidden. Turning a section off never deletes your content.</p>
      </fieldset>
    </div>
  );
}

/** A lightweight content preview, not a second scroll listener / duplicated full page. */
export function StudioPreview({ project }: { project: MediaProject }) {
  const cv = toMediaCV(project);
  return (
    <aside className="studio-preview" aria-label="Live design preview">
      <div className="studio-row"><span className="studio-kicker">Your story, taking shape</span><span className="studio-live-dot" /></div>
      <div className={`media-cv studio-preview-frame type-${project.settings.typography}`} style={themeStyle(project.settings)}>
        <div className="studio-preview-hero">
          {cv.heroPhoto.src ? <img src={cv.heroPhoto.src} alt="" style={{ objectPosition: cv.heroPhoto.position }} /> : <div className="studio-preview-placeholder"><ImageIcon size={32} /><span>Your photos go here</span></div>}
          <div className="studio-preview-scrim" />
          <div className="studio-preview-title"><span>THE PERSON BEHIND THE WORK</span><h2>{cv.name || "Your name."}</h2><p>{cv.role || "Your role. Your perspective."}</p></div>
        </div>
        <div className="studio-preview-body">
          <p>{cv.tagline || "A few words about what makes your work yours."}</p>
          <div className="studio-preview-stats">{cv.stats.map((s) => <div key={s.label}><b>{s.value}</b><small>{s.label}</small></div>)}</div>
          {cv.experience.slice(0, 3).map((stage, i) => (
            <div className="studio-preview-chapter" key={stage.id}><span>0{i + 1}</span><div><b>{stage.role || "A chapter of your journey"}</b><small>{stage.org || "Organization or project"}</small></div></div>
          ))}
          {cv.experience.length > 3 && <small>+ {cv.experience.length - 3} more chapters</small>}
        </div>
      </div>
      <p className="studio-muted">A design preview, updated as you type. Generate your CV to explore the full scroll experience.</p>
      <div className="studio-preview-tip"><strong>Make the first scroll count.</strong><p>Clear roles, real outcomes, and photos with context help employers see your fit quickly.</p></div>
    </aside>
  );
}
