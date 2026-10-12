import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const COST = 1;
const MODEL = "openai/gpt-6-astra";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["fit", "edits"],
  properties: {
    fit: { type: "string" },
    edits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["field", "entryId", "suggested", "reason"],
        properties: {
          field: { type: "string", enum: ["objective", "skills", "description", "highlights"] },
          entryId: { type: "string" },
          suggested: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
};

const INSTRUCTIONS = `You are a CV coach for Vietnamese fresh graduates. Given a job description and the candidate's CV (JSON), propose concrete edits that make the CV fit the job better.
Rules:
- Only rephrase, reorder or emphasize what is already in the CV. Never invent experience, numbers, employers or skills the candidate does not show.
- field "objective": rewrite the career objective (entryId ""). Max 500 characters.
- field "skills": full comma-separated skills list, reordered to put job-relevant skills first; you may add only skills clearly evidenced in the CV (entryId "").
- field "description" or "highlights": rewrite one experience entry; entryId must be that entry's id. Highlights are newline-separated bullets without bullet symbols.
- Give 2 to 6 of the most valuable edits. "reason" is one short sentence linking the edit to the job.
- "fit" is 1-2 sentences on how well the CV matches and what is missing.
- Write in the same language as the CV (usually Vietnamese).`;

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
    let parsed: { fit: string; edits: { field: string; entryId: string; suggested: string; reason: string }[] };
    try { parsed = JSON.parse(text); } catch { failed = true; parsed = { fit: "", edits: [] }; }
    const edits = (parsed.edits ?? []).filter((e) => e && typeof e.suggested === "string" && e.suggested.trim()).slice(0, 8);
    if (failed || !edits.length) {
      await refund();
      console.error("AI empty/failed", text.slice(0, 500));
      return json({ error: "ai_failed" }, 502);
    }
    return json({ fit: parsed.fit ?? "", edits, balance });
  } catch (e) {
    console.error(e);
    await refund();
    return json({ error: "server_error" }, 500);
  }
});
