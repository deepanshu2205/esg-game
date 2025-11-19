"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/app/components/RequireAuth";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: { session } }, { data: { user } }] = await Promise.all([
          supabase.auth.getSession(),
          supabase.auth.getUser()
        ]);
        setAccessToken(session?.access_token ?? null);
        setUserId(user?.id ?? null);
      } catch (err) {
        console.error("Failed to load auth state", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!accessToken || !userId) return;

    (async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const res = await fetch('/api/leaderboard', { headers });
        const d = await res.json();
        if (res.ok) {
          setEntries(d.entries ?? []);
        } else {
          console.error("Failed to load leaderboard", d.error);
        }

        const sessionRes = await fetch('/api/session/latest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ userId })
        });
        const sessionData = await sessionRes.json();
        if (sessionRes.ok && sessionData?.session?.kpi) {
          const kpi = sessionData.session.kpi;
          const esg = Math.max(0, Math.min(100, Math.round((100 - kpi.carbon) * 0.5 + kpi.reputation * 0.5)));
          setMyScore(esg);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken, userId]);

  async function submitMyScore() {
    if (myScore === null) return alert('No score available');
    if (!accessToken) return alert('No active session. Please refresh.');
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ esgScore: myScore })
      });
      const d = await res.json();
      if (res.ok && d?.ok) {
        alert('Score submitted');
      } else {
        alert(d.error ?? 'Failed to submit score');
      }
    } catch (e) { console.error(e); }
  }

  return (
    <RequireAuth>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        <div className="p-4 bg-white/4 rounded flex-1">
          <div className="text-sm text-white/60">Your current ESG score</div>
          <div className="text-4xl font-bold mt-2">{myScore ?? '—'}</div>
          <div className="mt-2">
            <button onClick={submitMyScore} className="btn btn-primary">Submit Snapshot</button>
          </div>
        </div>
        <div className="flex-1 card">
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
    </RequireAuth>
  );
}
