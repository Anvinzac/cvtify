/**
 * The affordance that tells a reader a collapsed item has more behind it, and
 * what that more is. Shared by the read-only document and the live editor so
 * both render the same markup; the chevron and its open/closed rotation are
 * CSS, so the HTML export needs no icon library.
 *
 * The label itself is built by detailSummary() in @/lib/mediaProject.
 */
export function DetailCue({ label }: { label: string }) {
  return (
    <span className="grad-entry-cue">
      <span className="grad-entry-cue-text">{label}</span>
      <span className="grad-entry-cue-chevron" aria-hidden="true" />
    </span>
  );
}

export default DetailCue;
