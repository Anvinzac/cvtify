import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function CreditChip() {
  const { session, credits, requireSignIn, signOut } = useAuth();
  if (!session) {
    return (
      <button type="button" className="live-pill" onClick={() => requireSignIn("Đăng nhập để nhận credit dùng AI.")}>
        <Sparkles size={14} /><span className="studio-btn-label">Đăng nhập</span>
      </button>
    );
  }
  return (
    <>
      <span className="live-pill" title={session.user.email ?? ""} aria-label="Số credit còn lại">
        <Sparkles size={14} />{credits ?? "…"}<span className="studio-btn-label">credit</span>
      </span>
      <button type="button" className="live-pill" aria-label="Đăng xuất" onClick={signOut}><LogOut size={14} /></button>
    </>
  );
}
