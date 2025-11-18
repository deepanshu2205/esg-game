"use client";

import React from "react";

export default function KPIBars({ carbon, profit, reputation }: { carbon: number; profit: number; reputation: number }) {
  const norm = (v: number, invert = false) => {
    if (invert) return Math.max(0, Math.min(100, 100 - v));
    return Math.max(0, Math.min(100, v));
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm text-white/60">Carbon</div>
        <div className="h-3 bg-white/6 rounded overflow-hidden mt-1">
          <div style={{ width: `${norm(carbon, true)}%` }} className="h-3 bg-green-500" />
        </div>
        <div className="text-xs text-white/50 mt-1">{carbon} tCO2e</div>
      </div>

      <div>
        <div className="text-sm text-white/60">Profit</div>
        <div className="h-3 bg-white/6 rounded overflow-hidden mt-1">
          <div style={{ width: `${norm(Math.min(100, Math.round(profit / 1000)))}%` }} className="h-3 bg-yellow-400" />
        </div>
        <div className="text-xs text-white/50 mt-1">₹{profit}</div>
      </div>

      <div>
        <div className="text-sm text-white/60">Reputation</div>
        <div className="h-3 bg-white/6 rounded overflow-hidden mt-1">
          <div style={{ width: `${norm(reputation)}%` }} className="h-3 bg-blue-400" />
        </div>
        <div className="text-xs text-white/50 mt-1">{reputation}%</div>
      </div>
    </div>
  );
}
