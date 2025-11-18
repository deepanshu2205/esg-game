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
    <div className="space-y-4">
      <Confetti show={showConfetti} />
      <div className="text-sm text-white/60">Sort the items into the correct bin</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="p-2 bg-white/3 rounded flex items-center justify-between">
                <div>{it.name}</div>
                <div className="flex gap-2">
                  <button onClick={() => pick(it.id, "recycle")} className={`px-2 py-1 rounded ${choices[it.id] === "recycle" ? "bg-green-600" : "bg-white/6"}`}>Recycle</button>
                  <button onClick={() => pick(it.id, "trash")} className={`px-2 py-1 rounded ${choices[it.id] === "trash" ? "bg-red-600" : "bg-white/6"}`}>Trash</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button onClick={check} className="bg-green-500 px-4 py-2 rounded">Check</button>
          </div>
        </div>

        <div>
          <div className="p-3 bg-white/4 rounded">
            <div className="text-sm font-semibold">Bins</div>
            <div className="mt-2 text-xs text-white/60">Recycle: Items accepted for recycling (plastic, glass, paper)</div>
            <div className="mt-2 text-xs text-white/60">Trash: General waste or hazardous items</div>
          </div>
        </div>
      </div>
    </div>
  );
}
