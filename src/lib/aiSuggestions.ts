/**
 * AI suggestion service — calls an OpenAI-compatible endpoint to generate
 * professional CV descriptions from rough notes.
 */

export interface AISuggestionConfig {
  endpoint: string;
  apiKey: string;
  model?: string;
}

export interface AISuggestion {
  id: number;
  text: string;
}

/**
 * Get AI configuration from environment or localStorage.
 * Environment variables take precedence.
 */
export function getAIConfig(): AISuggestionConfig | null {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || localStorage.getItem("ai-endpoint");
  const apiKey = import.meta.env.VITE_AI_API_KEY || localStorage.getItem("ai-api-key");
  const model = import.meta.env.VITE_AI_MODEL || localStorage.getItem("ai-model") || "gpt-4o-mini";

  if (!endpoint || !apiKey) return null;
  return { endpoint, apiKey, model };
}

/**
 * Save AI configuration to localStorage (for runtime configuration).
 */
export function saveAIConfig(config: Partial<AISuggestionConfig>) {
  if (config.endpoint) localStorage.setItem("ai-endpoint", config.endpoint);
  if (config.apiKey) localStorage.setItem("ai-api-key", config.apiKey);
  if (config.model) localStorage.setItem("ai-model", config.model);
}

/**
 * Clear AI configuration from localStorage.
 */
export function clearAIConfig() {
  localStorage.removeItem("ai-endpoint");
  localStorage.removeItem("ai-api-key");
  localStorage.removeItem("ai-model");
}

/**
 * Get fallback AI configuration from environment.
 */
export function getAIFallbackConfig(): AISuggestionConfig | null {
  const endpoint = import.meta.env.VITE_AI_FALLBACK_ENDPOINT;
  const apiKey = import.meta.env.VITE_AI_FALLBACK_API_KEY;
  const model = import.meta.env.VITE_AI_FALLBACK_MODEL;

  if (!endpoint || !apiKey) return null;
  return { endpoint, apiKey, model };
}

/**
 * Check if AI suggestions are available (config exists).
 */
export function isAIEnabled(): boolean {
  return getAIConfig() !== null;
}

type SuggestionContext = "summary" | "duties" | "highlights" | "learning";

const CONTEXT_PROMPTS: Record<SuggestionContext, string> = {
  summary: "Write a compelling 1-2 sentence summary for a CV chapter that highlights the key achievement or takeaway for employers.",
  duties: "Write a professional description of responsibilities and what was accomplished in this role.",
  highlights: "Write 3 bullet points highlighting key results and achievements. Each bullet should be concise and impactful.",
  learning: "Write a reflective insight about what was learned or discovered during this experience.",
};

/**
 * Generate 3 AI suggestions for a given context and rough notes.
 * Tries primary config first, falls back to secondary if available.
 */
export async function generateSuggestions(
  context: SuggestionContext,
  roughNotes: string,
  role?: string,
  organization?: string
): Promise<AISuggestion[]> {
  const primaryConfig = getAIConfig();
  const fallbackConfig = getAIFallbackConfig();

  if (!primaryConfig && !fallbackConfig) throw new Error("AI not configured");

  const systemPrompt = CONTEXT_PROMPTS[context];
  const contextInfo = [role && `Role: ${role}`, organization && `Organization: ${organization}`].filter(Boolean).join("\n");
  const userPrompt = `${contextInfo ? contextInfo + "\n\n" : ""}Rough notes: ${roughNotes}\n\nGenerate exactly 3 different professional versions. Return ONLY a JSON array of 3 strings, no other text.`;

  // Try primary config first
  if (primaryConfig) {
    try {
      return await callAI(primaryConfig, systemPrompt, userPrompt);
    } catch (err) {
      // If primary fails and we have a fallback, try fallback
      if (!fallbackConfig) throw err;
      console.warn("Primary AI failed, trying fallback:", err);
    }
  }

  // Try fallback config
  if (fallbackConfig) {
    return await callAI(fallbackConfig, systemPrompt, userPrompt);
  }

  throw new Error("All AI providers failed");
}

/**
 * Internal function to call a single AI provider.
 */
async function callAI(
  config: AISuggestionConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AISuggestion[]> {
  const response = await fetch(`${config.endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI request failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) throw new Error("No content in AI response");

  // Parse JSON array from response
  let suggestions: string[];
  try {
    suggestions = JSON.parse(content);
  } catch {
    // If not valid JSON, try to extract array
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      suggestions = JSON.parse(match[0]);
    } else {
      // Fall back to treating the whole response as one suggestion
      suggestions = [content];
    }
  }

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    throw new Error("Invalid AI response format");
  }

  // Ensure exactly 3 suggestions (pad or trim)
  while (suggestions.length < 3) suggestions.push(suggestions[suggestions.length - 1] || "");
  return suggestions.slice(0, 3).map((text, i) => ({ id: i + 1, text: text.trim() }));
}
