"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Q = { id: string; q: string; choices: string[]; answerIndex: number };

const QUESTIONS: Q[] = [
  { id: "q1", q: "A worker reports an unsafe machine. What's the best immediate action?", choices: ["Ignore and continue production", "Stop the machine and inspect", "Ask the worker to sign a waiver"], answerIndex: 1 },
  { id: "q2", q: "You must decide on overtime pay. What balances ethics + business?", choices: ["Refuse overtime to save costs", "Pay fair overtime and reduce temporary hires", "Force unpaid overtime"], answerIndex: 1 },
  { id: "q3", q: "A community asks for project funding. Best governance approach?", choices: ["Pick cheapest option without consultation", "Consult stakeholders and publish rationale", "Give funds to a board member"], answerIndex: 1 },
];

export default function SocialQuiz() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function select(choiceIdx: number) {
    setAnswers((s) => ({ ...s, [QUESTIONS[index].id]: choiceIdx }));
  }

  function next() {
    if (index < QUESTIONS.length - 1) setIndex((i) => i + 1);
    else finish();
  }

  function finish() {
    const total = QUESTIONS.length;
    let correct = 0;
    for (const q of QUESTIONS) {
      if (answers[q.id] === q.answerIndex) correct++;
    }
    const pct = Math.round((correct / total) * 100);
    setScore(pct);
    setCompleted(true);
    // persist scenario result
    persistResult(pct, correct, total).catch((e) => console.error(e));
  }

  async function persistResult(pct: number, correct: number, total: number) {
    setSaving(true);
    try {
      const payload = {
        name: "social_quiz",
        input: { questions: QUESTIONS.map((q) => ({ id: q.id, q: q.q })) },
        result: { score_percent: pct, correct, total, answers }
      };
      await fetch("/api/scenarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {!completed ? (
        <div>
          <div className="font-semibold">Social Module: Quick Quiz</div>
          <div className="mt-2 p-3 bg-white/4 rounded">
            <div className="text-sm">{QUESTIONS[index].q}</div>
            <div className="mt-3 space-y-2">
              {QUESTIONS[index].choices.map((c, i) => (
                <button key={i} onClick={() => select(i)} className={`w-full text-left px-3 py-2 rounded ${answers[QUESTIONS[index].id] === i ? 'bg-blue-600' : 'bg-white/6'}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={next} className="bg-yellow-400 px-4 py-2 rounded">{index < QUESTIONS.length - 1 ? 'Next' : 'Finish'}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white/4 rounded">
          <div className="font-semibold">Quiz Complete</div>
          <div className="mt-2">Score: {score}%</div>
          <div className="mt-2 text-sm text-white/60">Results saved to your scenarios (if authenticated).</div>
          <div className="mt-3">
            <button onClick={() => { setCompleted(false); setIndex(0); setAnswers({}); setScore(null); }} className="bg-white/6 px-3 py-1 rounded">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
}
