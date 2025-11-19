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
    e.preventDefault();
    const upId = e.dataTransfer.getData("text/plain");
    if (!upId) return;
    setApplied((a) => {
      const arr = a[sourceId] ? [...a[sourceId]] : [];
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
    if (total <= 60) {
      setShowConfetti(true);
      onWin?.();
      setTimeout(() => setShowConfetti(false), 3500);
      alert(`Great job! Total emissions: ${total} tCO₂e — you win!`);
    } else {
      alert(`Total emissions: ${total} tCO₂e — keep optimizing.`);
    }
  }

  const totalEmissions = computeTotal();

  return (
    <div className="mini-game-card card-animated">
      <Confetti show={showConfetti} />
      <div className="mini-game-header">
        <div>
          <p className="mini-game-label">Mini-game</p>
          <h4 className="mini-game-title">Emissions Optimizer</h4>
        </div>
        <span className="score-chip">Target: ≤ 60 tCO₂e</span>
      </div>
      <p className="mini-game-copy">
        Drag efficiency upgrades onto each source to drop the combined footprint below 60 tCO₂e.
      </p>

      <div className="mini-game-layout">
        <div className="mini-game-sidecard">
          <p className="text-sm font-semibold text-white mb-2">Available upgrades</p>
          <div className="upgrade-list">
            {upgrades.map((u) => (
              <div
                key={u.id}
                draggable
                onDragStart={(e) => onDragStart(e, u.id)}
                className="upgrade-chip"
              >
                <span>{u.name}</span>
                <span className="text-xs text-white/70">-{u.reduce} tCO₂e</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/60 mt-3">Tip: Apply multiple upgrades to the same source for bigger gains.</p>
        </div>

        <div className="mini-game-list">
          {sources.map((s) => (
            <div
              key={s.id}
              onDragOver={allowDrop}
              onDrop={(e) => onDrop(e, s.id)}
              className="droppable-row"
            >
              <div>
                <div className="item-name">{s.name}</div>
                <div className="text-xs text-white/60">Base: {s.emission} tCO₂e</div>
              </div>
              <div className="applied-upgrades">
                {(applied[s.id] ?? []).length === 0 && (
                  <span className="text-xs text-white/40">Drag upgrade here</span>
                )}
                {(applied[s.id] ?? []).map((uid) => {
                  const upgrade = upgrades.find((x) => x.id === uid);
                  return (
                    <span key={uid} className="game-pill active">
                      {upgrade?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mini-game-actions">
        <span className="score-chip">Current total: {totalEmissions} tCO₂e</span>
        <button onClick={check} className="btn btn-primary">
          Check optimization
        </button>
      </div>
    </div>
  );
}

