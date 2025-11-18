import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

type KPI = { carbon: number; profit: number; reputation: number };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body?.sessionId;
    const action = body?.action;
    const providedNewKpi: KPI | undefined = body?.newKpi;
    const current = body?.currentKpi ?? { carbon: 100, profit: 1000, reputation: 50 };

    // Compute newKpi and applied delta
    let newKpi: KPI = { ...current };
    let appliedDelta: KPI = { carbon: 0, profit: 0, reputation: 0 };

    if (providedNewKpi) {
      newKpi = providedNewKpi;
      appliedDelta = {
        carbon: newKpi.carbon - current.carbon,
        profit: newKpi.profit - current.profit,
        reputation: newKpi.reputation - current.reputation,
      };
    } else {
      // Simple deterministic stub logic for demo purposes
      if (action === "upgrade machine") {
        newKpi.carbon = Math.max(0, newKpi.carbon - 20);
        newKpi.profit = newKpi.profit - 200;
        newKpi.reputation = Math.min(100, newKpi.reputation + 5);
      } else if (action === "train staff") {
        newKpi.reputation = Math.min(100, newKpi.reputation + 10);
        newKpi.profit = newKpi.profit - 100;
      } else if (action === "waste sorting") {
        newKpi.carbon = Math.max(0, newKpi.carbon - 10);
        newKpi.reputation = Math.min(100, newKpi.reputation + 3);
      }
      appliedDelta = {
        carbon: newKpi.carbon - current.carbon,
        profit: newKpi.profit - current.profit,
        reputation: newKpi.reputation - current.reputation,
      };
    }

    // Validate caller and ensure they own the session (if session exists)
    try {
      const { user } = await getUserFromRequest(req);
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && sessionId) {
        try {
          const { data: sessions } = await supabaseAdmin.from("sessions").select("user_id").eq("id", sessionId).limit(1);
          const ownerId = Array.isArray(sessions) && sessions.length > 0 ? (sessions[0] as any).user_id : null;
          if (ownerId && ownerId !== (user as any).id) {
            return NextResponse.json({ error: "Not authorized for this session" }, { status: 403 });
          }
        } catch (dbErr) {
          console.error("session lookup error:", dbErr);
        }

        await supabaseAdmin.from("sessions").update({ kpi: newKpi, updated_at: new Date() }).eq("id", sessionId);
      }
      // record a lightweight transaction/audit
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const tx: any = {
          id: uuidv4(),
          session_id: sessionId || null,
          user_id: (user as any)?.id || null,
          action: action || "apply_simulation",
          delta: appliedDelta,
          created_at: new Date().toISOString(),
        };
        try {
          await supabaseAdmin.from("transactions").insert(tx);
        } catch (txErr) {
          console.error("transaction insert error:", txErr);
        }
      }
    } catch (authErr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ newKpi });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
