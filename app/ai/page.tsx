"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/app/components/RequireAuth";

export default function AIAdvisor() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAccessToken(session?.access_token ?? null);
      } catch (err) {
        console.error("Failed to load access token", err);
      }
    })();
  }, []);

  async function ask() {
    if (!accessToken) {
      alert("No active session. Please re-authenticate.");
      return;
    }
    setLoading(true);

    const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` };
    const res = await fetch("/api/ai", {
      method: "POST",
      headers,
      body: JSON.stringify({ query })
    });

    const d = await res.json();
    setAnswer(d.response ?? d.error);
    setLoading(false);
  }

  return (
    <RequireAuth>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Synergy Steward Advisor</h1>

      <div className="split-panel">
        <div className="card card-animated">
          <p className="text-white/70 text-sm mb-3">Describe your company context, supplier profile, or action you want to simulate.</p>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={6}
            placeholder="Ask: Top 3 ESG risks for a textile SME in India"
          ></textarea>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              disabled={loading || !accessToken}
              onClick={ask}
              className="btn btn-primary"
            >
              {loading ? "Thinking..." : accessToken ? "Ask advisor" : "Loading session..."}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setAnswer(null); setQuery(""); }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="card card-animated min-h-[200px]">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Response</p>
          <div className="mt-3 max-h-[360px] overflow-auto text-sm leading-relaxed">
            {answer ? (
              <pre className="whitespace-pre-wrap">{answer}</pre>
            ) : (
              <span className="text-white/60">AI output will appear here once you submit a prompt.</span>
            )}
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
