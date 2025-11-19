import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getUserFromRequest } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

type KPI = { carbon: number; profit: number; reputation: number };

const KPI_LIMITS = {
  carbon: { min: 0, max: 1000, maxDelta: 200 },
  profit: { min: -1000000, max: 1000000, maxDelta: 5000 },
  reputation: { min: 0, max: 100, maxDelta: 30 },
};

const DEFAULT_KPI: KPI = { carbon: 100, profit: 1000, reputation: 50 };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value: unknown, fallback: number) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function sanitizeKpi(input: Partial<KPI> | undefined): KPI {
  return {
    carbon: clamp(Math.round(toNumber(input?.carbon, DEFAULT_KPI.carbon)), KPI_LIMITS.carbon.min, KPI_LIMITS.carbon.max),
    profit: clamp(Math.round(toNumber(input?.profit, DEFAULT_KPI.profit)), KPI_LIMITS.profit.min, KPI_LIMITS.profit.max),
    reputation: clamp(Math.round(toNumber(input?.reputation, DEFAULT_KPI.reputation)), KPI_LIMITS.reputation.min, KPI_LIMITS.reputation.max),
  };
}

function deltaWithinLimits(delta: KPI) {
  return (
    Math.abs(delta.carbon) <= KPI_LIMITS.carbon.maxDelta &&
    Math.abs(delta.profit) <= KPI_LIMITS.profit.maxDelta &&
    Math.abs(delta.reputation) <= KPI_LIMITS.reputation.maxDelta
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body?.sessionId;
    const action = body?.action;
    const providedNewKpi: KPI | undefined = body?.newKpi;
    const current = sanitizeKpi(body?.currentKpi ?? DEFAULT_KPI);

    // Compute newKpi and applied delta
    let newKpi: KPI = { ...current };
    let appliedDelta: KPI = { carbon: 0, profit: 0, reputation: 0 };

    if (providedNewKpi) {
      const sanitized = sanitizeKpi(providedNewKpi);
      const candidateDelta: KPI = {
        carbon: sanitized.carbon - current.carbon,
        profit: sanitized.profit - current.profit,
        reputation: sanitized.reputation - current.reputation,
      };
      if (!deltaWithinLimits(candidateDelta)) {
        return NextResponse.json({ error: "Simulation delta out of bounds" }, { status: 400 });
      }
      newKpi = sanitized;
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
      newKpi = sanitizeKpi(newKpi);
    }

    appliedDelta = {
      carbon: newKpi.carbon - current.carbon,
      profit: newKpi.profit - current.profit,
      reputation: newKpi.reputation - current.reputation,
    };

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
