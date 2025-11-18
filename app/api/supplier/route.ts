import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { v4 as uuidv4 } from "uuid";
import { getOptionalUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supplier = body?.supplier ?? {};
    const supplierInfo = JSON.stringify(supplier);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI key not configured on server" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an ESG auditor. Given this supplier profile, provide a risk score (0-100, higher is worse) and 2 short reasons for the score. Supplier: ${supplierInfo}`;

    const response = await openai.responses.create({ model: "gpt-4o-mini", input: prompt });
    const text = response.output_text ?? JSON.stringify(response);

    // try to extract a numeric score from the assistant output; naive fallback
    let score = null;
    const m = text.match(/(\d{1,3})/);
    if (m) score = Number(m[1]);

    const supplierId = uuidv4();
    try {
      if (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY) {
        const opt = await getOptionalUserFromRequest(req);
        const userId = opt?.user?.id ?? null;
        await supabaseAdmin.from("suppliers").insert([{ id: supplierId, name: supplier.name ?? null, country: supplier.country ?? null, metadata: supplier, last_risk_score: score, last_vetted_at: new Date() }]);
        // Optionally link an audit record
        if (userId) {
          await supabaseAdmin.from("audits").insert([{ id: uuidv4(), session_id: null, user_id: userId, findings: { supplierId, score }, score: score }]);
        }
      }
    } catch (dbErr) {
      console.error("supplier persist error:", dbErr);
    }

    return NextResponse.json({ supplierId, score, result: text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
