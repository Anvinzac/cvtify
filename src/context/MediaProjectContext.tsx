import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { emptyProject, parseProject, type GradProject } from "@/lib/mediaProject";
import { loadMediaWorkspace, saveMediaWorkspace } from "@/lib/mediaStorage";

type SaveStatus = "loading" | "saving" | "saved" | "error";
interface MediaProjectState {
  workspace: GradProject | null;
  status: SaveStatus;
  error: string;
  loadingError: string;
  temporary: boolean;
  continueTemporarily: () => void;
  updateDraft: (update: (draft: GradProject) => GradProject) => void;
  replaceDraft: (project: GradProject) => void;
  retrySave: () => Promise<void>;
  reload: () => void;
}
const MediaProjectContext = createContext<MediaProjectState | null>(null);
const TEMPORARY_NOTICE = "Temporary session: changes are not saved in this browser. Download an editable backup before closing or reloading this tab.";

export function MediaProjectProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<GradProject | null>(null);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [error, setError] = useState("");
  const [loadingError, setLoadingError] = useState("");
  const [temporary, setTemporary] = useState(false);
  const lastSaved = useRef<GradProject | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const latest = useRef(workspace);
  latest.current = workspace;
  const timer = useRef<ReturnType<typeof setTimeout>>();

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

  const persist = useCallback(async (snapshot: GradProject) => {
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

  const updateDraft = useCallback((update: (draft: GradProject) => GradProject) => {
    setWorkspace((w) => (w ? update(w) : w));
  }, []);

  const replaceDraft = useCallback((project: GradProject) => {
    const parsed = parseProject(project);
    setWorkspace(parsed);
  }, []);

  const retrySave = useCallback(async () => {
    clearTimeout(timer.current);
    if (latest.current) await persist(latest.current);
  }, [persist]);

  const continueTemporarily = useCallback(() => {
    clearTimeout(timer.current);
    setTemporary(true);
    setLoadingError("");
    setError(TEMPORARY_NOTICE);
    setStatus("error");
    setWorkspace((current) => current ?? emptyProject());
  }, []);

  const reload = useCallback(() => setLoadAttempt((n) => n + 1), []);

  return (
    <MediaProjectContext.Provider value={{ workspace, status, error, loadingError, temporary, continueTemporarily, updateDraft, replaceDraft, retrySave, reload }}>
      {children}
    </MediaProjectContext.Provider>
  );
}

export function useMediaProject() {
  const context = useContext(MediaProjectContext);
  if (!context) throw new Error("MediaProjectProvider is required.");
  return context;
}
