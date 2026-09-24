import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { emptyWorkspace, parseProject, projectIssues, type MediaProject, type MediaWorkspace } from "@/lib/mediaProject";
import { loadMediaWorkspace, saveMediaWorkspace } from "@/lib/mediaStorage";

type SaveStatus = "loading" | "saving" | "saved" | "error";
interface MediaProjectState {
  workspace: MediaWorkspace | null;
  status: SaveStatus;
  error: string;
  loadingError: string;
  generating: boolean;
  temporary: boolean;
  continueTemporarily: () => void;
  updateDraft: (update: (draft: MediaProject) => MediaProject) => void;
  setStep: (step: number) => void;
  replaceDraft: (project: MediaProject) => void;
  generate: () => Promise<boolean>;
  retrySave: () => Promise<void>;
  reload: () => void;
}
const MediaProjectContext = createContext<MediaProjectState | null>(null);
const TEMPORARY_NOTICE = "Temporary session: changes are not saved in this browser. Download an editable backup before closing or reloading this tab.";

export function MediaProjectProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<MediaWorkspace | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [error, setError] = useState("");
  const [loadingError, setLoadingError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const lastSaved = useRef<MediaWorkspace | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const latest = useRef(workspace);
  latest.current = workspace;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const generatingRef = useRef(false);

  useEffect(() => {
    let alive = true;
    setLoadingError("");
    loadMediaWorkspace().then((saved) => {
      if (!alive) return;
      lastSaved.current = saved;
      setWorkspace(saved);
      setStatus("saved");
    }).catch((cause: unknown) => {
      if (!alive) return;
      setLoadingError(cause instanceof Error ? cause.message : "Unable to load this browser's media draft.");
      setStatus("error");
    });
    return () => { alive = false; };
  }, [loadAttempt]);

  const persist = useCallback(async (snapshot: MediaWorkspace) => {
    if (temporary) { setStatus("error"); setError(TEMPORARY_NOTICE); return false; }
    setStatus("saving");
    setError("");
    try {
      await saveMediaWorkspace(snapshot);
      lastSaved.current = snapshot;
      if (latest.current === snapshot) setStatus("saved");
      return true;
    } catch (cause) {
      if (latest.current === snapshot) {
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Unable to save locally. Download a backup before leaving.");
      }
      return false;
    }
  }, [temporary]);

  useEffect(() => {
    if (!workspace) return;
    if (temporary) { setStatus("error"); setError(TEMPORARY_NOTICE); return; }
    if (workspace === lastSaved.current) { setStatus("saved"); return; }
    setStatus("saving");
    timer.current = setTimeout(() => { void persist(workspace); }, 450);
    return () => clearTimeout(timer.current);
  }, [workspace, persist, temporary]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (status === "saving" || status === "error") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const updateDraft = useCallback((update: (draft: MediaProject) => MediaProject) => {
    if (generatingRef.current) return;
    setWorkspace((w) => w ? { ...w, draft: update(w.draft) } : w);
  }, []);
  const setStep = useCallback((step: number) => {
    if (generatingRef.current) return;
    setWorkspace((w) => w ? { ...w, step: Math.max(0, Math.min(4, step)) } : w);
  }, []);
  const replaceDraft = useCallback((project: MediaProject) => {
    if (generatingRef.current) return;
    const parsed = parseProject(project);
    setWorkspace({ ...emptyWorkspace(), draft: parsed });
  }, []);
  const generate = useCallback(async () => {
    const current = latest.current;
    if (!current || generatingRef.current || projectIssues(current.draft).length) return false;
    generatingRef.current = true;
    setGenerating(true);
    setStatus("saving");
    clearTimeout(timer.current);
    try {
      const snapshot: MediaWorkspace = {
        ...current, generated: parseProject(current.draft), generatedAt: new Date().toISOString(), step: 4,
      };
      if (!temporary) {
        await saveMediaWorkspace(snapshot);
        lastSaved.current = snapshot;
      }
      setWorkspace(snapshot);
      setStatus(temporary ? "error" : "saved");
      setError(temporary ? TEMPORARY_NOTICE : "");
      return true;
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error ? cause.message : "Generation could not be saved. Your draft is still open.");
      return false;
    } finally { generatingRef.current = false; setGenerating(false); }
  }, [temporary]);
  const retrySave = useCallback(async () => {
    clearTimeout(timer.current);
    if (latest.current) await persist(latest.current);
  }, [persist]);

  const continueTemporarily = useCallback(() => {
    if (generatingRef.current) return;
    clearTimeout(timer.current);
    setTemporary(true);
    setLoadingError("");
    setError(TEMPORARY_NOTICE);
    setStatus("error");
    setWorkspace((current) => current ?? emptyWorkspace());
  }, []);

  return (
    <MediaProjectContext.Provider value={{ workspace, status, error, loadingError, generating, temporary, continueTemporarily, updateDraft, setStep, replaceDraft, generate, retrySave, reload: () => setLoadAttempt((n) => n + 1) }}>
      {children}
    </MediaProjectContext.Provider>
  );
}

export function useMediaProject() {
  const context = useContext(MediaProjectContext);
  if (!context) throw new Error("MediaProjectProvider is required.");
  return context;
}
