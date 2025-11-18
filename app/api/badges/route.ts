import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  // list available badges
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const { data } = await supabaseAdmin.from("badges").select("*");
    return NextResponse.json({ badges: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // award a badge to the authenticated user
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const badgeId = body?.badgeId;
    if (!badgeId) return NextResponse.json({ error: "badgeId required" }, { status: 400 });

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server not configured to persist badges" }, { status: 500 });
    }

    // avoid duplicate awards: check if user already has this badge
    try {
      const { data: existing } = await supabaseAdmin.from("user_badges").select("id").eq("user_id", (user as any).id).eq("badge_id", badgeId).limit(1);
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json({ ok: true, id: existing[0].id, note: "already_awarded" });
      }
    } catch (qErr) {
      console.error("user_badges lookup error:", qErr);
    }

    const id = uuidv4();
    await supabaseAdmin.from("user_badges").insert([{ id, user_id: (user as any).id, badge_id: badgeId }]);
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
