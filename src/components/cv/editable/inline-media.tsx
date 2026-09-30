import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { preparePhoto } from "@/lib/mediaStorage";
import { MAX_PHOTO_DATA_BYTES, MAX_TOTAL_PHOTOS, photoDataBytes, type MediaPhoto, type MediaProject } from "@/lib/mediaProject";
import { InlineText } from "./inline-edit";

export interface MediaBudget { remaining: number; remainingBytes: number; }
export function budgetFor(project: MediaProject): MediaBudget {
  const count = project.experiences.reduce((n, e) => n + e.photos.length, project.profile.cover ? 1 : 0);
  return { remaining: Math.max(0, MAX_TOTAL_PHOTOS - count), remainingBytes: Math.max(0, MAX_PHOTO_DATA_BYTES - photoDataBytes(project)) };
}

/** Decode + optimize a batch of files within the remaining count/byte budget. */
async function prepareFiles(files: File[], capacity: number, bytes: number): Promise<{ photos: MediaPhoto[]; errors: string[] }> {
  const photos: MediaPhoto[] = [];
  const errors: string[] = [];
  let available = bytes;
  if (files.length > capacity) errors.push(`Only ${capacity} more photo${capacity === 1 ? "" : "s"} fit here; the rest were skipped.`);
  for (const file of files.slice(0, capacity)) {
    try {
      const photo = await preparePhoto(file);
      if (photo.src.length > available) throw new Error(`${file.name}: the CV has reached its 24 MB photo budget. Remove a photo or use a smaller image.`);
      photos.push(photo);
      available -= photo.src.length;
    } catch (cause) { errors.push(cause instanceof Error ? cause.message : `${file.name}: could not be prepared.`); }
  }
  return { photos, errors };
}

/** Shared upload state for the inline media editors. */
export function usePhotoUpload(onBusy?: (busy: boolean) => void) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const run = useCallback(async (files: File[], capacity: number, bytes: number): Promise<MediaPhoto[]> => {
    if (!files.length) return [];
    if (capacity <= 0) { setErrors(["This CV is full. Remove a photo to add another."]); return []; }
    setBusy(true); onBusy?.(true); setErrors([]);
    try {
      const result = await prepareFiles(files, capacity, bytes);
      setErrors(result.errors);
      return result.photos;
    } finally { setBusy(false); onBusy?.(false); }
  }, [onBusy]);
  return { busy, errors, setErrors, run };
}

function useFilePicker(onFiles: (files: File[]) => void, disabled: boolean) {
  const input = useRef<HTMLInputElement>(null);
  const props = {
    ref: input, type: "file" as const, accept: "image/jpeg,image/png,image/webp", className: "sr-only", disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) onFiles(files); },
  };
  return { input, props };
}

function ErrorList({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <ul className="cv-media-errors" role="alert">{errors.map((m, i) => <li key={i}>{m}</li>)}</ul>;
}

interface CoverProps { photo: MediaPhoto | null; onChange: (photo: MediaPhoto | null) => void; budget: MediaBudget; onBusy?: (b: boolean) => void; disabled?: boolean; }

/** The hero cover: a background image plus an in-content control cluster (replace / remove / describe). */
export function CoverControls({ photo, onChange, budget, onBusy, disabled }: CoverProps) {
  const { busy, errors, run } = usePhotoUpload(onBusy);
  const capacity = photo ? 1 : Math.min(1, budget.remaining);
  const bytes = budget.remainingBytes + (photo?.src.length ?? 0);
  const { input, props } = useFilePicker((files) => void run(files, capacity, bytes).then((p) => p[0] && onChange(p[0])), !!disabled || busy);

  return (
    <div className="cv-cover-controls">
      <input {...props} aria-label="Choose a cover photo" multiple={false} />
      <div className="cv-cover-bar">
        <button type="button" className="cv-mini-button" disabled={disabled || busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 size={13} className="cv-spin" /> : <ImagePlus size={13} />}{photo ? "Replace cover" : "Add cover photo"}
        </button>
        {photo && <button type="button" className="cv-mini-button danger" disabled={disabled || busy} aria-label="Remove cover photo"
          onClick={() => { if (window.confirm("Remove the cover photo?")) onChange(null); }}><Trash2 size={13} /> Remove</button>}
      </div>
      {photo && (
        <div className="cv-popover cv-photo-pop">
          <label className="cv-pop-label">Photo description<span>Read by screen readers</span></label>
          <InlineText id={`alt-${photo.id}`} as="div" className="cv-pop-input" multiline value={photo.alt} maxLength={300}
            placeholder="What does this image show?" ariaLabel="Cover photo description" disabled={disabled}
            onChange={(alt) => onChange({ ...photo, alt })} />
          <label className="cv-pop-label">Caption<span>Optional line under the hero</span></label>
          <InlineText as="div" className="cv-pop-input" multiline value={photo.caption} maxLength={300}
            placeholder="Add a short caption" ariaLabel="Cover photo caption" disabled={disabled}
            onChange={(caption) => onChange({ ...photo, caption })} />
          <FocusSelect value={photo.position} disabled={disabled} onChange={(position) => onChange({ ...photo, position })} />
        </div>
      )}
      <ErrorList errors={errors} />
    </div>
  );
}

function FocusSelect({ value, onChange, disabled }: { value: MediaPhoto["position"]; onChange: (v: MediaPhoto["position"]) => void; disabled?: boolean }) {
  return (
    <label className="cv-pop-label">Crop focus
      <select className="cv-select" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as MediaPhoto["position"])}>
        <option value="center">Center</option><option value="top">Top / faces</option><option value="bottom">Bottom / detail</option>
      </select>
    </label>
  );
}

interface TrackProps {
  id: string; photos: MediaPhoto[]; label: string; budget: MediaBudget; limit: number;
  onChange: (photos: MediaPhoto[]) => void; onBusy?: (b: boolean) => void; disabled?: boolean;
}

/** A chapter's photo set: each frame is captioned in place; add / reorder / remove / describe inline. */
export function PhotoTrack({ id, photos, label, budget, limit, onChange, onBusy, disabled }: TrackProps) {
  const { busy, errors, run } = usePhotoUpload(onBusy);
  const capacity = Math.max(0, Math.min(limit - photos.length, budget.remaining));
  const { input, props } = useFilePicker((files) => void run(files, capacity, budget.remainingBytes).then((added) => added.length && onChange([...photos, ...added].slice(0, limit))), !!disabled || busy || capacity === 0);

  function patch(photoId: string, fields: Partial<MediaPhoto>) { onChange(photos.map((p) => p.id === photoId ? { ...p, ...fields } : p)); }
  function move(index: number, offset: number) {
    const next = [...photos];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function remove(photoId: string) {
    if (!window.confirm("Remove this photo from the chapter?")) return;
    onChange(photos.filter((p) => p.id !== photoId));
  }

  return (
    <div className="media-photo-track cv-track" id={id} data-photo-track data-count={photos.length} aria-label={label}>
      <div className="media-photo-stack">
        {photos.map((photo, i) => (
          <figure className="media-cycle-photo cv-photo" key={photo.id} data-cycle-photo>
            <div className="cv-photo-frame">
              <img src={photo.src} alt={photo.alt || `Photo ${i + 1} — description not added yet`} width={photo.width} height={photo.height}
                loading="lazy" decoding="async" style={{ objectPosition: photo.position }} />
              <span className="cv-photo-index">{String(i + 1).padStart(2, "0")}</span>
              <div className="cv-photo-tools">
                <button type="button" className="cv-tool" disabled={disabled || i === 0} aria-label="Move earlier" onClick={() => move(i, -1)}><ArrowLeft size={13} /></button>
                <button type="button" className="cv-tool" disabled={disabled || i === photos.length - 1} aria-label="Move later" onClick={() => move(i, 1)}><ArrowRight size={13} /></button>
                <button type="button" className="cv-tool danger" disabled={disabled} aria-label="Remove photo" onClick={() => remove(photo.id)}><Trash2 size={13} /></button>
              </div>
            </div>
            <figcaption className="cv-photo-fields">
              <InlineText as="span" className="cv-photo-caption" value={photo.caption} maxLength={300} disabled={disabled}
                placeholder="Add a caption…" ariaLabel={`Caption for photo ${i + 1}`} onChange={(caption) => patch(photo.id, { caption })} />
              <div className="cv-photo-pop">
                <label className="cv-pop-label">Photo description<span>Read by screen readers</span></label>
                <InlineText id={`alt-${photo.id}`} as="div" className="cv-pop-input" multiline value={photo.alt} maxLength={300} disabled={disabled}
                  placeholder="What does this image show?" ariaLabel={`Description for photo ${i + 1}`} onChange={(alt) => patch(photo.id, { alt })} />
                <FocusSelect value={photo.position} disabled={disabled} onChange={(position) => patch(photo.id, { position })} />
              </div>
            </figcaption>
          </figure>
        ))}
        {!disabled && (
          <button type="button" className="cv-photo-add" disabled={busy || capacity === 0} onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-dragging"); }}
            onDragLeave={(e) => e.currentTarget.classList.remove("is-dragging")}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("is-dragging"); const files = Array.from(e.dataTransfer.files); if (files.length) void run(files, capacity, budget.remainingBytes).then((added) => added.length && onChange([...photos, ...added].slice(0, limit))); }}>
            {busy ? <Loader2 size={18} className="cv-spin" /> : <ImagePlus size={18} />}
            <span>{busy ? "Preparing…" : capacity === 0 ? "Photo limit reached" : "Add frame"}</span>
          </button>
        )}
      </div>
      <input {...props} aria-label={`Add photos to ${label}`} multiple={limit > 1} />
      <ErrorList errors={errors} />
    </div>
  );
}
