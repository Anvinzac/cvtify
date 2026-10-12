import { describe, it, expect } from "vitest";
import { demoProject, demoSamples } from "@/lib/demoProject";
import { parseProject, projectIssues, blockingIssues, journeyEntries } from "@/lib/mediaProject";

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

describe("journeyEntries", () => {
  it("flattens the three buckets in document order, tagged with their bucket", () => {
    const items = journeyEntries(demoProject());
    expect(items).toHaveLength(6);
    expect(items.map((i) => i.bucket)).toEqual([
      "activities", "activities", "activities", "internships", "partTimeJobs", "partTimeJobs",
    ]);
    expect(items.map((i) => i.bucketLabel)).toEqual([
      "Hoạt động", "Hoạt động", "Hoạt động", "Thực tập", "Làm thêm", "Làm thêm",
    ]);
  });

  it("keeps each entry's index within its own bucket, for sample lookups", () => {
    const items = journeyEntries(demoProject());
    expect(items.map((i) => i.indexInBucket)).toEqual([0, 1, 2, 0, 0, 1]);
  });
});
