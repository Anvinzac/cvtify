import { useState } from "react";
import { Sparkles } from "lucide-react";
import { isAIEnabled } from "@/lib/aiSuggestions";
import { AISuggestionModal } from "./AISuggestionModal";

interface AIAssistButtonProps {
  context: "summary" | "duties" | "highlights" | "learning";
  currentValue: string;
  role?: string;
  organization?: string;
  onApply: (text: string) => void;
  disabled?: boolean;
}

/**
 * Small sparkle button that opens the AI suggestion modal.
 * Hidden when disabled (Preview mode) or when AI is not configured.
 */
export function AIAssistButton({ context, currentValue, role, organization, onApply, disabled }: AIAssistButtonProps) {
  const [open, setOpen] = useState(false);

  if (disabled || !isAIEnabled()) return null;

  return (
    <>
      <button
        type="button"
        className="cv-ai-assist-btn"
        aria-label="AI assist"
        onClick={() => setOpen(true)}
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
