import { emptyProject, parseProject, type GradProject, type MediaPhoto, newId } from "./mediaProject";

const DATABASE = "cvtify-media-studio";
const STORE = "workspace";
let pendingWrite: Promise<void> = Promise.resolve();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("This browser does not support local media storage.")); return; }
    const request = indexedDB.open(DATABASE, 2);
    let blocked = false;
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onerror = () => reject(request.error ?? new Error("Local storage could not be opened."));
    request.onblocked = () => { blocked = true; reject(new Error("Close other CV_tify tabs, then retry opening the draft.")); };
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return; }
      const db = request.result;
      // Self-heal: if the database exists but is missing the expected store
      // (e.g. created by an older build), delete and recreate it.
      if (!db.objectStoreNames.contains(STORE)) {
        const version = db.version;
        db.close();
        const deleteReq = indexedDB.deleteDatabase(DATABASE);
        deleteReq.onsuccess = () => {
          const reopen = indexedDB.open(DATABASE, version + 1);
          reopen.onupgradeneeded = () => {
            if (!reopen.result.objectStoreNames.contains(STORE)) reopen.result.createObjectStore(STORE);
          };
          reopen.onsuccess = () => {
            reopen.result.onversionchange = () => reopen.result.close();
            resolve(reopen.result);
          };
          reopen.onerror = () => reject(reopen.error ?? new Error("Could not recreate local storage."));
        };
        deleteReq.onerror = () => reject(new Error("Could not clear stale local storage."));
        return;
      }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

export async function loadMediaWorkspace(): Promise<GradProject> {
  const db = await openDatabase();
  try {
    const raw = await new Promise<unknown>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).get("current");
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error ?? new Error("Draft loading was interrupted."));
      transaction.onerror = () => reject(transaction.error);
    });
    if (raw === undefined || raw === null) return emptyProject();
    // Detect legacy version-1 (work-history media CV) data, including the old
    // workspace wrapper shape, and discard it — the schema is incompatible.
    const record = raw as { version?: number; draft?: { version?: number } };
    const version = record.version ?? record.draft?.version;
    if (version !== 2) {
      console.warn("[cvtify] Ignoring incompatible saved CV (version " + String(version ?? "unknown") + "); starting a fresh graduate CV.");
      return emptyProject();
    }
    // Migrate legacy theme names (light/warm/cool) to the current dark palette.
    const LEGACY_THEME: Record<string, "nebula" | "ember" | "aurora"> = {
      light: "nebula", warm: "ember", cool: "aurora",
    };
    const maybeProject = raw as Record<string, unknown>;
    const settings = maybeProject.settings as { theme?: string } | undefined;
    if (settings?.theme && settings.theme in LEGACY_THEME) {
      (maybeProject as any).settings = { ...settings, theme: LEGACY_THEME[settings.theme] };
    }
    return parseProject(raw);
  } finally { db.close(); }
}

/** Serialize commits so an older autosave can never overwrite a newer snapshot. */
export function saveMediaWorkspace(project: GradProject): Promise<void> {
  const write = async () => {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, "readwrite");
        transaction.objectStore(STORE).put(project, "current");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error("The local draft could not be saved."));
        transaction.onabort = () => reject(transaction.error ?? new Error("Saving was interrupted. Browser storage may be full."));
      });
    } finally { db.close(); }
  };
  const next = pendingWrite.catch(() => undefined).then(write);
  pendingWrite = next;
  return next;
}

/** Remove any persisted draft so the next load starts blank. */
export function clearMediaWorkspace(): Promise<void> {
  const write = async () => {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE, "readwrite");
        transaction.objectStore(STORE).delete("current");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error("The local draft could not be cleared."));
        transaction.onabort = () => reject(transaction.error ?? new Error("Clearing was interrupted."));
      });
    } finally { db.close(); }
  };
  const next = pendingWrite.catch(() => undefined).then(write);
  pendingWrite = next;
  return next;
}

/** Decode and re-encode locally: bounded dimensions, no EXIF, no original file upload. */
export async function preparePhoto(file: File): Promise<MediaPhoto> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error(`${file.name}: choose a JPEG, PNG, or WebP image. Convert HEIC images to JPEG first.`);
  }
  if (file.size > 12 * 1024 * 1024) throw new Error(`${file.name}: the original image must be under 12 MB.`);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 80_000_000) {
      throw new Error(`${file.name}: this image is too large or cannot be decoded.`);
    }
    const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare this image.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const src = canvas.toDataURL("image/jpeg", 0.82);
    if (src.length > 2_800_000) throw new Error(`${file.name}: the optimized image is still too large. Choose a smaller image.`);
    return { id: newId(), name: file.name.slice(0, 200), src, alt: "", caption: "", position: "center", width: canvas.width, height: canvas.height };
  } catch (error) {
    if (error instanceof Error && error.name !== "EncodingError") throw error;
    throw new Error(`${file.name}: this file is not a readable image. Try exporting it as JPEG.`);
  } finally { URL.revokeObjectURL(url); }
}

export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const filenameFor = (name: string) => name.trim().replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "my-media-cv";
