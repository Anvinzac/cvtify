import { describe, it, expect } from "vitest";
import { createMediaHTML } from "@/lib/mediaExport";
import { demoProject } from "@/lib/demoProject";

/**
 * The export inlines mediaMotion.js into a classic <script>, which cannot
 * parse ES module syntax. Adding a new `export` to that module used to break
 * every downloaded CV silently — the HTML still opened, the script just threw
 * and nothing animated. These tests fail instead.
 */
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

  it("renders the hero outside the reading container so the name cannot overlap the portrait", () => {
    const heroIndex = html.indexOf('data-section="hero"');
    const containerIndex = html.indexOf('class="grad-container"');
    expect(heroIndex).toBeGreaterThan(-1);
    expect(containerIndex).toBeGreaterThan(heroIndex);
  });
});
