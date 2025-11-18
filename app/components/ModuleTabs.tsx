"use client";

import React, { useState } from "react";
import WasteSorter from "./WasteSorter";
import EmissionsDragDrop from "./EmissionsDragDrop";
import SocialQuiz from "./SocialQuiz";

export default function ModuleTabs() {
  const [tab, setTab] = useState<"E" | "S" | "G">("E");

  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => setTab("E")} className={`px-3 py-1 rounded ${tab === "E" ? "bg-green-600" : "bg-white/6"}`}>Environment</button>
        <button onClick={() => setTab("S")} className={`px-3 py-1 rounded ${tab === "S" ? "bg-orange-500" : "bg-white/6"}`}>Social</button>
        <button onClick={() => setTab("G")} className={`px-3 py-1 rounded ${tab === "G" ? "bg-blue-500" : "bg-white/6"}`}>Governance</button>
      </div>

      <div className="mt-4 p-4 bg-white/3 rounded">
        {tab === "E" && (
          <div>
            <div className="font-semibold">Environmental Module</div>
            <div className="text-sm text-white/60">Mini-games: emissions, waste sorting, renewable investment</div>
            <div className="mt-4 space-y-6">
              <WasteSorter onWin={async () => {
                try {
                  await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badgeId: 'waste_sorter_master' }) });
                } catch (e) { console.error('badge award failed', e); }
              }} />

              <EmissionsDragDrop onWin={async () => {
                try {
                  await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badgeId: 'emissions_optimizer' }) });
                } catch (e) { console.error('badge award failed', e); }
              }} />
            </div>
          </div>
        )}
        {tab === "S" && (
          <div>
            <div className="font-semibold">Social Module</div>
            <div className="text-sm text-white/60">Scenarios: safety quiz, fair wage decisions, CSR planning</div>
            <div className="mt-4">
              <SocialQuiz />
            </div>
          </div>
        )}
        {tab === "G" && (
          <div>
            <div className="font-semibold">Governance Module</div>
            <div className="text-sm text-white/60">Sim challenges: board meetings, audits, tender transparency (placeholders)</div>
          </div>
        )}
      </div>
    </div>
  );
}
