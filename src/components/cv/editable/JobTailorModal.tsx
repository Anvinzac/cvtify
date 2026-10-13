import { useState } from "react";
import { Check, Loader2, Target, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMediaProject } from "@/context/MediaProjectContext";
import {
  applyEdit, editedValue, findEntry, tailorCV, TAILOR_COST,
  type TailorEdit, type TailorRequirement,
} from "@/lib/cvTailor";

const FIELD_LABEL: Record<TailorEdit["field"], string> = {
  objective: "Mục tiêu nghề nghiệp",
  skills: "Kỹ năng",
  description: "Mô tả",
  highlights: "Thành tích nổi bật",
};
const STATUS: Record<TailorRequirement["status"], { icon: string; label: string }> = {
  matched: { icon: "✅", label: "Đã có" },
  partial: { icon: "🟡", label: "Có một phần" },
  missing: { icon: "⚪", label: "Chưa có" },
};

/** Paste a job description; AI maps its requirements to CV evidence and proposes small, targeted edits. */
export function JobTailorModal({ onClose }: { onClose: () => void }) {
  const { workspace, updateDraft } = useMediaProject();
  const { session, credits, setCredits, requireSignIn } = useAuth();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ fit: string; score: number; requirements: TailorRequirement[] } | null>(null);
  const [edits, setEdits] = useState<TailorEdit[]>([]);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  async function run() {
    if (!workspace || jd.trim().length < 30) return;
    if (!session && !(await requireSignIn("Đăng nhập để AI so khớp CV với công việc."))) return;
    setLoading(true); setError(null); setResult(null); setEdits([]); setApplied(new Set());
    try {
      const r = await tailorCV(jd, workspace);
      setResult({ fit: r.fit, score: r.score, requirements: r.requirements });
      setEdits(r.edits); setCredits(r.balance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally { setLoading(false); }
  }

  function apply(i: number) {
    updateDraft((d) => applyEdit(d, edits[i]));
    setApplied((s) => new Set(s).add(i));
  }

  const muted = { margin: 0, opacity: 0.7 } as const;

  return (
    <div className="cv-ai-overlay" onClick={onClose}>
      <div className="cv-ai-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="So khớp CV với công việc">
        <div className="cv-ai-header">
          <div className="cv-ai-title"><Target size={18} /><h3>So khớp CV với công việc</h3></div>
          <button type="button" className="cv-ai-close" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="cv-ai-body">
          <label className="cv-ai-input-label">
            <span>Dán mô tả công việc (JD) thật bạn muốn ứng tuyển</span>
            <textarea className="cv-ai-input" rows={6} value={jd} maxLength={8000} autoFocus
              onChange={(e) => setJd(e.target.value)}
              placeholder="VD: Thực tập sinh Marketing — hỗ trợ lên nội dung mạng xã hội, phân tích số liệu…" />
          </label>
          <button type="button" className="cv-ai-generate" onClick={run} disabled={loading || jd.trim().length < 30 || credits === 0}>
            {loading ? <><Loader2 size={14} className="spin" /> Đang phân tích…</> : <><Target size={14} /> Phân tích & gợi ý · {TAILOR_COST} credit</>}
          </button>
          {session && <p className="cv-ai-input-label" style={{ margin: 0 }}>Còn lại: <b>{credits ?? "…"}</b> credit</p>}
          {error && <p className="cv-ai-error">{error}</p>}

          {result && (
            <>
              <p className="cv-ai-suggestions-label" style={{ margin: 0 }}>Mức độ phù hợp: <b>{result.score}/100</b></p>
              <p className="cv-ai-input-label" style={{ margin: 0 }}>{result.fit}</p>
              <p className="cv-ai-suggestions-label" style={{ margin: 0 }}>Yêu cầu của công việc</p>
              <div className="cv-ai-suggestions">
                {result.requirements.map((r, i) => (
                  <div key={i} className="cv-ai-suggestion" style={{ flexDirection: "column", alignItems: "stretch", gap: 4, cursor: "default" }}>
                    <span className="cv-ai-suggestion-text">
                      {STATUS[r.status].icon} <b>{r.requirement}</b> · {r.kind === "skill" ? "Kỹ năng" : "Kinh nghiệm"} · {STATUS[r.status].label}
                    </span>
                    {r.evidence && <span className="cv-ai-input-label" style={muted}>Trong CV: “{r.evidence}”</span>}
                  </div>
                ))}
              </div>

              <p className="cv-ai-suggestions-label" style={{ margin: 0 }}>Chỉnh nhỏ gợi ý</p>
              {edits.length === 0 && <p className="cv-ai-input-label" style={muted}>Không có chỉnh sửa nào cần thiết từ nội dung hiện có.</p>}
              {edits.length > 0 && workspace && (
                <div className="cv-ai-suggestions">
                  {edits.map((e, i) => {
                    const entry = findEntry(workspace, e.entryId);
                    const done = applied.has(i);
                    const stale = !done && editedValue(workspace, e) === null;
                    return (
                      <div key={i} className={`cv-ai-suggestion ${done ? "selected" : ""}`} style={{ flexDirection: "column", alignItems: "stretch", gap: 6, cursor: "default" }}>
                        <span className="cv-ai-suggestions-label" style={{ margin: 0 }}>
                          {FIELD_LABEL[e.field]}{entry ? ` — ${entry.title || entry.organization}` : ""} · cho “{e.requirement}”
                        </span>
                        {e.action === "replace" && (
                          <span className="cv-ai-suggestion-text" style={{ opacity: 0.55, textDecoration: "line-through", whiteSpace: "pre-line" }}>{e.find}</span>
                        )}
                        <span className="cv-ai-suggestion-text" style={{ whiteSpace: "pre-line" }}>
                          {e.action === "replace" ? e.replace : `+ ${e.replace}`}
                        </span>
                        <span className="cv-ai-input-label" style={muted}>💡 {e.reason}</span>
                        <button type="button" className="cv-ai-apply" style={{ alignSelf: "flex-end" }} disabled={done || stale} onClick={() => apply(i)}>
                          {done ? <><Check size={14} /> Đã áp dụng</> : stale ? "Nội dung đã thay đổi" : "Áp dụng"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        <div className="cv-ai-actions">
          <button type="button" className="cv-ai-cancel" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
