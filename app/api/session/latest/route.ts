import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    try {
      const { user } = await getUserFromRequest(req);
      if ((user as any).id !== userId) {
        return NextResponse.json({ error: "Token does not match user" }, { status: 403 });
      }

      const { data, error } = await supabaseAdmin
        .from("sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("supabase fetch latest session error:", error);
        return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 });
      }

      const session = Array.isArray(data) && data.length > 0 ? data[0] : null;
      return NextResponse.json({ session });
    } catch (err: any) {
      console.error("db/auth error:", err);
      return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
