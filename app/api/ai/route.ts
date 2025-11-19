import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { v4 as uuidv4 } from "uuid";
import { getUserFromRequest } from "@/lib/auth";

function summarizeForLog(text: string, max = 200) {
  if (!text) return "[empty]";
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}… (truncated ${normalized.length - max} chars)`;
}

export async function POST(req: Request) {
  try {
    let user: any = null;
    try {
      ({ user } = await getUserFromRequest(req));
    } catch (authErr: any) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body?.action ?? "analyze"; // analyze | simulate | vet_supplier
    const query = body?.query ?? body?.prompt ?? "";

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI key not configured on server" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let prompt = "";
    if (action === "analyze") {
      prompt = `You are an expert ESG advisor. Given the following company context, list the top 3-5 material ESG risks or opportunities, prioritized, in short bullets (max 120 words). Context: ${query}`;
    } else if (action === "simulate") {
      // Instruct model to respond with JSON only for deterministic parsing
      // Provide explicit JSON schema and require output of only the JSON object with no commentary.
      prompt = `You are an ESG scenario simulator. Given the company's KPI baseline and a proposed action, estimate the 5-year impact on carbon, profit, and reputation.
Return ONLY a single JSON object and nothing else, no markdown, no commentary. The JSON must contain these keys:
  - carbon_delta: number
  - profit_delta: number
  - reputation_delta: number
  - explanation: string
If a value is uncertain, provide your best numeric estimate. Input: ${query}`;
    } else if (action === "vet_supplier") {
      prompt = `You are an ESG supplier vetting tool. Assess the supplier profile and return a risk score 0-100 (higher is worse) and 2-3 bullet reasons. Supplier info: ${query}`;
    } else {
      prompt = `You are an ESG assistant. ${query}`;
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const text = response.output_text ?? JSON.stringify(response);

    // If this was a simulate action, try to parse the JSON and return structured data.
    if (action === "simulate") {
      // First, attempt direct parse
      try {
        const parsed = JSON.parse(text.trim());
        return NextResponse.json({ action, simulation: parsed, raw: text });
      } catch (parseErr) {
        // fallback: try to extract JSON substring between first { and last }
        try {
          const start = text.indexOf("{");
          const end = text.lastIndexOf("}");
          if (start !== -1 && end !== -1 && end > start) {
            const sub = text.slice(start, end + 1);
            const parsed2 = JSON.parse(sub);
            return NextResponse.json({ action, simulation: parsed2, raw: text });
          }
        } catch (e) {
          console.error("simulate fallback parse error:", e);
        }
        // final fallback: return raw text for UI to show
        console.error("simulate parse final failure");
        return NextResponse.json({ action, simulation: null, raw: text });
      }
    }

    // Log query + response summary to DB when possible (authenticated users only).
    try {
      const userId = user?.id ?? (user as any)?.user?.id ?? null;
      if (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY && userId) {
        await supabaseAdmin
          .from("ai_logs")
          .insert([
            {
              id: uuidv4(),
              user_id: userId,
              prompt: summarizeForLog(prompt),
              response: summarizeForLog(text),
            },
          ]);
      }
    } catch (dbErr) {
      console.error("ai log error:", dbErr);
    }

    return NextResponse.json({ response: text, action });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
