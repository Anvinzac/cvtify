import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { preparePhoto } from "@/lib/mediaStorage";
import type { MediaPhoto } from "@/lib/mediaProject";
import { StudioField } from "./StudioField";

interface Props {
  id: string;
  title: string;
  photos: MediaPhoto[];
  limit: number;
  remaining: number;
  remainingBytes: number;
  disabled: boolean;
  onChange: (photos: MediaPhoto[]) => void;
  onAppend: (photos: MediaPhoto[]) => void;
  onBusy: (busy: boolean) => void;
  errors: Record<string, string>;
}
export function PhotoEditor({ id, title, photos, limit, remaining, remainingBytes, disabled, onChange, onAppend, onBusy, errors }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const capacity = Math.max(0, Math.min(limit - photos.length, remaining));

  async function addFiles(files: File[]) {
    if (locked.current || disabled || !files.length) return;
    const failures: string[] = [];
    if (files.length > capacity) failures.push(`Only ${capacity} more photo${capacity === 1 ? "" : "s"} can be added here. Extra files were skipped.`);
    if (!capacity) { setMessages(failures); return; }
    locked.current = true;
    setBusy(true);
    onBusy(true);
    setMessages([]);
    try {
      const accepted: MediaPhoto[] = [];
      let availableBytes = remainingBytes;
      for (const file of files.slice(0, capacity)) {
        try {
          const photo = await preparePhoto(file);
          if (photo.src.length > availableBytes) throw new Error(`${file.name}: the CV has reached its 24 MB optimized photo budget. Remove another photo or use a smaller image.`);
          accepted.push(photo);
          availableBytes -= photo.src.length;
        }
        catch (cause) { failures.push(cause instanceof Error ? cause.message : `${file.name}: unable to prepare this image.`); }
      }
      if (accepted.length) onAppend(accepted);
      setMessages(failures);
    } finally { setBusy(false); locked.current = false; onBusy(false); }
  }
  function move(index: number, offset: number) {
    const next = [...photos];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  function patch(photoId: string, fields: Partial<MediaPhoto>) {
    onChange(photos.map((p) => p.id === photoId ? { ...p, ...fields } : p));
  }

  return (
    <section className="studio-photo-section" aria-label={title}>
      <div className="studio-row"><h3>{title}</h3><span className="studio-muted">{photos.length} / {limit} frames</span></div>
      <div id={id} tabIndex={-1} aria-busy={busy} aria-disabled={disabled || capacity === 0} className={`studio-dropzone ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void addFiles(Array.from(event.dataTransfer.files)); }}>
        <input ref={input} id={`${id}-files`} type="file" accept="image/jpeg,image/png,image/webp" multiple={limit > 1}
          disabled={busy || disabled || capacity === 0} className="sr-only" aria-label={`Upload photos for ${title}`}
          onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void addFiles(files); }} />
        {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
        <button type="button" className="studio-text-button" disabled={busy || disabled || capacity === 0} onClick={() => input.current?.click()}>
          {busy ? "Preparing your photos…" : capacity === 0 ? "Photo limit reached" : "Choose photos or drop them here"}
        </button>
        <p>JPEG, PNG, or WebP · up to 12 MB each. Optimized locally to 1600 px.</p>
      </div>
      {errors[id] && <p className="studio-error-text" role="alert">{errors[id]}</p>}
      {!!messages.length && <ul className="studio-error-box" role="alert">{messages.map((m, i) => <li key={i}>{m}</li>)}</ul>}
      <div className="studio-photo-grid">
        {photos.map((photo, i) => (
          <article className="studio-photo-card" key={photo.id}>
            <div className="studio-photo-image">
              <img src={photo.src} alt={photo.alt || `Uploaded photo ${i + 1}; description not added yet`} style={{ objectPosition: photo.position }} />
              <span>{i === 0 ? "01 · Opening frame" : String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="studio-photo-fields">
              <div className="studio-row">
                <span className="studio-filename" title={photo.name}>{photo.name}</span>
                <div className="studio-actions">
                  <button type="button" className="studio-icon-button" disabled={disabled || busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move photo ${i + 1} earlier`}><ArrowLeft size={15} /></button>
                  <button type="button" className="studio-icon-button" disabled={disabled || busy || i === photos.length - 1} onClick={() => move(i, 1)} aria-label={`Move photo ${i + 1} later`}><ArrowRight size={15} /></button>
                  <button type="button" className="studio-icon-button danger" disabled={disabled || busy} onClick={() => {
                    if (window.confirm("Remove this photo from the draft? Your original file will not be affected.")) onChange(photos.filter((p) => p.id !== photo.id));
                  }} aria-label={`Remove photo ${i + 1}`}><Trash2 size={15} /></button>
                </div>
              </div>
              <StudioField id={`alt-${photo.id}`} label="Photo description" value={photo.alt} onChange={(alt) => patch(photo.id, { alt })} required maxLength={300}
                placeholder="What does this image show?" error={errors[`alt-${photo.id}`]} hint="Read by screen readers; describe what is actually visible." />
              <StudioField id={`caption-${photo.id}`} label="Story caption" value={photo.caption} onChange={(caption) => patch(photo.id, { caption })} maxLength={300} placeholder="The moment, project, or lesson behind this frame" />
              <div className="studio-field"><label htmlFor={`position-${photo.id}`}>Crop focus</label>
                <select id={`position-${photo.id}`} value={photo.position} onChange={(e) => patch(photo.id, { position: e.target.value as MediaPhoto["position"] })}>
                  <option value="center">Center</option><option value="top">Top / faces</option><option value="bottom">Bottom / detail</option>
                </select>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
