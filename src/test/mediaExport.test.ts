import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { createMediaHTML } from "@/lib/mediaExport";
import { demoProject } from "@/lib/demoProject";

/**
 * The export inlines mediaMotion.js into a classic <script>, which cannot
 * parse ES module syntax. Adding a new `export` to that module used to break
 * every downloaded CV silently — the HTML still opened, the script just threw
 * and nothing animated. These tests fail instead.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("createMediaHTML", () => {
  const html = createMediaHTML(demoProject());

  it("inlines the motion controller with no ES module syntax left in it", () => {
    const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
    expect(script).toContain("function attachMediaMotion");
    expect(script).not.toMatch(/^\s*export\s/m);
  });

  it("inlines a motion controller that parses as a classic script", () => {
    const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
    expect(() => new Function(script)).not.toThrow();
  });

  it("ships the overview tier outside any disclosure and the detail tier inside one", () => {
    // The point of the two tiers: a recruiter sees every title and one short
    // description without opening anything.
    const summaries = html.match(/<summary class="grad-entry-summary">/g) ?? [];
    expect(summaries.length).toBeGreaterThan(3);
    // Highlights and photos are detail — they must not sit in a summary.
    const summaryText = html.split('<summary class="grad-entry-summary">').slice(1)
      .map((chunk) => chunk.slice(0, chunk.indexOf("</summary>")))
      .join("");
    expect(summaryText).not.toContain("grad-entry-highlights");
    expect(summaryText).not.toContain("grad-entry-photos");
    expect(summaryText).toContain("grad-entry-title");
    expect(summaryText).toContain("grad-entry-lead");
  });

  it("leaves every disclosure closed, so the export opens as the overview", () => {
    expect(html).not.toContain("<details class=\"grad-entry\" open");
  });

  it("hides a closed disclosure's panel despite its own display declaration", () => {
    // .grad-entry-detail sets display:flex, which outranks the UA rule for a
    // closed <details>; without this the panel keeps a full layout box (Chrome
    // still skips painting it, so the bug is invisible on screen).
    // Read from disk: vitest resolves `?inline` CSS imports to an empty string,
    // so the exported <style> block is empty under test and cannot be asserted on.
    const css = readFileSync(resolve(__dirname, "../components/cv/media-document.css"), "utf8");
    expect(css).toContain(".grad-document details:not([open]) > :not(summary)");
  });

  it("renders the hero outside the reading container so the name cannot overlap the portrait", () => {
    const heroIndex = html.indexOf('data-section="hero"');
    const containerIndex = html.indexOf('class="grad-container"');
    expect(heroIndex).toBeGreaterThan(-1);
    expect(containerIndex).toBeGreaterThan(heroIndex);
  });
});
