import { useState } from "react";
import { Check, Loader2, Target, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMediaProject } from "@/context/MediaProjectContext";
import { applyEdit, currentValue, findEntry, tailorCV, TAILOR_COST, type TailorEdit } from "@/lib/cvTailor";

const FIELD_LABEL: Record<TailorEdit["field"], string> = {
  objective: "Mục tiêu nghề nghiệp",
  skills: "Kỹ năng",
  description: "Mô tả",
  highlights: "Thành tích nổi bật",
};

/** Paste a job description; AI proposes CV edits the user can apply one by one. */
export function JobTailorModal({ onClose }: { onClose: () => void }) {
  const { workspace, updateDraft } = useMediaProject();
  const { session, credits, setCredits, requireSignIn } = useAuth();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fit, setFit] = useState("");
  const [edits, setEdits] = useState<TailorEdit[]>([]);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  async function run() {
    if (!workspace || jd.trim().length < 30) return;
    if (!session && !(await requireSignIn("Đăng nhập để AI so khớp CV với công việc."))) return;
    setLoading(true); setError(null); setEdits([]); setApplied(new Set());
    try {
      const r = await tailorCV(jd, workspace);
      setFit(r.fit); setEdits(r.edits); setCredits(r.balance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally { setLoading(false); }
  }

  function apply(i: number) {
    updateDraft((d) => applyEdit(d, edits[i]));
    setApplied((s) => new Set(s).add(i));
  }

  return (
    <div className="cv-ai-overlay" onClick={onClose}>
      <div className="cv-ai-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Chỉnh CV theo công việc">
        <div className="cv-ai-header">
          <div className="cv-ai-title"><Target size={18} /><h3>Chỉnh CV theo công việc</h3></div>
          <button type="button" className="cv-ai-close" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="cv-ai-body">
          <label className="cv-ai-input-label">
            <span>Dán mô tả công việc (JD) bạn muốn ứng tuyển</span>
            <textarea className="cv-ai-input" rows={6} value={jd} maxLength={8000} autoFocus
              onChange={(e) => setJd(e.target.value)}
              placeholder="VD: Thực tập sinh Marketing — hỗ trợ lên nội dung mạng xã hội, phân tích số liệu…" />
          </label>
          <button type="button" className="cv-ai-generate" onClick={run} disabled={loading || jd.trim().length < 30 || credits === 0}>
            {loading ? <><Loader2 size={14} className="spin" /> Đang phân tích…</> : <><Target size={14} /> Đề xuất chỉnh sửa · {TAILOR_COST} credit</>}
          </button>
          {session && <p className="cv-ai-input-label" style={{ margin: 0 }}>Còn lại: <b>{credits ?? "…"}</b> credit</p>}
          {error && <p className="cv-ai-error">{error}</p>}
          {fit && <p className="cv-ai-input-label" style={{ margin: 0 }}><b>Đánh giá:</b> {fit}</p>}
          {edits.length > 0 && workspace && (
            <div className="cv-ai-suggestions">
              {edits.map((e, i) => {
                const entry = findEntry(workspace, e.entryId);
                const done = applied.has(i);
                return (
                  <div key={i} className={`cv-ai-suggestion ${done ? "selected" : ""}`} style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                    <span className="cv-ai-suggestions-label" style={{ margin: 0 }}>
                      {FIELD_LABEL[e.field]}{entry ? ` — ${entry.title || entry.organization}` : ""}
                    </span>
                    {!done && currentValue(workspace, e) && (
                      <span className="cv-ai-suggestion-text" style={{ opacity: 0.55, textDecoration: "line-through", whiteSpace: "pre-line" }}>{currentValue(workspace, e)}</span>
                    )}
                    <span className="cv-ai-suggestion-text" style={{ whiteSpace: "pre-line" }}>{e.suggested}</span>
                    <span className="cv-ai-input-label" style={{ margin: 0 }}>💡 {e.reason}</span>
                    <button type="button" className="cv-ai-apply" style={{ alignSelf: "flex-end" }} disabled={done} onClick={() => apply(i)}>
                      {done ? <><Check size={14} /> Đã áp dụng</> : "Áp dụng"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="cv-ai-actions">
          <button type="button" className="cv-ai-cancel" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
