import { renderToStaticMarkup } from "react-dom/server";
import { GradCVDocument } from "@/components/cv/MediaCVDocument";
import documentCss from "@/components/cv/media-document.css?inline";
import motionSource from "@/components/cv/mediaMotion.js?raw";
import { blockingIssues, parseProject, type GradProject } from "./mediaProject";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]!);

/** No server, external images, fonts, CDN scripts, tracking, or editor data. */
export function createMediaHTML(input: GradProject): string {
  const project = parseProject(input);
  if (blockingIssues(project).length) throw new Error("Vui lòng hoàn thiện các mục bắt buộc trước khi tải CV.");
  const title = `${project.profile.name.trim()} — CV`;
  const description = project.profile.objective.trim() || project.education.major.trim() || project.profile.name.trim();
  const markup = renderToStaticMarkup(<GradCVDocument project={project} />);
  // Import the controller as source so the download needs neither a bundler nor React.
  // The module uses ES export syntax (a named function, a named const and a
  // default re-export) that a classic inline <script> cannot parse, so drop
  // every export keyword and the default re-export line.
  const script = motionSource
    .replace(/^export default attachMediaMotion;$/m, "")
    .replace(/^export (?=(function|const|let|var|class)\s)/gm, "");
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
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
