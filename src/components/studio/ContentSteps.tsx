import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { emptyExperience, MAX_EXPERIENCES, MAX_PHOTOS, MAX_TOTAL_PHOTOS, MAX_PHOTO_DATA_BYTES, photoDataBytes, newId, type MediaExperience, type MediaProject } from "@/lib/mediaProject";
import { StudioArea, StudioField } from "./StudioField";
import { PhotoEditor } from "./PhotoEditor";

interface Props {
  project: MediaProject;
  update: (update: (draft: MediaProject) => MediaProject) => void;
  errors: Record<string, string>;
}
export function ProfileStep({ project, update, errors }: Props) {
  const p = project.profile;
  const field = (key: Exclude<keyof MediaProject["profile"], "cover">) => ({
    id: `profile-${key}`, value: p[key], onChange: (value: string) => update((d) => ({ ...d, profile: { ...d.profile, [key]: value } })), error: errors[`profile-${key}`],
  });
  return (
    <div className="studio-stack">
      <div className="studio-two-columns">
        <StudioField {...field("name")} label="Your name" required autoComplete="name" maxLength={100} placeholder="e.g. Jordan Lee" />
        <StudioField {...field("headline")} label="Professional headline" required maxLength={160} placeholder="e.g. Product designer & researcher" />
        <StudioField {...field("email")} label="Contact email" type="email" required autoComplete="email" maxLength={254} placeholder="you@example.com" />
        <StudioField {...field("location")} label="Based in" maxLength={140} placeholder="City, country · Remote" />
      </div>
      <StudioArea {...field("tagline")} label="Your one-line introduction" maxLength={360} rows={2} placeholder="What do you bring to a team?" hint="The first thing an employer reads below your headline." />
      <StudioField {...field("availability")} label="What are you looking for?" maxLength={160} placeholder="Open to full-time roles · Available from October" />
      <StudioArea {...field("about")} label="The story behind your work" maxLength={2200} rows={5} placeholder="What brought you here, what matters to you, and where are you going?" hint="Optional. An empty introduction will be omitted from your CV." />
      <StudioField {...field("skills")} label="Signature skills" maxLength={1000} placeholder="Research, prototyping, facilitation" hint="Separate with commas. Skills from each experience are added automatically, without invented scores." />
      <div className="studio-two-columns">
        <StudioField {...field("website")} label="Website / portfolio" maxLength={500} placeholder="https://your-portfolio.com" />
        <StudioField {...field("linkedin")} label="LinkedIn" maxLength={500} placeholder="https://linkedin.com/in/your-name" />
      </div>
      <section className="studio-stack">
        <div className="studio-row"><h3>What matters to you</h3><span className="studio-muted">Optional · up to 6 values</span></div>
        {project.values.map((v) => (
          <div key={v.id} className="studio-inset studio-stack">
            <div className="studio-row">
              <StudioField id={`value-${v.id}`} label="Value" maxLength={100} value={v.title} error={errors[`value-${v.id}`]} placeholder="e.g. Curiosity before certainty"
                onChange={(title) => update((d) => ({ ...d, values: d.values.map((x) => x.id === v.id ? { ...x, title } : x) }))} />
              <button type="button" className="studio-icon-button danger" aria-label="Remove value" onClick={() => update((d) => ({ ...d, values: d.values.filter((x) => x.id !== v.id) }))}><Trash2 size={16} /></button>
            </div>
            <StudioArea id={`value-text-${v.id}`} label="What this looks like in your work" maxLength={800} rows={2} value={v.text}
              onChange={(text) => update((d) => ({ ...d, values: d.values.map((x) => x.id === v.id ? { ...x, text } : x) }))} />
          </div>
        ))}
        <button type="button" className="studio-button secondary" disabled={project.values.length >= 6} onClick={() => update((d) => ({ ...d, values: [...d.values, { id: newId(), title: "", text: "" }] }))}><Plus size={16} /> Add a value</button>
      </section>
    </div>
  );
}

export function ExperienceStep({ project, update, errors }: Props) {
  function patch(id: string, fields: Partial<MediaExperience>) {
    update((d) => ({ ...d, experiences: d.experiences.map((e) => e.id === id ? { ...e, ...fields } : e) }));
  }
  function move(index: number, offset: number) {
    update((d) => {
      const next = [...d.experiences];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return { ...d, experiences: next };
    });
  }
  return (
    <div className="studio-stack">
      <p className="studio-note">Jobs, freelance work, projects, volunteering, or education: each experience becomes a chapter. Your order here is the order of the story.</p>
      {project.experiences.map((e, i) => {
        const field = (key: "role" | "organization" | "location" | "startDate" | "endDate" | "summary" | "duties" | "highlights" | "skills" | "learning") => ({
          id: `${e.id}-${key}`, value: e[key], onChange: (value: string) => patch(e.id, { [key]: value }), error: errors[`${e.id}-${key}`],
        });
        return (
          <article key={e.id} className="studio-chapter studio-stack">
            <div className="studio-row">
              <div><span className="studio-kicker">Chapter {String(i + 1).padStart(2, "0")}</span><h3>{e.role || "Your next experience"}</h3></div>
              <div className="studio-actions">
                <button type="button" className="studio-icon-button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move chapter ${i + 1} earlier`}><ArrowUp size={16} /></button>
                <button type="button" className="studio-icon-button" disabled={i === project.experiences.length - 1} onClick={() => move(i, 1)} aria-label={`Move chapter ${i + 1} later`}><ArrowDown size={16} /></button>
                <button type="button" className="studio-icon-button danger" aria-label={`Remove chapter ${i + 1}`} onClick={() => {
                  if (window.confirm(`Remove ${e.role || "this chapter"} and its photos from the draft?`)) update((d) => ({ ...d, experiences: d.experiences.filter((x) => x.id !== e.id) }));
                }}><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="studio-two-columns">
              <StudioField {...field("role")} label="Role / position" required maxLength={140} placeholder="e.g. Design intern" />
              <StudioField {...field("organization")} label="Organization / project" required maxLength={140} placeholder="e.g. Studio North or Independent" />
              <StudioField {...field("startDate")} label="Start month" type="month" min="1000-01" max="9999-12" required />
              <StudioField {...field("endDate")} label="End month" type="month" min={e.startDate || "1000-01"} max="9999-12" disabled={e.current} required={!e.current} />
            </div>
            <label className="studio-check"><input type="checkbox" checked={e.current} onChange={(event) => patch(e.id, { current: event.target.checked })} /> I currently work / participate here</label>
            <StudioField {...field("location")} label="Location" maxLength={140} placeholder="City · Remote · Hybrid" />
            <StudioArea {...field("duties")} label="What were your duties?" required maxLength={4000} rows={5} placeholder="Describe what you actually did, the people you worked with, and your responsibilities." hint="Full details remain available behind “Dive into this chapter” in the generated CV." />
            <StudioArea {...field("summary")} label="The takeaway for employers" maxLength={320} rows={2} placeholder="One or two sentences that capture this chapter." hint="Optional. If empty, the first line of your duties becomes the takeaway." />
            <StudioArea {...field("highlights")} label="Results and highlights" maxLength={2000} rows={3} placeholder={"Launched the team's first accessible component library\nReduced weekly reporting time by 3 hours"} hint="One result per line. Only add outcomes you can substantiate." />
            <StudioField {...field("skills")} label="Skills demonstrated" maxLength={800} placeholder="Teamwork, React, user research" hint="Separate with commas. These feed the employer summary and skills section." />
            <StudioArea {...field("learning")} label="What did you discover about yourself?" maxLength={1600} rows={3} placeholder="A lesson, a turning point, or a strength you discovered along the way." />
            <span className="studio-muted">{e.photos.length} photo{e.photos.length === 1 ? "" : "s"} attached · add and arrange them in the next step</span>
          </article>
        );
      })}
      {errors["add-experience"] && <p className="studio-error-text">{errors["add-experience"]}</p>}
      <button id="add-experience" type="button" className="studio-button secondary full" disabled={project.experiences.length >= MAX_EXPERIENCES}
        onClick={() => update((d) => ({ ...d, experiences: [...d.experiences, emptyExperience()] }))}><Plus size={17} /> Add another chapter</button>
      <p className="studio-muted">{project.experiences.length} / {MAX_EXPERIENCES} chapters</p>
    </div>
  );
}

export function PhotosStep({ project, update, errors, disabled, onBusy }: Props & { disabled: boolean; onBusy: (busy: boolean) => void }) {
  const count = project.experiences.reduce((n, e) => n + e.photos.length, project.profile.cover ? 1 : 0);
  const remaining = MAX_TOTAL_PHOTOS - count;
  const bytes = photoDataBytes(project);
  const remainingBytes = Math.max(0, MAX_PHOTO_DATA_BYTES - bytes);
  return (
    <div className="studio-stack">
      <p className="studio-note">Photos stay on this device; nothing is uploaded to a server. Add only images you have permission to share, and avoid confidential work. {count} / {MAX_TOTAL_PHOTOS} photos used · {(bytes / 1024 / 1024).toFixed(1)} / 24 MB optimized image data.</p>
      <PhotoEditor id="cover-photo" title="Cover image (optional)" limit={1} remaining={remaining} remainingBytes={remainingBytes} photos={project.profile.cover ? [project.profile.cover] : []} disabled={disabled} onBusy={onBusy} errors={errors}
        onChange={(photos) => update((d) => ({ ...d, profile: { ...d.profile, cover: photos[0] ?? null } }))}
        onAppend={(photos) => update((d) => ({ ...d, profile: { ...d.profile, cover: photos[0] ?? d.profile.cover } }))} />
      <p className="studio-muted">Without a separate cover, the first photo of your first chapter opens the CV.</p>
      {project.experiences.map((e, i) => (
        <PhotoEditor key={e.id} id={`photos-${e.id}`} title={`${String(i + 1).padStart(2, "0")} · ${e.role || "Untitled chapter"}`}
          photos={e.photos} limit={MAX_PHOTOS} remaining={remaining} remainingBytes={remainingBytes} disabled={disabled} onBusy={onBusy} errors={errors}
          onChange={(photos) => update((d) => ({ ...d, experiences: d.experiences.map((x) => x.id === e.id ? { ...x, photos } : x) }))}
          onAppend={(photos) => update((d) => ({ ...d, experiences: d.experiences.map((x) => x.id === e.id ? { ...x, photos: [...x.photos, ...photos].slice(0, MAX_PHOTOS) } : x) }))} />
      ))}
      {!project.experiences.length && <p className="studio-note">Add a chapter in the Experience step before uploading its photos.</p>}
    </div>
  );
}
