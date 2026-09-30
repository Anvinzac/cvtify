import { describe, expect, it } from "vitest";
import { parseProject, projectIssues } from "@/lib/mediaProject";
import { demoProject } from "@/lib/demoProject";

describe("demoProject", () => {
  it("passes the zod schema and the completeness checklist", () => {
    const project = demoProject();
    expect(() => parseProject(project)).not.toThrow();
    expect(projectIssues(project)).toEqual([]);
    expect(project.experiences.length).toBeGreaterThan(1);
    expect(project.experiences.every((e) => e.photos.length > 0)).toBe(true);
  });
});
