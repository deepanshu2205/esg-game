import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const name = body?.name ?? "scenario";
    const input = body?.input ?? null;
    const result = body?.result ?? null;

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server not configured to persist scenarios" }, { status: 500 });
    }

    const id = uuidv4();
    await supabaseAdmin.from("scenarios").insert([{ id, user_id: (user as any).id, name, input, result }]);
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // list latest scenarios for current user
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }
    const { data } = await supabaseAdmin.from("scenarios").select("*").eq("user_id", (user as any).id).order("created_at", { ascending: false }).limit(20);
    return NextResponse.json({ scenarios: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
