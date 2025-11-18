import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const { data } = await supabaseAdmin.from("leaderboard_entries").select("*").order("esg_score", { ascending: false }).limit(20);
    return NextResponse.json({ entries: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // submit or snapshot a user's score
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const esg = body?.esgScore;
    if (esg === undefined) return NextResponse.json({ error: "esgScore required" }, { status: 400 });

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server not configured to persist leaderboard" }, { status: 500 });
    }

    const id = uuidv4();
    await supabaseAdmin.from("leaderboard_entries").insert([{ id, user_id: (user as any).id, esg_score: esg }]);
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
