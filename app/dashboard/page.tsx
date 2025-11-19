"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ESGMeter from "@/app/components/ESGMeter";
import KPIBars from "@/app/components/KPIBars";
import ModuleTabs from "@/app/components/ModuleTabs";
import NextChallenge from "@/app/components/NextChallenge";
import AvatarBadges from "@/app/components/AvatarBadges";
import Confetti from "@/app/components/Confetti";

type KPI = { carbon: number; profit: number; reputation: number };

import RequireAuth from "@/app/components/RequireAuth";

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KPI>({ carbon: 100, profit: 1000, reputation: 50 });
  const [loading, setLoading] = useState(false);

  // Compute a simple ESG score (0-100) as inverse of carbon, plus reputation
  const esgScore = Math.max(0, Math.min(100, Math.round((100 - kpi.carbon) * 0.5 + kpi.reputation * 0.5)));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userRes = await supabase.auth.getUser();
        const user = userRes.data.user;
        if (!user) return;

        const accessToken = session?.access_token;

        const res = await fetch("/api/session/latest", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
          body: JSON.stringify({ userId: user.id })
        });

        const d = await res.json();
        if (d?.session?.kpi) {
          setKpi(d.session.kpi);
        }
      } catch (err) {
        console.error("failed to load latest session", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // award badges when esgScore crosses thresholds
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastAward, setLastAward] = useState<number>(0);
  useEffect(() => {
    (async () => {
      try {
        if (esgScore >= 80 && lastAward < 80) {
          setShowConfetti(true);
          // award badge id 'net_zero_hero'
          await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badgeId: 'net_zero_hero' }) });
          setLastAward(80);
          setTimeout(() => setShowConfetti(false), 3500);
        }
        if (esgScore >= 90 && lastAward < 90) {
          setShowConfetti(true);
          await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badgeId: 'ethics_enforcer' }) });
          setLastAward(90);
          setTimeout(() => setShowConfetti(false), 3500);
        }
      } catch (e) {
        console.error('award badge failed', e);
      }
    })();
  }, [esgScore]);

  return (
    <RequireAuth>
    <div className="space-y-6">
      <Confetti show={showConfetti} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Mission control</p>
          <h1 className="text-3xl font-bold mt-1">ESG performance dashboard</h1>
          <p className="text-white/70 mt-2">Monitor KPIs, jump into simulations, and unlock badges across the ESG pillars.</p>
        </div>
        <AvatarBadges />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card card-animated p-4">
          <div className="card-header text-white/60">ESG Meter</div>
          <div className="mt-3">
            <ESGMeter score={esgScore} />
          </div>
        </div>

        <div className="card card-animated p-4 md:col-span-1">
          <div className="card-header text-white/60">KPIs</div>
          <div className="mt-3">
            <KPIBars carbon={kpi.carbon} profit={kpi.profit} reputation={kpi.reputation} />
          </div>
        </div>

        <div className="card card-animated p-4">
          <div className="card-header text-white/60">Next Challenge</div>
          <div className="mt-3">
            <NextChallenge progress={45} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="card card-animated p-4">
            <div className="card-header text-white/60">Modules</div>
            <div className="mt-3">
              <ModuleTabs />
            </div>
          </div>
        </div>

        <div>
          <div className="card card-animated p-4">
            <div className="card-header text-white/60">Quick Actions</div>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/ai" className="btn btn-primary text-center">Ask AI Advisor</Link>
              <Link href="/game" className="btn btn-ghost text-center">Resume Game Session</Link>
              <Link href="/leaderboard" className="btn btn-ghost text-center">View Leaderboard</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
