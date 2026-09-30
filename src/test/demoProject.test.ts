import { describe, it, expect } from "vitest";
import { demoProject, demoSamples } from "@/lib/demoProject";
import { parseProject, projectIssues, blockingIssues } from "@/lib/mediaProject";

describe("demoProject", () => {
  it("produces a valid GradProject that passes schema validation", () => {
    const project = demoProject();
    expect(() => parseProject(project)).not.toThrow();
  });

  it("has version 2", () => {
    const project = demoProject();
    expect(project.version).toBe(2);
  });

  it("has zero blocking issues", () => {
    const project = demoProject();
    const issues = blockingIssues(project);
    expect(issues).toHaveLength(0);
  });

  it("has Vietnamese persona data", () => {
    const project = demoProject();
    expect(project.profile.name).toContain("Nguyễn");
    expect(project.education.school).toContain("Bách Khoa");
    expect(project.education.major).toBeTruthy();
    expect(project.education.gpa).toBeTruthy();
  });

  it("has entries in all sections", () => {
    const project = demoProject();
    expect(project.activities.length).toBeGreaterThan(0);
    expect(project.internships.length).toBeGreaterThan(0);
    expect(project.partTimeJobs.length).toBeGreaterThan(0);
  });

  it("has skills and hobbies", () => {
    const project = demoProject();
    expect(project.skills).toBeTruthy();
    expect(project.hobbies).toBeTruthy();
  });

  it("has certificates", () => {
    const project = demoProject();
    expect(project.education.certificates.length).toBeGreaterThan(0);
  });

  it("demoSamples returns matching structure", () => {
    const samples = demoSamples();
    expect(samples.profile.name).toBeTruthy();
    expect(samples.education.school).toBeTruthy();
  });
});
