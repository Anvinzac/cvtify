import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { generateSuggestions, type AISuggestion } from "@/lib/aiSuggestions";

interface AISuggestionModalProps {
  context: "summary" | "duties" | "highlights" | "learning";
  roughNotes: string;
  role?: string;
  organization?: string;
  onApply: (text: string) => void;
  onClose: () => void;
}

/**
 * Modal that shows 3 AI-generated suggestions for a field.
 * User types rough notes, AI generates 3 professional versions.
 */
export function AISuggestionModal({ context, roughNotes, role, organization, onApply, onClose }: AISuggestionModalProps) {
  const [input, setInput] = useState(roughNotes);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const results = await generateSuggestions(context, input, role, organization);
      setSuggestions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (selected !== null && suggestions[selected]) {
      onApply(suggestions[selected].text);
      onClose();
    }
  }

  const contextLabel = {
    summary: "summary",
    duties: "responsibilities",
    highlights: "highlights",
    learning: "reflection",
  }[context];

  return (
    <div className="cv-ai-overlay" onClick={onClose}>
      <div className="cv-ai-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="AI suggestions">
        <div className="cv-ai-header">
          <div className="cv-ai-title">
            <Sparkles size={18} />
            <h3>AI Assist — {contextLabel}</h3>
          </div>
          <button type="button" className="cv-ai-close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="cv-ai-body">
          <label className="cv-ai-input-label">
            <span>Type your rough notes — AI will polish them into professional wording</span>
            <textarea
              className="cv-ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. led team of 5, shipped new dashboard, improved performance by 40%..."
              rows={4}
              autoFocus
            />
          </label>

          <button
            type="button"
            className="cv-ai-generate"
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate 3 versions
              </>
            )}
          </button>

          {error && <p className="cv-ai-error">{error}</p>}

          {suggestions.length > 0 && (
            <div className="cv-ai-suggestions">
              <p className="cv-ai-suggestions-label">Pick a version:</p>
              {suggestions.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`cv-ai-suggestion ${selected === i ? "selected" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  <span className="cv-ai-suggestion-num">{s.id}</span>
                  <span className="cv-ai-suggestion-text">{s.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cv-ai-actions">
          <button type="button" className="cv-ai-cancel" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="cv-ai-apply"
            onClick={handleApply}
            disabled={selected === null}
          >
            Apply selected
          </button>
        </div>
      </div>
    </div>
  );
}
