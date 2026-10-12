import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AISuggestionModal } from "./AISuggestionModal";

interface AIAssistButtonProps {
  context: "summary" | "duties" | "highlights" | "learning";
  currentValue: string;
  role?: string;
  organization?: string;
  onApply: (text: string) => void;
  disabled?: boolean;
}

/** Sparkle button: asks to sign in first (AI costs credits), then opens the suggestion modal. */
export function AIAssistButton({ context, currentValue, role, organization, onApply, disabled }: AIAssistButtonProps) {
  const [open, setOpen] = useState(false);
  const { requireSignIn } = useAuth();

  if (disabled) return null;

  return (
    <>
      <button
        type="button"
        className="cv-ai-assist-btn"
        aria-label="AI assist"
        onClick={async () => { if (await requireSignIn("Viết lại bằng AI cần tài khoản.")) setOpen(true); }}
      >
        <Sparkles size={12} />
      </button>
      {open && (
        <AISuggestionModal
          context={context}
          roughNotes={currentValue}
          role={role}
          organization={organization}
          onApply={onApply}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
