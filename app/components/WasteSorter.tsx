"use client";

import React, { useMemo, useState } from "react";
import Confetti from "./Confetti";

type Item = { id: string; name: string; correct: "recycle" | "trash" };

const SAMPLE: Item[] = [
  { id: "1", name: "Plastic Bottle", correct: "recycle" },
  { id: "2", name: "Pizza Box", correct: "trash" },
  { id: "3", name: "Glass Jar", correct: "recycle" },
  { id: "4", name: "Battery", correct: "trash" },
  { id: "5", name: "Paper", correct: "recycle" },
];

export default function WasteSorter({ onWin }: { onWin?: () => void }) {
  const items = useMemo(() => SAMPLE.map((s) => ({ ...s })), []);
  const [choices, setChoices] = useState<Record<string, "recycle" | "trash" | null>>(() => ({}));
  const [showConfetti, setShowConfetti] = useState(false);

  function pick(id: string, bin: "recycle" | "trash") {
    setChoices((c) => ({ ...c, [id]: bin }));
  }

  function check() {
    const total = items.length;
    let correct = 0;
    for (const it of items) {
      if (choices[it.id] === it.correct) correct++;
    }
    const pct = Math.round((correct / total) * 100);
    if (pct >= 80) {
      setShowConfetti(true);
      onWin?.();
      setTimeout(() => setShowConfetti(false), 3500);
    }
    alert(`You scored ${pct}% (${correct}/${total})`);
  }

  return (
    <div className="mini-game-card card-animated">
      <Confetti show={showConfetti} />
      <div className="mini-game-header">
        <div>
          <p className="mini-game-label">Mini-game</p>
          <h4 className="mini-game-title">Waste Sorter</h4>
        </div>
        <span className="score-chip">80%+ to win badge</span>
      </div>
      <p className="mini-game-copy">Tap a bin to classify each item. Beat 80% accuracy to unlock the Waste Sorter Master badge.</p>

      <div className="mini-game-layout">
        <div className="mini-game-list">
          {items.map((it) => (
            <div key={it.id} className="mini-game-row">
              <div className="item-name">{it.name}</div>
              <div className="game-pill-group">
                <button
                  onClick={() => pick(it.id, "recycle")}
                  className={`game-pill ${choices[it.id] === "recycle" ? "active recycle" : ""}`}
                >
                  Recycle
                </button>
                <button
                  onClick={() => pick(it.id, "trash")}
                  className={`game-pill ${choices[it.id] === "trash" ? "active trash" : ""}`}
                >
                  Trash
                </button>
              </div>
            </div>
          ))}
          <div className="mini-game-actions">
            <button onClick={check} className="btn btn-primary w-full sm:w-auto">
              Check answers
            </button>
          </div>
        </div>

        <div className="mini-game-sidecard">
          <p className="text-sm font-semibold text-white">Bins refresher</p>
          <p className="text-xs text-white/70 mt-2">
            <strong>Recycle:</strong> Rinsed plastic, glass, paper, or metal packaging.
          </p>
          <p className="text-xs text-white/70 mt-2">
            <strong>Trash:</strong> Contaminated food packaging, batteries, mixed waste, or items with hazard labels.
          </p>
        </div>
      </div>
    </div>
  );
}
