import { useState, type FormEvent } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export function SignInDialog({ reason, onClose }: { reason?: string; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function google() {
    setBusy(true); setMsg(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) { setMsg("Không thể đăng nhập bằng Google. Vui lòng thử lại."); setBusy(false); }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Email hoặc mật khẩu không đúng.");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Kiểm tra email để xác nhận tài khoản, sau đó quay lại đăng nhập.");
    }
    setBusy(false);
  }

  return (
    <div className="cv-ai-overlay" onClick={onClose}>
      <div className="cv-ai-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Đăng nhập">
        <div className="cv-ai-header">
          <div className="cv-ai-title"><Sparkles size={18} /><h3>Mở khóa tính năng AI</h3></div>
          <button type="button" className="cv-ai-close" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="cv-ai-body">
          <p className="cv-ai-input-label" style={{ margin: 0 }}>
            {reason ?? "Đăng nhập để dùng AI."} Tài khoản mới nhận <b>30 credit</b> miễn phí. CV nháp của bạn vẫn được giữ nguyên.
          </p>
          <button type="button" className="cv-ai-generate" onClick={google} disabled={busy} style={{ width: "100%" }}>
            Tiếp tục với Google
          </button>
          <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
            <input className="cv-ai-input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="cv-ai-input" type="password" required minLength={6} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="cv-ai-apply" disabled={busy}>
              {busy ? <Loader2 size={14} className="spin" /> : mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>
          {msg && <p className="cv-ai-error">{msg}</p>}
          <button type="button" className="cv-ai-cancel" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
