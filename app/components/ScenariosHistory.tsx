"use client";

import React, { useEffect, useState } from "react";

export default function ScenariosHistory() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/scenarios');
        const d = await res.json();
        setList(d.scenarios ?? []);
      } catch (e) {
        console.error('failed to load scenarios', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading scenarios...</div>;

  return (
    <div className="space-y-3">
      <div className="font-semibold">Your Recent Scenarios</div>
      {list.length === 0 ? (
        <div className="text-sm text-white/60">No scenarios saved yet.</div>
      ) : (
        <div className="space-y-2">
          {list.map((s) => (
            <div key={s.id} className="p-2 bg-white/4 rounded">
              <div className="text-sm font-medium">{s.name}</div>
              <div className="text-xs text-white/60">{new Date(s.created_at).toLocaleString()}</div>
              <pre className="mt-2 text-xs whitespace-pre-wrap">{JSON.stringify(s.result ?? s.input ?? {}, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
