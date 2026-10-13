import { ENTRY_BUCKETS, splitItems, type GradProject } from "./mediaProject";

/** A plain, recruiter/ATS-friendly outline of the CV shared by the Word and PDF exports. */
export interface CVOutlineEntry { heading: string; sub: string; dates: string; description: string; bullets: string[] }
export interface CVOutline {
  name: string;
  contact: string[];
  objective: string;
  education: CVOutlineEntry | null;
  certificates: string[];
  sections: { title: string; entries: CVOutlineEntry[] }[];
  skills: string[];
  hobbies: string[];
}

const fmtDate = (value: string) => {
  const m = /^(\d{4})-(\d{2})$/.exec(value.trim());
  return m ? `${m[2]}/${m[1]}` : value.trim();
};
const range = (start: string, end: string, current = false) => {
  const s = fmtDate(start);
  const e = current ? "Hiện tại" : fmtDate(end);
  return s && e ? `${s} – ${e}` : s || e;
};
const lines = (value: string) => value.split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

export function buildOutline(p: GradProject): CVOutline {
  const ed = p.education;
  return {
    name: p.profile.name.trim(),
    contact: [p.profile.email, p.profile.phone, p.profile.dob && `Ngày sinh: ${p.profile.dob}`, p.profile.address]
      .map((s) => (s || "").trim()).filter(Boolean),
    objective: p.profile.objective.trim(),
    education: ed.school.trim() || ed.major.trim()
      ? {
          heading: ed.school.trim(),
          sub: [ed.major.trim(), ed.gpa.trim() && `GPA: ${ed.gpa.trim()}`].filter(Boolean).join(" · "),
          dates: range(ed.startDate, ed.endDate),
          description: ed.honors.trim(),
          bullets: [],
        }
      : null,
    certificates: ed.certificates
      .filter((c) => c.name.trim())
      .map((c) => [c.name.trim(), c.score.trim(), c.issuer.trim(), fmtDate(c.date)].filter(Boolean).join(" · ")),
    sections: ENTRY_BUCKETS.map(({ key, label }) => ({
      title: label,
      entries: p[key]
        .filter((e) => e.title.trim() || e.organization.trim())
        .map((e) => ({
          heading: e.title.trim(),
          sub: [e.organization.trim(), e.location.trim()].filter(Boolean).join(" · "),
          dates: range(e.startDate, e.endDate, e.current),
          description: e.description.trim(),
          bullets: lines(e.highlights),
        })),
    })).filter((s) => s.entries.length),
    skills: splitItems(p.skills),
    hobbies: splitItems(p.hobbies),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const ACCENT = "1F4E79";

export async function createDocx(p: GradProject): Promise<Blob> {
  const o = buildOutline(p);
  const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopType, LevelFormat } = await import("docx");
  const RIGHT = 9026; // A4 content width with 1" margins
  const sectionTitle = (t: string) => new Paragraph({
    spacing: { before: 240, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
    children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 24, color: ACCENT })],
  });
  const entry = (e: CVOutlineEntry) => [
    new Paragraph({
      spacing: { before: 120 },
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
      children: [new TextRun({ text: e.heading, bold: true }), ...(e.dates ? [new TextRun({ text: `\t${e.dates}`, color: "555555" })] : [])],
    }),
    ...(e.sub ? [new Paragraph({ children: [new TextRun({ text: e.sub, italics: true, color: "444444" })] })] : []),
    ...(e.description ? [new Paragraph({ spacing: { before: 40 }, children: [new TextRun(e.description)] })] : []),
    ...e.bullets.map((b) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(b)] })),
  ];
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: o.name, bold: true, size: 40, color: ACCENT })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: o.contact.join("  |  "), size: 20, color: "444444" })] }),
  ];
  if (o.objective) children.push(sectionTitle("Mục tiêu nghề nghiệp"), new Paragraph({ children: [new TextRun(o.objective)] }));
  if (o.education || o.certificates.length) {
    children.push(sectionTitle("Học vấn"));
    if (o.education) children.push(...entry(o.education));
    o.certificates.forEach((c) => children.push(new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun(c)] })));
  }
  o.sections.forEach((s) => { children.push(sectionTitle(s.title)); s.entries.forEach((e) => children.push(...entry(e))); });
  if (o.skills.length) children.push(sectionTitle("Kỹ năng"), new Paragraph({ children: [new TextRun(o.skills.join(" · "))] }));
  if (o.hobbies.length) children.push(sectionTitle("Sở thích"), new Paragraph({ children: [new TextRun(o.hobbies.join(" · "))] }));

  const doc = new Document({
    creator: "CVtify",
    title: `${o.name} — CV`,
    styles: { default: { document: { run: { font: "Arial", size: 21 } } } },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 } } }, children }],
  });
  return Packer.toBlob(doc);
}

export async function createPdf(p: GradProject): Promise<Blob> {
  const o = buildOutline(p);
  // Bundled Roboto covers Vietnamese diacritics.
  const pdfMakeMod: any = await import("pdfmake/build/pdfmake");
  const fontsMod: any = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeMod.default ?? pdfMakeMod;
  const vfs = fontsMod.default?.vfs ?? fontsMod.vfs ?? fontsMod.default ?? fontsMod;
  if (typeof pdfMake.addVirtualFileSystem === "function") pdfMake.addVirtualFileSystem(vfs);
  else pdfMake.vfs = vfs;

  const color = `#${ACCENT}`;
  const title = (t: string) => [
    { text: t.toUpperCase(), bold: true, color, fontSize: 12, margin: [0, 12, 0, 2] },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.8, lineColor: color }], margin: [0, 0, 0, 6] },
  ];
  const entry = (e: CVOutlineEntry) => [
    { columns: [{ text: e.heading, bold: true }, { text: e.dates, alignment: "right", color: "#555", width: "auto" }], margin: [0, 4, 0, 0] },
    e.sub ? { text: e.sub, italics: true, color: "#444" } : null,
    e.description ? { text: e.description, margin: [0, 2, 0, 0] } : null,
    e.bullets.length ? { ul: e.bullets, margin: [0, 2, 0, 0] } : null,
  ].filter(Boolean);
  const content: any[] = [
    { text: o.name, fontSize: 22, bold: true, color, alignment: "center" },
    { text: o.contact.join("  |  "), alignment: "center", color: "#444", fontSize: 9.5, margin: [0, 4, 0, 4] },
  ];
  if (o.objective) content.push(...title("Mục tiêu nghề nghiệp"), { text: o.objective });
  if (o.education || o.certificates.length) {
    content.push(...title("Học vấn"));
    if (o.education) content.push(...entry(o.education));
    if (o.certificates.length) content.push({ ul: o.certificates, margin: [0, 4, 0, 0] });
  }
  o.sections.forEach((s) => { content.push(...title(s.title)); s.entries.forEach((e) => content.push({ stack: entry(e), unbreakable: true })); });
  if (o.skills.length) content.push(...title("Kỹ năng"), { text: o.skills.join(" · ") });
  if (o.hobbies.length) content.push(...title("Sở thích"), { text: o.hobbies.join(" · ") });

  const pdf = pdfMake.createPdf({
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    info: { title: `${o.name} — CV`, creator: "CVtify" },
    defaultStyle: { font: "Roboto", fontSize: 10.5, lineHeight: 1.25 },
    content,
  });
  if (typeof pdf.getBlob === "function") {
    const r = pdf.getBlob.length ? await new Promise<Blob>((res) => pdf.getBlob(res)) : await pdf.getBlob();
    return r;
  }
  throw new Error("Không tạo được PDF.");
}
