"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ScenariosHistory() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAccessToken(session?.access_token ?? null);
      } catch (err) {
        console.error("Failed to load auth state", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/scenarios', { headers: { Authorization: `Bearer ${accessToken}` } });
        const d = await res.json();
        if (res.ok) {
          setList(d.scenarios ?? []);
        } else {
          console.error('failed to load scenarios', d.error);
        }
      } catch (e) {
        console.error('failed to load scenarios', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  if (loading) return <div className="card">Loading scenarios...</div>;

  return (
    <div className="card card-animated space-y-3">
      <div className="font-semibold text-lg">Your Recent Scenarios</div>
      {list.length === 0 ? (
        <div className="text-sm text-white/60">No scenarios saved yet.</div>
      ) : (
        <div className="space-y-2">
          {list.map((s) => (
            <div key={s.id} className="p-3 bg-white/3 rounded-lg border border-white/5">
              <div className="flex justify-between items-center gap-3">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-white/60">{new Date(s.created_at).toLocaleString()}</div>
              </div>
              <pre className="mt-2 text-xs whitespace-pre-wrap bg-black/30 rounded-lg p-2 border border-white/5">{JSON.stringify(s.result ?? s.input ?? {}, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
