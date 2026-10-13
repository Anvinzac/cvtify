import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const COST = 1;
const MODEL = "openai/gpt-6-astra";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["fit", "score", "requirements", "edits"],
  properties: {
    fit: { type: "string" },
    score: { type: "integer" },
    requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requirement", "kind", "status", "evidence"],
        properties: {
          requirement: { type: "string" },
          kind: { type: "string", enum: ["skill", "experience"] },
          status: { type: "string", enum: ["matched", "partial", "missing"] },
          evidence: { type: "string" },
        },
      },
    },
    edits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["field", "entryId", "action", "find", "replace", "requirement", "reason"],
        properties: {
          field: { type: "string", enum: ["objective", "skills", "description", "highlights"] },
          entryId: { type: "string" },
          action: { type: "string", enum: ["replace", "add_line", "add_skill"] },
          find: { type: "string" },
          replace: { type: "string" },
          requirement: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
};

const INSTRUCTIONS = `You are a recruiter screening a Vietnamese fresh graduate's CV (JSON) against a real job description.
Step 1 - Extract the 4 to 8 most important requirements from the job description (hard skills, tools, soft skills, types of experience). For each, find evidence in the CV:
- "matched": clearly shown; "partial": related or implied but not stated in the job's terms; "missing": no evidence.
- "evidence": quote the exact short phrase from the CV and the entry it came from, or "" if missing.
Step 2 - Propose 2 to 6 SMALL, targeted edits that close "partial" gaps by surfacing existing evidence in the job's vocabulary. Do NOT rewrite whole sections.
- action "replace": "find" must be an exact substring copied from the current field text (a phrase or one line, as short as possible); "replace" is its improved version.
- action "add_line": add one new bullet to an entry's "highlights" only when the entry's description already supports it; "find" is "".
- action "add_skill": add one skill to "skills" only if the CV shows evidence of it; "find" is "", "replace" is the skill name.
- entryId is the entry's id for description/highlights, otherwise "".
- Never invent experience, employers, numbers or skills. Missing requirements get no edit; mention them in "fit" as things to learn or gain.
- "requirement" names the requirement the edit targets; "reason" is one short sentence.
"score" is 0-100 overall match. "fit" is 1-2 sentences. Write in the CV's language (usually Vietnamese).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let userId: string | null = null;
  let spent = false;
  const refund = async () => { if (spent && userId) { spent = false; await admin.rpc("refund_credits", { _user: userId, _amount: COST }); } };
  try {
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "sign_in_required" }, 401);
    userId = user.id;

    const { jobDescription, cv } = await req.json();
    if (typeof jobDescription !== "string" || jobDescription.trim().length < 30 || jobDescription.length > 8000 || !cv || typeof cv !== "object") {
      return json({ error: "invalid_input" }, 400);
    }
    const cvText = JSON.stringify(cv);
    if (cvText.length > 30000) return json({ error: "invalid_input" }, 400);

    const { data: balance, error: spendErr } = await admin.rpc("spend_credits", { _user: user.id, _amount: COST, _feature: "ai-cv-tailor" });
    if (spendErr) throw spendErr;
    if (balance === -1) return json({ error: "out_of_credits" }, 402);
    spent = true;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Lovable-API-Key": Deno.env.get("LOVABLE_API_KEY")!,
        "X-Lovable-AIG-SDK": "fetch",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: INSTRUCTIONS,
        input: [{ role: "user", content: `JOB DESCRIPTION:\n${jobDescription}\n\nCV (JSON):\n${cvText}` }],
        text: { format: { type: "json_schema", name: "cv_edits", strict: true, schema: SCHEMA } },
      }),
    });
    if (!resp.ok || !resp.body) {
      await refund();
      const body = await resp.text();
      console.error("AI gateway error", resp.status, body);
      const code = resp.status === 429 ? "rate_limited" : resp.status === 402 || resp.status === 403 ? "ai_unavailable" : "ai_failed";
      return json({ error: code }, resp.status === 429 ? 429 : 502);
    }

    // Consume the SSE stream and collect the output text.
    const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "", text = "", failed = false;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "response.failed" || ev.type === "error") failed = true;
        } catch { /* ignore partial */ }
      }
    }
    let parsed: { fit: string; score: number; requirements: unknown[]; edits: { action: string; replace: string }[] };
    try { parsed = JSON.parse(text); } catch { failed = true; parsed = { fit: "", score: 0, requirements: [], edits: [] }; }
    const edits = (parsed.edits ?? []).filter((e) => e && typeof e.replace === "string" && e.replace.trim()).slice(0, 8);
    const requirements = (parsed.requirements ?? []).slice(0, 10);
    if (failed || !requirements.length) {
      await refund();
      console.error("AI empty/failed", text.slice(0, 500));
      return json({ error: "ai_failed" }, 502);
    }
    return json({ fit: parsed.fit ?? "", score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))), requirements, edits, balance });
  } catch (e) {
    console.error(e);
    await refund();
    return json({ error: "server_error" }, 500);
  }
});
