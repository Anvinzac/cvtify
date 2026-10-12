import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const COST = 1;
const PROMPTS: Record<string, string> = {
  summary: "Write a compelling 1-2 sentence summary for a CV chapter that highlights the key achievement or takeaway for employers.",
  duties: "Write a professional description of responsibilities and what was accomplished in this role.",
  highlights: "Write 3 bullet points highlighting key results and achievements. Each bullet should be concise and impactful.",
  learning: "Write a reflective insight about what was learned or discovered during this experience.",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "sign_in_required" }, 401);

    const { context, notes, role, organization } = await req.json();
    if (!PROMPTS[context] || typeof notes !== "string" || !notes.trim() || notes.length > 4000) {
      return json({ error: "invalid_input" }, 400);
    }

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: balance, error: spendErr } = await admin.rpc("spend_credits", { _user: user.id, _amount: COST, _feature: `ai-${context}` });
    if (spendErr) throw spendErr;
    if (balance === -1) return json({ error: "out_of_credits" }, 402);

    const info = [role && `Role: ${role}`, organization && `Organization: ${organization}`].filter(Boolean).join("\n");
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: PROMPTS[context] + " Reply in the same language as the notes." },
          { role: "user", content: `${info ? info + "\n\n" : ""}Rough notes: ${notes}\n\nGenerate exactly 3 different professional versions. Return ONLY a JSON array of 3 strings.` },
        ],
      }),
    });
    if (!resp.ok) {
      await admin.rpc("refund_credits", { _user: user.id, _amount: COST });
      const body = await resp.text();
      console.error("AI gateway error", resp.status, body);
      return json({ error: resp.status === 429 ? "rate_limited" : "ai_failed", status: resp.status }, resp.status === 429 ? 429 : 502);
    }
    const data = await resp.json();
    const content: string = data.choices?.[0]?.message?.content?.trim() ?? "";
    let list: string[] = [];
    try { list = JSON.parse(content.match(/\[[\s\S]*\]/)?.[0] ?? content); } catch { list = [content]; }
    list = list.filter((s) => typeof s === "string" && s.trim()).slice(0, 3);
    if (!list.length) {
      await admin.rpc("refund_credits", { _user: user.id, _amount: COST });
      return json({ error: "ai_failed" }, 502);
    }
    return json({ suggestions: list, balance });
  } catch (e) {
    console.error(e);
    return json({ error: "server_error" }, 500);
  }
});
