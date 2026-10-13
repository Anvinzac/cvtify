import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AISuggestion { id: number; text: string; }
type SuggestionContext = "summary" | "duties" | "highlights" | "learning" | "skills";

export const AI_COST = 1;

const ERRORS: Record<string, string> = {
  sign_in_required: "Vui lòng đăng nhập để dùng AI.",
  out_of_credits: "Bạn đã hết credit.",
  rate_limited: "AI đang bận, thử lại sau ít phút. Credit chưa bị trừ.",
  ai_failed: "AI không trả lời được. Credit đã được hoàn lại.",
};

/** Generates 3 versions via the backend; each call spends AI_COST credit. */
export async function generateSuggestions(
  context: SuggestionContext, notes: string, role?: string, organization?: string,
): Promise<{ suggestions: AISuggestion[]; balance: number }> {
  const { data, error } = await supabase.functions.invoke("ai-suggest", { body: { context, notes, role, organization } });
  if (error) {
    let code = "";
    if (error instanceof FunctionsHttpError) { try { code = (await error.context.json()).error; } catch { /* ignore */ } }
    throw new Error(ERRORS[code] ?? "Không tạo được gợi ý. Vui lòng thử lại.");
  }
  return {
    suggestions: (data.suggestions as string[]).map((text, i) => ({ id: i + 1, text: text.trim() })),
    balance: data.balance,
  };
}
