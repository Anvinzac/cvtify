/**
 * CV preview — section header and block wrappers for print layout.
 *
 * Exports: CvSectionHeader, CvPreviewBlock
 */

/** Centered name heading on the printed CV. */
export function CvSectionHeader({ name }: { name: string }) {
  return (
    <div className="text-center mb-5">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        {name}
      </h1>
    </div>
  );
}

/** Titled section block with underline heading. */
export function CvPreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 cv-section">
      <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.15em] border-b-2 border-slate-200 pb-1 mb-2.5">
        {title}
      </h2>
      {children}
    </div>
  );
}
