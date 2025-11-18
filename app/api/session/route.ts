import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = body?.userId ?? null;
    const kpi = body?.kpi ?? { carbon: 100, profit: 1000, reputation: 50 };

    // If a userId is provided, validate caller and ensure token user matches the provided userId.
    // If no userId is provided, allow creating an anonymous session (guest play).
    if (userId) {
      try {
        const { user } = await getUserFromRequest(req);
        if ((user as any).id !== userId) {
          return NextResponse.json({ error: "Token does not match user" }, { status: 403 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const sessionId = uuidv4();

    // If server supabase is configured, persist session
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabaseAdmin.from("sessions").insert([{ id: sessionId, user_id: userId, kpi }]);
      }
    } catch (dbErr) {
      // swallow DB errors so devs without a service role key can still use stubs
      console.error("session persist error:", dbErr);
    }

    return NextResponse.json({ sessionId, kpi });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
