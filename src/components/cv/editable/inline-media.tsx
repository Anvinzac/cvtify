import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { preparePhoto } from "@/lib/mediaStorage";
import { MAX_PHOTO_DATA_BYTES, MAX_TOTAL_PHOTOS, photoDataBytes, type GradProject, type MediaPhoto } from "@/lib/mediaProject";
import { InlineText } from "./inline-edit";

export interface MediaBudget { remaining: number; remainingBytes: number; }

/** A permissive budget used when a caller does not supply a project-wide one. */
const FULL_BUDGET: MediaBudget = { remaining: MAX_TOTAL_PHOTOS, remainingBytes: MAX_PHOTO_DATA_BYTES };

/** Collect every photo across the graduate CV (profile, education and all entries). */
function allPhotosOf(project: GradProject): MediaPhoto[] {
  return [
    ...(project.profile.photo ? [project.profile.photo] : []),
    ...(project.education.photo ? [project.education.photo] : []),
    ...project.activities.flatMap((a) => a.photos),
    ...project.internships.flatMap((i) => i.photos),
    ...project.partTimeJobs.flatMap((j) => j.photos),
  ];
}

export function budgetFor(project: GradProject): MediaBudget {
  const photos = allPhotosOf(project);
  const bytes = photos.reduce((sum, p) => sum + photoDataBytes(p), 0);
  return {
    remaining: Math.max(0, MAX_TOTAL_PHOTOS - photos.length),
    remainingBytes: Math.max(0, MAX_PHOTO_DATA_BYTES - bytes),
  };
}


/** Decode + optimize a batch of files within the remaining count/byte budget. */
async function prepareFiles(files: File[], capacity: number, bytes: number): Promise<{ photos: MediaPhoto[]; errors: string[] }> {
  const photos: MediaPhoto[] = [];
  const errors: string[] = [];
  let available = bytes;
  if (files.length > capacity) errors.push(`Chỉ thêm được ${capacity} ảnh nữa; các ảnh còn lại đã bị bỏ qua.`);
  for (const file of files.slice(0, capacity)) {
    try {
      const photo = await preparePhoto(file);
      if (photo.src.length > available) throw new Error(`${file.name}: CV đã đạt giới hạn 24 MB ảnh. Hãy xóa một ảnh hoặc dùng ảnh nhỏ hơn.`);
      photos.push(photo);
      available -= photo.src.length;
    } catch (cause) { errors.push(cause instanceof Error ? cause.message : `${file.name}: không xử lý được ảnh.`); }
  }
  return { photos, errors };
}

/** Shared upload state for the inline media editors. */
export function usePhotoUpload(onBusy?: (busy: boolean) => void) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const run = useCallback(async (files: File[], capacity: number, bytes: number): Promise<MediaPhoto[]> => {
    if (!files.length) return [];
    if (capacity <= 0) { setErrors(["CV đã đủ ảnh. Hãy xóa một ảnh để thêm ảnh khác."]); return []; }
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

interface CoverProps { photo: MediaPhoto | null; onChange: (photo: MediaPhoto | null) => void; id?: string; budget?: MediaBudget; onBusy?: (b: boolean) => void; disabled?: boolean; }

/** The hero photo: an in-content control cluster (replace / remove / describe). */
export function CoverControls({ photo, onChange, id, budget, onBusy, disabled }: CoverProps) {
  const { busy, errors, run } = usePhotoUpload(onBusy);
  const b = budget ?? FULL_BUDGET;
  const capacity = photo ? 1 : Math.min(1, b.remaining);
  const bytes = b.remainingBytes + (photo?.src.length ?? 0);
  const { input, props } = useFilePicker((files) => void run(files, capacity, bytes).then((p) => p[0] && onChange(p[0])), !!disabled || busy);

  return (
    <div className="cv-cover-controls" id={id}>
      <input {...props} aria-label="Chọn ảnh đại diện" multiple={false} />
      <div className="cv-cover-bar">
        <button type="button" className="cv-mini-button" disabled={disabled || busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 size={13} className="cv-spin" /> : <ImagePlus size={13} />}{photo ? "Đổi ảnh" : "Thêm ảnh"}
        </button>
        {photo && <button type="button" className="cv-mini-button danger" disabled={disabled || busy} aria-label="Xóa ảnh đại diện"
          onClick={() => { if (window.confirm("Xóa ảnh đại diện?")) onChange(null); }}><Trash2 size={13} /> Xóa</button>}
      </div>
      {photo && (
        <details className="cv-photo-details">
          <summary className="cv-photo-summary">Mô tả &amp; khung ảnh</summary>
          <div className="cv-popover cv-photo-pop">
            <label className="cv-pop-label">Mô tả ảnh<span>Dành cho trình đọc màn hình</span></label>
            <InlineText id={`alt-${photo.id}`} as="div" className="cv-pop-input" multiline value={photo.alt} maxLength={300}
              placeholder="Ảnh này thể hiện điều gì?" ariaLabel="Mô tả ảnh đại diện" disabled={disabled}
              onChange={(alt) => onChange({ ...photo, alt })} />
            <label className="cv-pop-label">Chú thích<span>Dòng tùy chọn dưới ảnh</span></label>
            <InlineText as="div" className="cv-pop-input" multiline value={photo.caption} maxLength={300}
              placeholder="Thêm chú thích ngắn" ariaLabel="Chú thích ảnh đại diện" disabled={disabled}
              onChange={(caption) => onChange({ ...photo, caption })} />
            <FocusSelect value={photo.position} disabled={disabled} onChange={(position) => onChange({ ...photo, position })} />
          </div>
        </details>
      )}
      <ErrorList errors={errors} />
    </div>
  );
}

function FocusSelect({ value, onChange, disabled }: { value: MediaPhoto["position"]; onChange: (v: MediaPhoto["position"]) => void; disabled?: boolean }) {
  return (
    <label className="cv-pop-label">Trọng tâm ảnh
      <select className="cv-select" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as MediaPhoto["position"])}>
        <option value="center">Giữa</option><option value="top">Trên / khuôn mặt</option><option value="bottom">Dưới / chi tiết</option>
      </select>
    </label>
  );
}


interface TrackProps {
  photos: MediaPhoto[];
  onChange: (photos: MediaPhoto[]) => void;
  id?: string; label?: string; maxPhotos?: number; budget?: MediaBudget;
  onBusy?: (b: boolean) => void; disabled?: boolean;
}

/** A photo set: each frame is captioned in place; add / reorder / remove / describe inline. Works with 0+ photos. */
export function PhotoTrack({ id, photos, label = "Ảnh", maxPhotos = 4, budget, onChange, onBusy, disabled }: TrackProps) {
  const { busy, errors, run } = usePhotoUpload(onBusy);
  const b = budget ?? FULL_BUDGET;
  const capacity = Math.max(0, Math.min(maxPhotos - photos.length, b.remaining));
  const { input, props } = useFilePicker((files) => void run(files, capacity, b.remainingBytes).then((added) => added.length && onChange([...photos, ...added].slice(0, maxPhotos))), !!disabled || busy || capacity === 0);

  function patch(photoId: string, fields: Partial<MediaPhoto>) { onChange(photos.map((p) => p.id === photoId ? { ...p, ...fields } : p)); }
  function move(index: number, offset: number) {
    const next = [...photos];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function remove(photoId: string) {
    if (!window.confirm("Xóa ảnh này?")) return;
    onChange(photos.filter((p) => p.id !== photoId));
  }

  return (
    <div className="media-photo-track cv-track" id={id} data-photo-track data-count={photos.length} aria-label={label}>
      <div className="media-photo-stack">
        {photos.map((photo, i) => (
          <figure className="media-cycle-photo cv-photo" key={photo.id} data-cycle-photo>
            <div className="cv-photo-frame">
              <img src={photo.src} alt={photo.alt || `Ảnh ${i + 1} — chưa có mô tả`} width={photo.width} height={photo.height}
                loading="lazy" decoding="async" style={{ objectPosition: photo.position }} />
              {photos.length > 1 && <span className="cv-photo-index">{String(i + 1).padStart(2, "0")}</span>}
              <div className="cv-photo-tools">
                <button type="button" className="cv-tool" disabled={disabled || i === 0} aria-label="Chuyển lên trước" onClick={() => move(i, -1)}><ArrowLeft size={13} /></button>
                <button type="button" className="cv-tool" disabled={disabled || i === photos.length - 1} aria-label="Chuyển ra sau" onClick={() => move(i, 1)}><ArrowRight size={13} /></button>
                <button type="button" className="cv-tool danger" disabled={disabled} aria-label="Xóa ảnh" onClick={() => remove(photo.id)}><Trash2 size={13} /></button>
              </div>
            </div>
            <figcaption className="cv-photo-fields">
              <InlineText as="span" className="cv-photo-caption" value={photo.caption} maxLength={300} disabled={disabled}
                placeholder="Thêm chú thích…" ariaLabel={`Chú thích ảnh ${i + 1}`} onChange={(caption) => patch(photo.id, { caption })} />
              {/* Alt text and focal point are per-photo settings, not content.
                  Kept open, every photo stacked a form under the CV and buried
                  the document itself; collapsed, the page reads as the CV. */}
              <details className="cv-photo-details">
                <summary className="cv-photo-summary">Mô tả &amp; khung ảnh</summary>
                <div className="cv-photo-pop">
                  <label className="cv-pop-label">Mô tả ảnh<span>Dành cho trình đọc màn hình</span></label>
                  <InlineText id={`alt-${photo.id}`} as="div" className="cv-pop-input" multiline value={photo.alt} maxLength={300} disabled={disabled}
                    placeholder="Ảnh này thể hiện điều gì?" ariaLabel={`Mô tả ảnh ${i + 1}`} onChange={(alt) => patch(photo.id, { alt })} />
                  <FocusSelect value={photo.position} disabled={disabled} onChange={(position) => patch(photo.id, { position })} />
                </div>
              </details>
            </figcaption>
          </figure>
        ))}
        {/* A full dropzone that only says "no room left" is a dead tile taking a
            whole grid cell; once the set is full the photos speak for it. */}
        {!disabled && (capacity > 0 || photos.length === 0) && (
          <button type="button" className="cv-photo-add" disabled={busy || capacity === 0} onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("is-dragging"); }}
            onDragLeave={(e) => e.currentTarget.classList.remove("is-dragging")}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("is-dragging"); const files = Array.from(e.dataTransfer.files); if (files.length) void run(files, capacity, b.remainingBytes).then((added) => added.length && onChange([...photos, ...added].slice(0, maxPhotos))); }}>
            {busy ? <Loader2 size={18} className="cv-spin" /> : <ImagePlus size={18} />}
            <span>{busy ? "Đang xử lý…" : capacity === 0 ? "Đã đủ ảnh" : "Thêm ảnh"}</span>
          </button>
        )}
      </div>
      <input {...props} aria-label={`Thêm ảnh vào ${label}`} multiple={maxPhotos > 1} />
      <ErrorList errors={errors} />
    </div>
  );
}

