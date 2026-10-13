import { describe, it, expect } from "vitest";
import { buildOutline, createDocx } from "@/lib/cvDocExport";
import { demoProject } from "@/lib/demoProject";

describe("CV Word/PDF export", () => {
  it("keeps name, sections and highlight bullets from the CV", () => {
    const p = demoProject();
    const o = buildOutline(p);
    expect(o.name).toBe(p.profile.name.trim());
    const entries = o.sections.flatMap((s) => s.entries);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((e) => e.bullets.every((b) => !b.startsWith("-") && b.length > 0))).toBe(true);
  });

  it("produces a non-empty Word file", async () => {
    const blob = await createDocx(demoProject());
    expect(blob.size).toBeGreaterThan(2000);
  });
});
