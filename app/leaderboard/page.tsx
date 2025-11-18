"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myScore, setMyScore] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/leaderboard');
        const d = await res.json();
        setEntries(d.entries ?? []);

        // compute my current ESG score from latest session
        const { data: { session } } = await supabase.auth.getSession();
        const userRes = await supabase.auth.getUser();
        const user = userRes.data.user;
        if (session && user) {
          const accessToken = session?.access_token;
          const r = await fetch('/api/session/latest', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify({ userId: user.id }) });
          const dd = await r.json();
          if (dd?.session?.kpi) {
            const kpi = dd.session.kpi;
            const esg = Math.max(0, Math.min(100, Math.round((100 - kpi.carbon) * 0.5 + kpi.reputation * 0.5)));
            setMyScore(esg);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function submitMyScore() {
    if (myScore === null) return alert('No score available');
    try {
      const res = await fetch('/api/leaderboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ esgScore: myScore }) });
      const d = await res.json();
      if (d?.ok) alert('Score submitted');
    } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/4 rounded">
          <div className="text-sm text-white/60">Your current ESG score</div>
          <div className="text-xl font-bold">{myScore ?? '—'}</div>
          <div className="mt-2">
            <button onClick={submitMyScore} className="bg-yellow-400 px-4 py-2 rounded">Submit Snapshot</button>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold">Top Players</div>
          <div className="mt-2 space-y-2">
            {entries.map((e, i) => (
              <div key={e.id} className="p-2 bg-white/4 rounded flex justify-between">
                <div>{e.user_id}</div>
                <div>{e.esg_score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
