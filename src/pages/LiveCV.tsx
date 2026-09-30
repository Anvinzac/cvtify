import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Award, Briefcase, Check, Download, Eye, Film, Layers, Loader2,
  MoreHorizontal, Palette, Pencil, Plus, SlidersHorizontal, Sparkles, Upload, Users,
} from "lucide-react";
import { useMediaProject } from "@/context/MediaProjectContext";
import { EditableGradCV } from "@/components/cv/editable/EditableMediaCV";
import { GradCVDocument } from "@/components/cv/MediaCVDocument";
import attachMediaMotion from "@/components/cv/mediaMotion.js";
import { downloadFile, filenameFor } from "@/lib/mediaStorage";
import { demoProject, demoSamples } from "@/lib/demoProject";
import {
  blockingIssues, emptyCertificate, emptyEntry, emptyProject, MAX_BACKUP_BYTES,
  parseProject, projectIssues, type GradSettings,
} from "@/lib/mediaProject";
import "@/components/cv/media-document.css";
import "@/components/cv/editable/editable-cv.css";
import "@/components/studio/studio.css";

type Menu = null | "add" | "appearance" | "tools" | "checklist";

/** Focus a field by id, opening any collapsed <details> wrapper first. */
function focusField(fieldId: string) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.closest("details")?.setAttribute("open", "");
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  requestAnimationFrame(() => (el as HTMLElement).focus({ preventScroll: true }));
}

const THEME_CHOICES: { id: GradSettings["theme"]; label: string }[] = [
  { id: "nebula", label: "Tinh vân" },
  { id: "ember", label: "Hoa lửa" },
  { id: "aurora", label: "Cực quang" },
];
const MOTION_CHOICES: { id: GradSettings["motion"]; label: string }[] = [
  { id: "immersive", label: "Sống động" },
  { id: "subtle", label: "Nhẹ nhàng" },
  { id: "still", label: "Tĩnh" },
];
const PACE_CHOICES: { id: GradSettings["pace"]; label: string }[] = [
  { id: "compact", label: "Gọn" },
  { id: "detailed", label: "Chi tiết" },
];

/**
 * The unified surface: one document that is both the editor and the result.
 * Edit mode renders the real CV with tap-to-type fields and dropzone photo frames;
 * Preview mode renders the shipping document with its scroll parallax. There is no
 * separate "input phase" and no "generate" step — the draft IS the CV, saved as you type.
 */
export default function LiveCV() {
  const {
    workspace, status, error, loadingError, temporary,
    continueTemporarily, updateDraft, replaceDraft, retrySave, reload,
  } = useMediaProject();

  const hostRef = useRef<HTMLDivElement>(null);
  const restoreInput = useRef<HTMLInputElement>(null);
  const skipAutoDemo = useRef(false);

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [menu, setMenu] = useState<Menu>(null);
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState("");

  const issues = useMemo(() => (workspace ? projectIssues(workspace) : []), [workspace]);
  const blocking = useMemo(() => (workspace ? blockingIssues(workspace) : []), [workspace]);
  const samples = useMemo(() => demoSamples(), []);
  const busy = exporting || restoring;

  useEffect(() => {
    document.title = workspace?.profile.name
      ? `${workspace.profile.name} — CV của tôi`
      : "Tạo CV tươi mới — CVtify";
  }, [workspace?.profile.name]);

  // Preview mode layers the scroll motion onto the rendered static document.
  useEffect(() => {
    if (mode !== "preview" || !workspace) return;
    return attachMediaMotion(hostRef.current?.querySelector("[data-media-document]"));
  }, [mode, workspace]);

  // First run (or an untouched blank draft): seed the demo persona so visitors
  // immediately see what the CV offers. "Tạo CV mới" still yields a blank page.
  useEffect(() => {
    if (skipAutoDemo.current || !workspace) return;
    const untouched = !workspace.profile.name.trim() && !workspace.education.school.trim();
    if (untouched) {
      try { replaceDraft(demoProject()); } catch { /* keep the blank draft if the demo fails validation */ }
    }
  }, [workspace, replaceDraft]);

  const setSettings = useCallback(
    (patch: Partial<GradSettings>) => updateDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [updateDraft],
  );

  if (!workspace) {
    return (
      <main className="media-studio studio-loading">
        <Film size={32} />
        <h1>{loadingError ? "Không mở được CV của bạn" : "Đang mở CV trực tiếp…"}</h1>
        {loadingError ? (
          <>
            <p role="alert">{loadingError}</p>
            <p>Bản nháp đã lưu của bạn chưa bị ghi đè. Hãy thử đóng các tab khác, hoặc tiếp tục trong phiên tạm thời.</p>
            <button type="button" className="studio-button" onClick={reload}>Thử lại</button>
            <button type="button" className="studio-button secondary" onClick={continueTemporarily}>Tiếp tục phiên tạm thời</button>
          </>
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </main>
    );
  }

  function addEntry(bucket: "activities" | "internships" | "partTimeJobs") {
    const entry = emptyEntry();
    updateDraft((d) => ({ ...d, [bucket]: [...d[bucket], entry] }));
    setMenu(null);
    setMode("edit");
    requestAnimationFrame(() => focusField(`${entry.id}-title`));
  }
  function addCertificate() {
    updateDraft((d) => ({ ...d, education: { ...d.education, certificates: [...d.education.certificates, emptyCertificate()] } }));
    setMenu(null);
    setMode("edit");
    // Certificate fields carry no per-item id; scroll to the certificates row instead.
    requestAnimationFrame(() => focusField("add-certificate"));
  }

  async function exportHTML() {
    if (exporting) return;
    if (blocking.length) {
      setMenu("checklist");
      setNotice("Hãy hoàn thiện các mục bắt buộc bên dưới, sau đó tải CV của bạn.");
      return;
    }
    setExporting(true);
    setNotice("");
    try {
      const { createMediaHTML } = await import("@/lib/mediaExport");
      const html = createMediaHTML(workspace);
      downloadFile(html, `${filenameFor(workspace.profile.name)}-cv.html`, "text/html;charset=utf-8");
      setNotice("Đã tải HTML kèm ảnh, thiết kế và hiệu ứng cuộn. File có chứa thông tin liên hệ — chỉ chia sẻ với người nhận phù hợp.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Không tạo được bản xuất. Hãy thử lại với ít ảnh hơn.");
    } finally {
      setExporting(false);
    }
  }

  function backup() {
    try {
      downloadFile(JSON.stringify(workspace, null, 2), `${filenameFor(workspace.profile.name)}.cvtify.json`, "application/json");
      setMenu(null);
      setNotice("Đã tải bản sao lưu có thể chỉnh sửa, bao gồm cả ảnh và thiết kế.");
    } catch {
      setNotice("Không tải được bản sao lưu. Hãy giữ tab này mở và thử lại.");
    }
  }

  async function restore(file?: File) {
    if (!file) return;
    setRestoring(true);
    setNotice("");
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error("Bản sao lưu quá lớn. Hãy chọn tệp sao lưu CVtify dưới 90 MB.");
      const parsed = parseProject(JSON.parse(await file.text()));
      if (!window.confirm("Thay thế CV hiện tại và ảnh của nó bằng bản sao lưu đã chọn? Hãy tải bản sao lưu của CV hiện tại trước nếu bạn muốn giữ lại.")) return;
      skipAutoDemo.current = true;
      replaceDraft(parsed);
      setMenu(null);
      setNotice("Đã khôi phục bản sao lưu.");
    } catch (cause) {
      setNotice(
        cause instanceof SyntaxError
          ? "Tệp này không phải JSON hợp lệ. Hãy chọn một bản sao lưu CVtify."
          : cause instanceof Error && cause.name !== "ZodError"
            ? cause.message
            : "Tệp này không phải bản sao lưu CVtify được hỗ trợ.",
      );
    } finally {
      setRestoring(false);
    }
  }

  function loadDemo() {
    if (!window.confirm("Thay thế CV này bằng CV mẫu? Hãy tải bản sao lưu trước nếu bạn muốn giữ CV hiện tại.")) return;
    skipAutoDemo.current = true;
    replaceDraft(demoProject());
    setMenu(null);
    setNotice("Đã tải CV mẫu — mọi trường đều có thể chỉnh sửa để bạn biến nó thành của mình.");
  }

  function startNew() {
    if (!window.confirm("Tạo một CV trống? Thao tác này sẽ xoá bản nháp hiện tại và ảnh của nó khỏi trình duyệt này.")) return;
    skipAutoDemo.current = true;
    replaceDraft(emptyProject());
    setMenu(null);
    setNotice("Đã sẵn sàng một CV trống mới.");
  }

  const completeness = blocking.length ? `Cần sửa ${blocking.length} mục` : "Hoàn thiện";
  const saveLabel = status === "saved"
    ? "Đã lưu"
    : status === "saving"
      ? "Đang lưu…"
      : temporary
        ? "Phiên tạm thời"
        : "Lỗi lưu";

  return (
    <div ref={hostRef} className="live-page" data-mode={mode}>
      <div className="media-studio live-toolbar no-print">
        <div className="studio-header">
          <div className="studio-header-actions" style={{ gap: 14 }}>
            <span className="studio-brand"><span><Film size={20} /></span>CVtify <small>LIVE EDITOR</small></span>
            <span className={`studio-save-state ${status}`} role="status">
              {status === "saved" ? <Check size={14} /> : status === "saving" ? <Loader2 className="animate-spin" size={14} /> : null}
              {saveLabel}
            </span>
          </div>

          <div className="studio-header-actions">
            <div className="live-seg" role="group" aria-label="Chế độ chỉnh sửa">
              <button type="button" aria-pressed={mode === "edit"} onClick={() => setMode("edit")}><Pencil size={14} /> Sửa</button>
              <button type="button" aria-pressed={mode === "preview"} onClick={() => setMode("preview")}><Eye size={14} /> Xem trước</button>
            </div>

            <div className="live-menu-wrap">
              <button
                type="button"
                className="live-pill"
                data-tone={blocking.length ? "warn" : "ok"}
                aria-expanded={menu === "checklist"}
                onClick={() => setMenu(menu === "checklist" ? null : "checklist")}
              >
                {blocking.length ? <SlidersHorizontal size={14} /> : <Check size={14} />}{completeness}
              </button>
              {menu === "checklist" && (
                <>
                  <div className="live-backdrop" onClick={() => setMenu(null)} />
                  <div className="live-checklist" role="dialog" aria-label="Mức độ hoàn thiện">
                    <h4>{issues.length ? "Một vài mục cần hoàn thiện" : "Mọi thứ đã sẵn sàng"}</h4>
                    <p>Chọn một mục để nhảy tới trường tương ứng.</p>
                    {issues.length ? (
                      <ul>
                        {issues.map((issue, i) => (
                          <li key={`${issue.id}-${i}`}>
                            <button
                              type="button"
                              data-blocking={issue.blocking ? "true" : "false"}
                              style={{ color: issue.blocking ? "#DC2626" : "#B45309" }}
                              onClick={() => { setMenu(null); setMode("edit"); focusField(issue.id); }}
                            >
                              <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                              {issue.message}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="live-ok"><Check size={16} /> CV của bạn đã hoàn tất. Hãy xem trước hoặc tải HTML.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="live-menu-wrap">
              <button type="button" className="studio-button secondary" aria-expanded={menu === "add"} onClick={() => setMenu(menu === "add" ? null : "add")}><Plus size={16} /> Thêm</button>
              {menu === "add" && (
                <>
                  <div className="live-backdrop" onClick={() => setMenu(null)} />
                  <div className="live-menu" role="menu" aria-label="Thêm vào CV">
                    <h4>Thêm vào CV của bạn</h4>
                    <button type="button" className="live-menu-item" role="menuitem" onClick={() => addEntry("activities")}><Layers size={16} /> + Hoạt động</button>
                    <button type="button" className="live-menu-item" role="menuitem" onClick={() => addEntry("internships")}><Briefcase size={16} /> + Thực tập</button>
                    <button type="button" className="live-menu-item" role="menuitem" onClick={() => addEntry("partTimeJobs")}><Users size={16} /> + Công việc</button>
                    <button type="button" className="live-menu-item" role="menuitem" onClick={addCertificate}><Award size={16} /> + Chứng chỉ</button>
                  </div>
                </>
              )}
            </div>

            <div className="live-menu-wrap">
              <button type="button" className="studio-button secondary" aria-label="Giao diện" aria-expanded={menu === "appearance"} onClick={() => setMenu(menu === "appearance" ? null : "appearance")}><Palette size={16} /> Giao diện</button>
              {menu === "appearance" && (
                <>
                  <div className="live-backdrop" onClick={() => setMenu(null)} />
                  <div className="live-menu live-menu-wide" role="menu" aria-label="Giao diện">
                    <h4>Chủ đề</h4>
                    <div className="live-choice-row" role="radiogroup" aria-label="Chủ đề">
                      {THEME_CHOICES.map((choice) => (
                        <button type="button" key={choice.id} role="radio" aria-checked={workspace.settings.theme === choice.id}
                          className={`live-choice ${workspace.settings.theme === choice.id ? "selected" : ""}`}
                          onClick={() => setSettings({ theme: choice.id })}>{choice.label}</button>
                      ))}
                    </div>
                    <h4>Chuyển động (ở chế độ Xem trước)</h4>
                    <div className="live-choice-row" role="radiogroup" aria-label="Chuyển động">
                      {MOTION_CHOICES.map((choice) => (
                        <button type="button" key={choice.id} role="radio" aria-checked={workspace.settings.motion === choice.id}
                          className={`live-choice ${workspace.settings.motion === choice.id ? "selected" : ""}`}
                          onClick={() => setSettings({ motion: choice.id })}>{choice.label}</button>
                      ))}
                    </div>
                    <h4>Nhịp đọc</h4>
                    <div className="live-choice-row" role="radiogroup" aria-label="Nhịp đọc">
                      {PACE_CHOICES.map((choice) => (
                        <button type="button" key={choice.id} role="radio" aria-checked={workspace.settings.pace === choice.id}
                          className={`live-choice ${workspace.settings.pace === choice.id ? "selected" : ""}`}
                          onClick={() => setSettings({ pace: choice.id })}>{choice.label}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button type="button" className="studio-button" disabled={busy} onClick={() => void exportHTML()}>
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {exporting ? "Đang chuẩn bị…" : "Tải HTML"}
            </button>

            <div className="live-menu-wrap">
              <button type="button" className="studio-button secondary" aria-label="Thêm thao tác" aria-expanded={menu === "tools"} onClick={() => setMenu(menu === "tools" ? null : "tools")}><MoreHorizontal size={16} /></button>
              {menu === "tools" && (
                <>
                  <div className="live-backdrop" onClick={() => setMenu(null)} />
                  <div className="live-menu" role="menu" aria-label="Thêm thao tác">
                    <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={loadDemo}><Sparkles size={16} /> Tải CV mẫu</button>
                    <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={backup}><Download size={16} /> Sao lưu JSON</button>
                    <button type="button" className="live-menu-item" role="menuitem" disabled={busy} onClick={() => restoreInput.current?.click()}><Upload size={16} /> Khôi phục</button>
                    <div className="live-menu-sep" />
                    <button type="button" className="live-menu-item danger" role="menuitem" disabled={busy} onClick={startNew}><Film size={16} /> Tạo CV mới</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <input
          ref={restoreInput}
          type="file"
          className="sr-only"
          accept=".json,application/json"
          aria-label="Khôi phục bản sao lưu CV"
          disabled={busy}
          onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; void restore(file); }}
        />
      </div>

      {(notice || error) && (
        <div className="live-notice no-print">
          <p className={`media-export-notice ${error ? "is-error" : ""}`} role="status">
            {error || notice}
            {error && !temporary && (
              <button type="button" className="studio-text-button" style={{ marginLeft: 10 }} disabled={busy} onClick={() => void retrySave()}>Thử lưu lại</button>
            )}
          </p>
        </div>
      )}

      <div className="live-content">
        {mode === "edit"
          ? <EditableGradCV project={workspace} samples={samples} onChange={updateDraft} />
          : <GradCVDocument project={workspace} />}
      </div>
    </div>
  );
}
