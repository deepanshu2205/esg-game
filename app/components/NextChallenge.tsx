"use client";

import React from "react";

export default function NextChallenge({ progress = 40 }: { progress?: number }) {
  const p = Math.max(0, Math.min(100, progress));
  return (
    <div className="p-4 bg-white/3 rounded">
      <div className="text-sm text-white/60">Current Quarter</div>
      <div className="flex items-center justify-between mt-2">
        <div>
          <div className="font-semibold">Next Challenge: Reduce emissions by 10%</div>
          <div className="text-xs text-white/50">Choose an action to improve your ESG performance this quarter.</div>
        </div>
        <div className="w-36">
          <div className="h-3 bg-white/6 rounded overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-green-400 to-blue-400" style={{ width: `${p}%` }} />
          </div>
          <div className="text-xs text-white/50 mt-1">Progress: {p}%</div>
        </div>
      </div>
    </div>
  );
}
