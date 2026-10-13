import { describe, expect, it } from "vitest";
import { applyEdit, editedValue, type TailorEdit } from "@/lib/cvTailor";
import { demoProject } from "@/lib/demoProject";

const p = () => {
  const d = structuredClone(demoProject());
  d.skills = "Excel, Canva";
  d.profile.objective = "Tìm việc trong lĩnh vực marketing.";
  return d;
};
const edit = (x: Partial<TailorEdit>): TailorEdit => ({ field: "objective", entryId: "", action: "replace", find: "", replace: "", requirement: "", reason: "", ...x });

describe("cv tailor edits stay targeted", () => {
  it("replace changes only the matched phrase", () => {
    const out = applyEdit(p(), edit({ find: "Tìm việc", replace: "Ứng tuyển Thực tập sinh" }));
    expect(out.profile.objective).toBe("Ứng tuyển Thực tập sinh trong lĩnh vực marketing.");
  });
  it("replace is rejected when the phrase is not in the CV", () => {
    expect(editedValue(p(), edit({ find: "không tồn tại", replace: "x" }))).toBeNull();
  });
  it("add_skill appends once and skips duplicates", () => {
    expect(editedValue(p(), edit({ field: "skills", action: "add_skill", replace: "Figma" }))).toBe("Excel, Canva, Figma");
    expect(editedValue(p(), edit({ field: "skills", action: "add_skill", replace: "canva" }))).toBeNull();
  });
});
