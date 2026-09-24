import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Film, Loader2 } from "lucide-react";
import { useMediaProject } from "@/context/MediaProjectContext";
import { MediaCVDocument } from "@/components/cv/MediaCVDocument";
import attachMediaMotion from "@/components/cv/mediaMotion.js";
import { downloadFile, filenameFor } from "@/lib/mediaStorage";
import { projectIssues } from "@/lib/mediaProject";
import "@/components/cv/media-document.css";
import "@/components/studio/studio.css";

/**
 * The media CV: one continuous, scroll-driven story.
 * Hero (at-a-glance) -> Manifesto -> Experience chapters -> Skills ->
 * Self-discovery -> Gallery -> Contact.
 * Rendered as a dark cinematic outcome of the profile setup.
 */
const CV = () => {
  const { workspace, loadingError, reload, temporary } = useMediaProject();
  const project = workspace?.generated;
  const host = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState("");
  const issues = useMemo(() => project ? projectIssues(project) : [], [project]);
  const content = useMemo(() => project && !issues.length ? <MediaCVDocument project={project} /> : null, [project, issues]);

  useEffect(() => {
    document.title = project ? `${project.profile.name} — Media CV` : "Your media CV — CV_tify";
    if (!content) return;
    return attachMediaMotion(host.current?.querySelector("[data-media-document]"));
  }, [project, content]);

  async function exportHTML() {
    if (!project || exporting) return;
    setExporting(true);
    setNotice("");
    try {
      const { createMediaHTML } = await import("@/lib/mediaExport");
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      const html = createMediaHTML(project);
      downloadFile(html, `${filenameFor(project.profile.name)}-media-cv.html`, "text/html;charset=utf-8");
      setNotice("HTML downloaded with your photos, design, and scroll effects. Open it in a browser or host it yourself. Offline typography uses system fallbacks. Share only with intended recipients; it contains your contact details.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "The export could not be created. Try again with fewer photos.");
    } finally { setExporting(false); }
  }

  if (!workspace || !project || issues.length) {
    return <main className="media-studio studio-loading">
      {!workspace && !loadingError ? <Loader2 size={30} className="animate-spin" /> : <Film size={32} />}
      <h1>{loadingError ? "Your local CV could not be opened" : !workspace ? "Opening your media CV…" : issues.length ? "This CV needs a few details" : "Your story starts in the studio"}</h1>
      {loadingError ? <><p role="alert">{loadingError}</p><button className="studio-button" type="button" onClick={reload}>Try again</button></> : workspace && <p>Add your dates, roles, duties, and photos. Choose a look, then generate your own media CV.</p>}
      <Link className="studio-button secondary" to="/">Open media studio <ArrowLeft size={16} /></Link>
    </main>;
  }

  return <div ref={host}>
    <div className="media-studio media-owner-toolbar no-print">
      <div className="studio-header">
        <Link to="/" className="studio-button secondary"><ArrowLeft size={15} /> Edit draft</Link>
        <div className="media-owner-label"><strong>Your generated CV</strong><span>{temporary ? "Temporary preview · download a backup before closing this tab." : "Local preview · not published. Draft changes appear after regeneration."}</span></div>
        <div className="studio-actions">
          <button type="button" className="studio-button secondary" disabled={exporting} onClick={() => {
            downloadFile(JSON.stringify(project, null, 2), `${filenameFor(project.profile.name)}-generated.cvtify.json`, "application/json");
            setNotice("Editable backup of this generated version downloaded. Restore it in the studio to edit it on another device.");
          }}>Editable backup</button>
          <button type="button" className="studio-button" disabled={exporting} onClick={() => void exportHTML()}>{exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}{exporting ? "Preparing HTML…" : "Download HTML"}</button>
        </div>
      </div>
      {notice && <p className="media-export-notice" role="status">{notice}</p>}
    </div>
    {content}
  </div>;
};

export default CV;
