"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/app/components/RequireAuth";

export default function AIAdvisor() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    // get current logged in user (if any)
    const { data: { user } } = await supabase.auth.getUser();

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, query })
    });

    const d = await res.json();
    setAnswer(d.response ?? d.error);
    setLoading(false);
  }

  return (
    <RequireAuth>
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Synergy Steward Advisor</h1>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 bg-white/6 rounded"
        rows={5}
        placeholder="Ask: Top 3 ESG risks for a textile SME in India"
      ></textarea>

      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={ask}
          className="bg-yellow-400 text-black px-4 py-2 rounded"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      <div className="card min-h-[120px]">
        {answer ? (
          <pre className="whitespace-pre-wrap">{answer}</pre>
        ) : (
          <span className="text-white/60">AI response will appear here…</span>
        )}
      </div>
    </div>
    </RequireAuth>
  );
}
