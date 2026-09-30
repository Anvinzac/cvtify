import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Download, Eye, Film, FolderInput, Layers, Loader2, MoreHorizontal, Palette, Pencil, Plus, SlidersHorizontal, Sparkles, Upload } from "lucide-react";
import { useMediaProject } from "@/context/MediaProjectContext";
import { useAppState } from "@/context/AppContext";
import { EditableMediaCV } from "@/components/cv/editable/EditableMediaCV";
import { MediaCVDocument } from "@/components/cv/MediaCVDocument";
import attachMediaMotion from "@/components/cv/mediaMotion.js";
import { downloadFile, filenameFor } from "@/lib/mediaStorage";
import { demoProject, demoSamples } from "@/lib/demoProject";
import {
  emptyExperience, emptyProject, fromProfile, MAX_BACKUP_BYTES, newId, parseProject,
  projectIssues, STYLES, THEMES, type MediaSettings,
} from "@/lib/mediaProject";
import "@/components/cv/media-document.css";
import "@/components/cv/editable/editable-cv.css";
import "@/components/studio/studio.css";

type Menu = null | "add" | "appearance" | "tools" | "checklist";

/** Focus a field by id, opening any collapsed chapter details first. */
function focusField(fieldId: string) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.closest("details")?.setAttribute("open", "");
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  requestAnimationFrame(() => (el as HTMLElement).focus({ preventScroll: true }));
}

/**
 * The unified surface: one document that is both the editor and the result.
 * Edit mode renders the real CV with tap-to-type fields and dropzone media frames;
 * Preview mode renders the shipping document with its scroll parallax. No separate
 * "input phase" and no "generate" step — the draft is the CV, saved as you type.
 */
export default function LiveCV() {
  const { workspace, status, error, loadingError, temporary, continueTemporarily, updateDraft, replaceDraft, retrySave, reload } = useMediaProject();
  const { cv: oldProfile } = useAppState();
  const host = useRef<HTMLDivElement>(null);
  const restoreInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [menu, setMenu] = useState<Menu>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState("");
  const skipAutoDemo = useRef(false);
  const project = workspace?.draft;
  const issues = useMemo(() => (project ? projectIssues(project) : []), [project]);
  const busy = uploading || exporting || restoring;
  const onBusy = useCallback((value: boolean) => setUploading(value), []);
  const samples = useMemo(() => demoSamples(), []);

  useEffect(() => { document.title = project?.profile.name ? `${project.profile.name} — Media CV` : "Create your media CV — CV_tify"; }, [project?.profile.name]);
  useEffect(() => {
    if (mode !== "preview" || !project) return;
    return attachMediaMotion(host.current?.querySelector("[data-media-document]"));
  }, [mode, project]);
  useEffect(() => {
    if (!uploading) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);
  // First run (or an untouched blank draft): seed the demo persona so visitors
  // immediately see what the media CV offers. "Start a new CV" still gives a blank page.
  useEffect(() => {
    if (skipAutoDemo.current || !project) return;
    const untouched = !project.profile.name.trim() && !project.profile.headline.trim()
      && project.experiences.every((e) => !e.role.trim() && !e.organization.trim() && !e.duties.trim() && e.photos.length === 0);
    if (untouched) {
      try { replaceDraft(demoProject()); } catch { /* leave the blank draft on screen if the demo fails validation */ }
    }
  }, [project, replaceDraft]);

  if (!workspace || !project) {
    return <main className="media-studio studio-loading"><Film size={32} /><h1>{loadingError ? "Your CV could not be opened" : "Opening your live CV…"}</h1>
      {loadingError ? <><p role="alert">{loadingError}</p><p>Your stored draft has not been overwritten. Try closing other tabs, or continue in a temporary session.</p>
        <button type="button" className="studio-button" onClick={reload}>Try again</button>
        <button type="button" className="studio-button secondary" onClick={continueTemporarily}>Continue in a temporary session</button></> : <Loader2 className="animate-spin" />}
    </main>;
  }

  const setSettings = (patch: Partial<MediaSettings>) => updateDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  function addChapter() {
    const experience = emptyExperience();
    updateDraft((d) => ({ ...d, experiences: [...d.experiences, experience] }));
    setMenu(null); setMode("edit"); focusField(`${experience.id}-role`);
  }
  function addValue() {
    const value = { id: newId(), title: "", text: "" };
    updateDraft((d) => ({ ...d, values: [...d.values, value] }));
    setMenu(null); setMode("edit"); focusField(`value-${value.id}`);
  }
  async function exportHTML() {
    if (exporting) return;
    if (issues.length) { setMenu("checklist"); setNotice("Finish the essentials below, then download your CV."); return; }
    setExporting(true); setNotice("");
    try {
      const { createMediaHTML } = await import("@/lib/mediaExport");
      const html = createMediaHTML(project);
      downloadFile(html, `${filenameFor(project.profile.name)}-media-cv.html`, "text/html;charset=utf-8");
      setNotice("HTML downloaded with your photos, design, and scroll effects. It contains your contact details — share only with intended recipients.");
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : "The export could not be created. Try again with fewer photos."); }
    finally { setExporting(false); }
  }
  function backup() {
    try { downloadFile(JSON.stringify(project, null, 2), `${filenameFor(project.profile.name)}.cvtify.json`, "application/json"); setMenu(null); setNotice("Editable backup downloaded, including your photos and design."); }
    catch { setNotice("The backup could not be downloaded. Keep this tab open and try again."); }
  }
  async function restore(file?: File) {
    if (!file) return;
    setRestoring(true); setNotice("");
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("This backup is too large. Choose a CV_tify backup under 90 MB.");
      const parsed = parseProject(JSON.parse(await file.text()));
      if (!window.confirm("Replace this CV and its photos with the selected backup? Download a backup of the current one first if you want to keep it.")) return;
      replaceDraft(parsed); setMenu(null); setNotice("Backup restored.");
    } catch (cause) {
      setNotice(cause instanceof SyntaxError ? "That file is not valid JSON. Choose a CV_tify backup." : cause instanceof Error && cause.name !== "ZodError" ? cause.message : "This file is not a supported CV_tify media backup.");
    } finally { setRestoring(false); }
  }
  function loadDemo() {
    if (!window.confirm("Replace this CV with the example CV (Alex Rivera)? Download a backup first if you want to keep the current one.")) return;
    skipAutoDemo.current = true;
    replaceDraft(demoProject()); setMenu(null); setNotice("Example CV loaded — every field is editable, so you can make it yours.");
  }
  function importProfile() {
    if (!window.confirm("Copy your introduction, skills, and up to 20 work experiences into this CV? This replaces the current draft and photos, but leaves the original profile untouched.")) return;
    try { replaceDraft(fromProfile(oldProfile)); setMenu(null); setNotice("Profile copied. Confirm your dates and add your own photos."); }
    catch { setNotice("Some profile fields exceed the editor's limits. Shorten them in the profile tools, then copy again."); }
  }

  const completeness = issues.length ? `${issues.length} to finish` : "Ready to share";

  return (
    <div ref={host} className="live-page" data-mode={mode}>
      <div className="media-studio live-toolbar no-print">
        <div className="studio-header">
          <div className="studio-header-actions" style={{ gap: 14 }}>
            <span className="studio-brand"><span><Film size={20} /></span>CV_tify <small>LIVE EDITOR</small></span>
            <span className={`studio-save-state ${status}`} role="status">
              {status === "saved" ? <Check size={14} /> : status === "saving" ? <Loader2 className="animate-spin" size={14} /> : null}
              {status === "saved" ? "Saved on this device" : status === "saving" ? "Saving…" : temporary ? "Temporary session" : "Not saved"}
            </span>
          </div>

          <div className="studio-header-actions">
            <div className="live-seg" role="group" aria-label="Editing mode">
              <button type="button" aria-pressed={mode === "edit"} onClick={() => setMode("edit")}><Pencil size={14} /> Edit</button>
              <button type="button" aria-pressed={mode === "preview"} onClick={() => setMode("preview")}><Eye size={14} /> Preview</button>
            </div>

            <div className="live-menu-wrap">
              <button type="button" className="live-pill" data-tone={issues.length ? "warn" : "ok"} aria-expanded={menu === "checklist"} onClick={() => setMenu(menu === "checklist" ? null : "checklist")}>
                {issues.length ? <SlidersHorizontal size={14} /> : <Check size={14} />}{completeness}
              </button>
              {menu === "checklist" && <>
                <div className="live-backdrop" onClick={() => setMenu(null)} />
                <div className="live-checklist" role="dialog" aria-label="Completeness">
                  <h4>{issues.length ? "A few essentials to finish" : "Everything’s in place"}</h4>
                  <p>Nothing is blocked — this just helps employers read your CV. Select an item to jump to it.</p>
                  {issues.length
                    ? <ul>{issues.map((issue, i) => <li key={`${issue.field}-${i}`}><button type="button" onClick={() => { setMenu(null); setMode("edit"); focusField(issue.field); }}><Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />{issue.message}</button></li>)}</ul>
                    : <p className="live-ok"><Check size={16} /> Your CV is complete. Preview it or download the HTML.</p>}
                </div>
              </>}
            </div>

            <div className="live-menu-wrap">
              <button type="button" className="studio-button secondary" aria-expanded={menu === "add"} onClick={() => setMenu(menu === "add" ? null : "add")}><Plus size={16} /> Add</button>
              {menu === "add" && <>
                <div className="live-backdrop" onClick={() => setMenu(null)} />
                <div className="live-menu" role="menu" aria-label="Add to your CV">
                  <h4>Add to your CV</h4>
                  <button type="button" className="live-menu-item" role="menuitem" onClick={addChapter}><Layers size={16} /> New chapter<small>A role, project, or period</small></button>
                  <button type="button" className="live-menu-item" role="menuitem" onClick={addValue}><Plus size={16} /> New value<small>What matters to you</small></button>
                  <div className="live-menu-sep" />
                  <h4>Optional sections</h4>
                  {([["showSkills", "Skills summary"], ["showStory", "Values & self-discovery"], ["showGallery", "Photo gallery"]] as const).map(([key, label]) => (
                    <button type="button" key={key} className="live-menu-item" role="menuitemcheckbox" aria-checked={project.settings[key]} onClick={() => setSettings({ [key]: !project.settings[key] } as Partial<MediaSettings>)}>
                      {label}{project.settings[key] && <Check size={15} className="live-tick" />}
                    </button>
                  ))}
                </div>
              </>}
            </div>

            <div className="live-menu-wrap">
              <button type="button" className="studio-button secondary" aria-label="Appearance" aria-expanded={menu === "appearance"} onClick={() => setMenu(menu === "appearance" ? null : "appearance")}><Palette size={16} /></button>
              {menu === "appearance" && <>
                <div className="live-backdrop" onClick={() => setMenu(null)} />
                <div className="live-menu live-menu-wide" role="menu" aria-label="Appearance">
                  <h4>Theme</h4>
                  <div className="live-choice-row">{THEMES.map((theme) => (
                    <button type="button" key={theme.id} className={`live-swatch ${project.settings.theme === theme.id ? "selected" : ""}`} title={theme.description}
                      style={{ background: theme.background, color: theme.foreground }} onClick={() => setSettings({ theme: theme.id })}>
                      <i style={{ background: theme.accent }} />{theme.name}
                    </button>
                  ))}</div>
                  <h4>Typography</h4>
                  <div className="live-choice-row">{STYLES.map((style) => (
                    <button type="button" key={style.id} className={`live-choice ${project.settings.typography === style.id ? "selected" : ""}`} onClick={() => setSettings({ typography: style.id })}>{style.name}</button>
                  ))}</div>
                  <h4>Motion (in Preview)</h4>
                  <div className="live-choice-row">{([["immersive", "Parallax"], ["subtle", "Gentle"], ["still", "None"]] as const).map(([value, label]) => (
                    <button type="button" key={value} className={`live-choice ${project.settings.motion === value ? "selected" : ""}`} onClick={() => setSettings({ motion: value })}>{label}</button>
                  ))}</div>
                  <h4>Reading pace</h4>
                  <div className="live-choice-row">{([["quick", "Quick scan"], ["detailed", "Take your time"]] as const).map(([value, label]) => (
                    <button type="button" key={value} className={`live-choice ${project.settings.pace === value ? "selected" : ""}`} onClick={() => setSettings({ pace: value })}>{label}</button>
                  ))}</div>
                </div>
              </>}
            </div>

            <button type="button" className="studio-button" disabled={busy} onClick={() => void exportHTML()}>{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exporting ? "Preparing…" : "Download HTML"}</button>

            <div className="live-menu-wrap">
              <button type="button" className="studio-button secondary" aria-label="More actions" aria-expanded={menu === "tools"} onClick={() => setMenu(menu === "tools" ? null : "tools")}><MoreHorizontal size={16} /></button>
              {menu === "tools" && <>
                <div className="live-backdrop" onClick={() => setMenu(null)} />
                <div className="live-menu" role="menu" aria-label="More actions">
                  <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={backup}><Download size={16} /> Download editable backup</button>
                  <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={() => restoreInput.current?.click()}><Upload size={16} /> Restore a backup</button>
                  <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={importProfile}><FolderInput size={16} /> Copy existing profile</button>
                  <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={loadDemo}><Sparkles size={16} /> Load example CV</button>
                  <div className="live-menu-sep" />
                  <Link className="live-menu-item" role="menuitem" to="/studio" onClick={() => setMenu(null)}><SlidersHorizontal size={16} /> Guided step-by-step studio</Link>
                  <Link className="live-menu-item" role="menuitem" to="/profile" onClick={() => setMenu(null)}><FolderInput size={16} /> Profile tools</Link>
                  <div className="live-menu-sep" />
                  <button type="button" className="live-menu-item danger" role="menuitem" disabled={busy} onClick={() => {
                    if (window.confirm("Start a blank CV? This removes the current draft, its photos, and generated version from this browser.")) { skipAutoDemo.current = true; replaceDraft(emptyProject()); setMenu(null); setNotice("A new blank CV is ready."); }
                  }}><Film size={16} /> Start a new CV</button>
                </div>
              </>}
            </div>
          </div>
        </div>
        <input ref={restoreInput} type="file" className="sr-only" accept=".json,application/json" aria-label="Restore media CV backup" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; void restore(file); }} />
        {(notice || error) && <p className={`media-export-notice ${error ? "is-error" : ""}`} role="status">{error || notice}
          {error && !temporary && <button type="button" className="studio-text-button" style={{ marginLeft: 10 }} disabled={busy} onClick={() => void retrySave()}>Retry saving</button>}
        </p>}
      </div>

      {mode === "edit"
        ? <EditableMediaCV project={project} update={updateDraft} onBusy={onBusy} disabled={busy} samples={samples} />
        : <MediaCVDocument project={project} />}
    </div>
  );
}
