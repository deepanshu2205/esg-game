"use client";

import React, { useMemo, useState } from "react";
import Confetti from "./Confetti";

type Source = { id: string; name: string; emission: number };
type Upgrade = { id: string; name: string; reduce: number };

const SOURCES: Source[] = [
  { id: "s1", name: "Boiler", emission: 40 },
  { id: "s2", name: "Generator", emission: 30 },
  { id: "s3", name: "Furnace", emission: 50 },
];

const UPGRADES: Upgrade[] = [
  { id: "u1", name: "HE Boiler", reduce: 15 },
  { id: "u2", name: "Cleaner Fuel", reduce: 10 },
  { id: "u3", name: "Insulation", reduce: 8 },
];

export default function EmissionsDragDrop({ onWin }: { onWin?: () => void }) {
  const sources = useMemo(() => SOURCES.map((s) => ({ ...s })), []);
  const upgrades = useMemo(() => UPGRADES.map((u) => ({ ...u })), []);

  const [applied, setApplied] = useState<Record<string, string[]>>(() => ({}));
  const [showConfetti, setShowConfetti] = useState(false);

  function onDragStart(e: React.DragEvent, upgradeId: string) {
    e.dataTransfer.setData("text/plain", upgradeId);
  }

  function onDrop(e: React.DragEvent, sourceId: string) {
    const upId = e.dataTransfer.getData("text/plain");
    if (!upId) return;
    setApplied((a) => {
      const arr = a[sourceId] ? [...a[sourceId]] : [];
      // prevent duplicate application of same upgrade to the same source
      if (!arr.includes(upId)) arr.push(upId);
      return { ...a, [sourceId]: arr };
    });
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  function computeTotal() {
    let total = 0;
    for (const s of sources) {
      const ups = applied[s.id] ?? [];
      let reduction = 0;
      for (const uid of ups) {
        const u = upgrades.find((x) => x.id === uid);
        if (u) reduction += u.reduce;
      }
      total += Math.max(0, s.emission - reduction);
    }
    return total;
  }

  function check() {
    const total = computeTotal();
    // success if total emissions reduced below threshold (e.g., 60)
    if (total <= 60) {
      setShowConfetti(true);
      onWin?.();
      setTimeout(() => setShowConfetti(false), 3500);
      alert(`Great job! Total emissions: ${total} tCO2e — you win!`);
    } else {
      alert(`Total emissions: ${total} tCO2e — keep optimizing.`);
    }
  }

  return (
    <div className="space-y-4">
      <Confetti show={showConfetti} />
      <div className="font-semibold">Emissions Optimization</div>
      <div className="text-sm text-white/60">Drag upgrades onto emission sources to reduce their emissions.</div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 font-medium">Available Upgrades</div>
          <div className="space-y-2">
            {upgrades.map((u) => (
              <div key={u.id} draggable onDragStart={(e) => onDragStart(e, u.id)} className="p-2 bg-white/6 rounded cursor-grab">{u.name} (-{u.reduce})</div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 font-medium">Sources</div>
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} onDragOver={allowDrop} onDrop={(e) => onDrop(e, s.id)} className="p-3 bg-white/3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-white/60">Base: {s.emission} tCO2e</div>
                  </div>
                  <div className="text-sm">Applied: {(applied[s.id] ?? []).length}</div>
                </div>
                <div className="mt-2 text-xs">
                  {(applied[s.id] ?? []).map((uid) => {
                    const u = upgrades.find((x) => x.id === uid);
                    return <div key={uid} className="inline-block bg-white/6 px-2 py-0.5 rounded mr-2 text-xs">{u?.name}</div>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <button onClick={check} className="bg-green-500 px-4 py-2 rounded">Check Optimization</button>
      </div>
    </div>
  );
}
