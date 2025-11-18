"use client";

import React from "react";

export default function ESGMeter({ score }: { score: number }) {
  const safe = Math.max(0, Math.min(100, score));
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-sm text-white/60">ESG Score</div>
      <div className="text-5xl font-extrabold mt-1">{safe}</div>
      <div className="w-48 mt-3">
        <div className="h-4 bg-white/6 rounded overflow-hidden">
          <div className={`h-4 rounded`} style={{ width: `${safe}%`, background: `linear-gradient(90deg,#16a34a, #06b6d4)` }} />
        </div>
      </div>
      <div className="text-xs text-white/50 mt-2">Overall performance (0-100)</div>
    </div>
  );
}
