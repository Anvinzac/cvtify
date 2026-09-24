import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Download, Film, FolderInput, Loader2, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { useMediaProject } from "@/context/MediaProjectContext";
import { useAppState } from "@/context/AppContext";
import { emptyProject, fromProfile, MAX_BACKUP_BYTES, parseProject, periodLabel, projectIssues, STYLES, THEMES, type ProjectIssue } from "@/lib/mediaProject";
import { downloadFile, filenameFor } from "@/lib/mediaStorage";
import { ExperienceStep, PhotosStep, ProfileStep } from "@/components/studio/ContentSteps";
import { AppearanceStep, StudioPreview } from "@/components/studio/AppearanceStep";
import "@/components/studio/studio.css";

const STEPS = [
  { label: "Your introduction", detail: "The person behind the work", title: "First, introduce yourself.", description: "Give employers a clear picture of who you are and what you bring." },
  { label: "Your experiences", detail: "Time, roles & responsibilities", title: "Every role has a story.", description: "Capture when it happened, what you did, and how it changed you." },
  { label: "Your photos", detail: "Put the story in the frame", title: "Show the work. Keep the moments.", description: "Build a set of photos for each chapter, then arrange them in the order you want them to appear." },
  { label: "Your look & feel", detail: "Theme, type & movement", title: "Make it feel like you.", description: "Pick a visual language for your story. Every choice carries through to your generated CV." },
  { label: "Review & generate", detail: "Bring your media CV to life", title: "Ready for the next chapter?", description: "Check the essentials, then turn your draft into a responsive, scroll-based media CV." },
];

export default function MediaStudio() {
  const { workspace, status, error, loadingError, generating, temporary, continueTemporarily, updateDraft, setStep, replaceDraft, generate, retrySave, reload } = useMediaProject();
  const { cv: oldProfile } = useAppState();
  const navigate = useNavigate();
  const restoreInput = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusTarget = useRef<string | null>(null);
  const [attempted, setAttempted] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState("");
  const step = workspace?.step ?? 0;
  const issues = useMemo(() => workspace ? projectIssues(workspace.draft) : [], [workspace]);
  const fieldErrors = Object.fromEntries(issues.filter((i) => attempted.includes(i.step)).map((i) => [i.field, i.message]));
  const busy = uploading || generating || restoring;

  useEffect(() => {
    document.title = "Create your media CV — CV_tify";
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = focusTarget.current ? document.getElementById(focusTarget.current) : titleRef.current;
      target?.focus({ preventScroll: true });
      if (focusTarget.current) target?.scrollIntoView({ block: "center", behavior: "auto" });
      focusTarget.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [step, !!workspace]);
  useEffect(() => {
    if (!uploading) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  if (!workspace) {
    return <main className="media-studio studio-loading"><Film size={32} /><h1>{loadingError ? "Your draft could not be opened" : "Opening your studio…"}</h1>
      {loadingError ? <><p role="alert">{loadingError}</p><p>Your stored draft has not been overwritten. Try closing other tabs or using the browser where you created it.</p><button type="button" className="studio-button" onClick={reload}>Try again</button><button type="button" className="studio-button secondary" onClick={continueTemporarily}>Continue in a temporary session</button><p>Temporary mode leaves the stored draft untouched. You can restore a backup, create a CV, and export it, but changes will be lost when this tab closes unless you download a backup.</p></> : <Loader2 className="animate-spin" />}
    </main>;
  }
  const project = workspace.draft;
  const photoCount = project.experiences.reduce((n, e) => n + e.photos.length, project.profile.cover ? 1 : 0);
  const stepInfo = STEPS[step];

  function goTo(next: number) {
    if (busy) return;
    setStep(next);
    window.scrollTo({ top: 0, behavior: "auto" });
    setNotice("");
  }
  function fix(issue: ProjectIssue) {
    setAttempted((current) => [...new Set([...current, issue.step])]);
    if (issue.step === step) {
      const element = document.getElementById(issue.field);
      element?.focus();
      element?.scrollIntoView({ block: "center", behavior: "auto" });
    } else { focusTarget.current = issue.field; goTo(issue.step); }
  }
  function nextStep() {
    const first = issues.find((issue) => issue.step === step);
    setAttempted((current) => [...new Set([...current, step])]);
    if (first) { fix(first); return; }
    goTo(step + 1);
  }
  async function handleGenerate() {
    setAttempted([0, 1, 2, 3, 4]);
    if (issues.length) { fix(issues[0]); return; }
    if (await generate()) { window.scrollTo({ top: 0, behavior: "auto" }); navigate("/media-cv"); }
  }
  function backup() {
    try {
      downloadFile(JSON.stringify(project, null, 2), `${filenameFor(project.profile.name)}.cvtify.json`, "application/json");
      setNotice("Backup downloaded, including your photos and design choices. Keep it private; it contains your contact details.");
    } catch { setNotice("The backup could not be downloaded. Keep this tab open and try again."); }
  }
  async function restore(file?: File) {
    if (!file) return;
    setRestoring(true);
    setNotice("");
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("This backup is too large. Choose a CV_tify backup under 90 MB.");
      const parsed = parseProject(JSON.parse(await file.text()));
      if (!window.confirm("Replace this media draft and its generated version with the selected backup? Download a backup of the current draft first if you want to keep it.")) return;
      replaceDraft(parsed);
      setAttempted([]);
      setNotice("Backup restored. Review your content, then generate the CV again.");
    } catch (cause) {
      setNotice(cause instanceof SyntaxError ? "That file is not valid JSON. Choose a CV_tify backup." : cause instanceof Error && cause.name !== "ZodError" ? cause.message : "This file is not a supported CV_tify media backup, or contains invalid fields/images.");
    } finally { setRestoring(false); }
  }
  function importProfile() {
    if (!window.confirm("Copy your introduction, skills, and up to 20 work experiences into a new media draft? Education and other sections remain in the original profile. This replaces the current media draft and generated CV, but leaves the original profile untouched. Review any sample content before generating.")) return;
    try { replaceDraft(fromProfile(oldProfile)); setAttempted([]); setNotice("Profile copied. Confirm your dates and responsibilities, then attach your own photos. No sample photos were added."); }
    catch { setNotice("Some profile fields exceed the media editor's limits. Shorten them in the existing profile editor, then copy again."); }
  }

  return (
    <div className="media-studio">
      <header className="studio-header">
        <Link to="/" className="studio-brand" aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault(); }}><span><Film size={21} /></span>CV_tify <small>MEDIA STUDIO</small></Link>
        <div className="studio-header-actions">
          <span className={`studio-save-state ${status}`} role="status">{status === "saved" ? <Check size={14} /> : status === "saving" ? <Loader2 className="animate-spin" size={14} /> : null}{status === "saved" ? "Saved on this device" : status === "saving" ? "Saving draft…" : "Not saved"}</span>
          <button className="studio-button secondary" type="button" disabled={busy || !workspace.generated} onClick={() => navigate("/media-cv")}>View generated CV <ArrowRight size={15} /></button>
        </div>
      </header>
      <div className="studio-layout">
        <aside className="studio-sidebar">
          <p className="studio-kicker">From experience to expression</p>
          <h2>A CV with<br /><em>a point of view.</em></h2>
          <nav aria-label="CV creation steps"><ol>
            {STEPS.map((s, i) => (
              <li key={s.label}><button type="button" disabled={busy} aria-current={step === i ? "step" : undefined} onClick={() => goTo(i)}>
                <span className="studio-step-number">{i < step && !issues.some((x) => x.step === i) ? <Check size={16} /> : String(i + 1).padStart(2, "0")}</span>
                <span><strong>{s.label}</strong><small>{s.detail}</small></span>
              </button></li>
            ))}
          </ol></nav>
          <div className="studio-privacy"><ShieldCheck size={19} /><p>Private by default.<br /><small>{temporary ? "This temporary session needs a downloaded backup to keep your work." : "Your draft and photos are stored in this browser, not published online."}</small></p></div>
          <div className="studio-tools">
            <button type="button" disabled={busy} onClick={backup}><Download size={15} /> Download editable backup</button>
            <button type="button" disabled={busy} onClick={() => restoreInput.current?.click()}><Upload size={15} /> Restore a backup</button>
            <input ref={restoreInput} type="file" className="sr-only" accept=".json,application/json" aria-label="Restore media CV backup" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; void restore(file); }} />
            <button type="button" disabled={busy} onClick={importProfile}><FolderInput size={15} /> Copy existing profile</button>
            <Link to="/profile" aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault(); }}>Open existing profile tools ↗</Link>
            <button type="button" disabled={busy} className="danger" onClick={() => {
              if (window.confirm("Start a blank media CV? This removes this media draft, its photos, and generated version from this browser. Your other profile data is not affected.")) { replaceDraft(emptyProject()); setAttempted([]); setNotice("A new blank draft is ready."); }
            }}>Start a new media CV</button>
          </div>
        </aside>
        <main className="studio-main">
          <div className="studio-page-heading"><p className="studio-kicker">Create your media CV / {String(step + 1).padStart(2, "0")}</p><h1 ref={titleRef} tabIndex={-1}>{stepInfo.title}</h1><p>{stepInfo.description}</p></div>
          {notice && <div className="studio-note" role="status">{notice}</div>}
          {error && <div className="studio-error-box" role="status">{error}{!temporary && <div className="studio-actions"><button type="button" disabled={busy} onClick={() => void retrySave()} className="studio-text-button">Retry saving</button><button type="button" disabled={busy} className="studio-text-button" onClick={() => {
            if (window.confirm("Continue without browser saving? Your current work stays in this tab and can be generated or exported. Download an editable backup before leaving.")) continueTemporarily();
          }}>Use a temporary session</button></div>}</div>}
          {error && <p className="studio-error-text">Keep this tab open or download a backup to avoid losing unsaved work.</p>}
          <div className="studio-panel">
            <fieldset disabled={generating || restoring || uploading} className="studio-content-fields">
              <legend className="sr-only">{stepInfo.label}</legend>
              {step === 0 && <ProfileStep project={project} update={updateDraft} errors={fieldErrors} />}
              {step === 1 && <ExperienceStep project={project} update={updateDraft} errors={fieldErrors} />}
              {step === 2 && <PhotosStep project={project} update={updateDraft} errors={fieldErrors} disabled={busy} onBusy={setUploading} />}
              {step === 3 && <AppearanceStep project={project} onChange={(settings) => updateDraft((d) => ({ ...d, settings: { ...d.settings, ...settings } }))} />}
              {step === 4 && <div className="studio-stack">
                <div className="studio-review-banner"><Film size={28} /><div><h3>{project.profile.name || "Your media CV"}</h3><p>{project.profile.headline || "Add your professional headline"}</p></div></div>
                <div className="studio-review-stats"><span><b>{project.experiences.length}</b> chapters</span><span><b>{photoCount}</b> photos</span><span><b>{THEMES.find((t) => t.id === project.settings.theme)?.name}</b> theme</span></div>
                <div className="studio-inset"><h3>Your reading experience</h3><p>{STYLES.find((s) => s.id === project.settings.typography)?.name} type · {project.settings.motion} motion · {project.settings.pace === "quick" ? "quick-scan" : "detailed"} pace</p><button type="button" className="studio-text-button" onClick={() => goTo(3)}>Change appearance</button></div>
                <ol className="studio-review-chapters">{project.experiences.map((e, i) => <li key={e.id}><span>{String(i + 1).padStart(2, "0")}</span><div><strong>{e.role || "Untitled role"}</strong><p>{e.organization || "Organization not set"} · {periodLabel(e)}</p><small>{e.photos.length} frames · {e.duties ? "Duties added" : "Duties missing"}</small></div><button type="button" onClick={() => { focusTarget.current = `${e.id}-role`; goTo(1); }} className="studio-text-button">Edit</button></li>)}</ol>
                {!!issues.length ? <div className="studio-error-box"><h3>A few essentials still need attention</h3><ul>{issues.map((issue, i) => <li key={`${issue.field}-${i}`}><button type="button" onClick={() => fix(issue)}>{issue.message} →</button></li>)}</ul></div> : <p className="studio-success"><Check size={18} /> All essentials are in place. Your story is ready to generate.</p>}
                <p className="studio-note">Generation arranges your own words and images into a website. It does not invent achievements or publish anything. The generated version stays unchanged until you generate again.</p>
                {!!workspace.generated && <p className="studio-muted">A generated version already exists. Generating again replaces it with this draft.</p>}
              </div>}
            </fieldset>
            <div className="studio-footer-actions">
              <button type="button" className="studio-button secondary" disabled={busy || step === 0} onClick={() => goTo(step - 1)}><ArrowLeft size={16} /> Back</button>
              <span className="studio-muted">{step + 1} of {STEPS.length}</span>
              {step < 4 ? <button type="button" className="studio-button" disabled={busy} onClick={nextStep}>Continue <ArrowRight size={16} /></button> : <button type="button" className="studio-button" disabled={busy} onClick={() => void handleGenerate()}>{generating ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{generating ? "Generating…" : "Generate my media CV"}</button>}
            </div>
          </div>
          <p className="studio-bottom-note">No account needed. Edit in one tab at a time. Clearing browser data removes local drafts; download a backup to keep a copy.</p>
        </main>
        <StudioPreview project={project} />
      </div>
    </div>
  );
}
