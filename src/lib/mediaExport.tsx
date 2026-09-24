import { renderToStaticMarkup } from "react-dom/server";
import { MediaCVDocument } from "@/components/cv/MediaCVDocument";
import documentCss from "@/components/cv/media-document.css?inline";
import motionSource from "@/components/cv/mediaMotion.js?raw";
import { parseProject, projectIssues, type MediaProject } from "./mediaProject";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

/** No server, external images, fonts, CDN scripts, tracking, or editor data. */
export function createMediaHTML(input: MediaProject): string {
  const project = parseProject(input);
  if (projectIssues(project).length) throw new Error("Complete the required fields and generate your CV before exporting.");
  const title = `${project.profile.name.trim()} — ${project.profile.headline.trim()}`;
  const description = project.profile.tagline.trim() || project.profile.headline.trim();
  const markup = renderToStaticMarkup(<MediaCVDocument project={project} />);
  // Import the controller as source so the download needs neither a bundler nor React.
  const script = motionSource.replace("export default function attachMediaMotion", "function attachMediaMotion");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<meta name="referrer" content="no-referrer">
<meta name="description" content="${escapeHtml(description)}">
<title>${escapeHtml(title)}</title>
<style>html{margin:0;scroll-behavior:auto}body{margin:0}button{font:inherit}button:disabled{cursor:not-allowed}a{color:inherit}${documentCss}</style>
</head>
<body>
${markup}
<script>${script}\nattachMediaMotion(document.querySelector('[data-media-document]'));</script>
</body>
</html>`;
}
