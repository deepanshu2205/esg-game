"use client";

import React, { useState } from "react";

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

  const progress = Math.round(((index + (completed ? 1 : 0)) / QUESTIONS.length) * 100);

  return (
    <div className="mini-game-card card-animated">
      <div className="mini-game-header">
        <div>
          <p className="mini-game-label">Scenario quiz</p>
          <h4 className="mini-game-title">Social Compass</h4>
        </div>
        <span className="score-chip">{completed ? `Score: ${score}%` : `Step ${index + 1} / ${QUESTIONS.length}`}</span>
      </div>
      <p className="mini-game-copy">Choose the most responsible response for each workplace or community situation.</p>

      {!completed ? (
        <div className="quiz-card">
          <div className="quiz-question">
            <p>{QUESTIONS[index].q}</p>
          </div>
          <div className="quiz-options">
            {QUESTIONS[index].choices.map((c, i) => (
              <button
                key={i}
                onClick={() => select(i)}
                className={`quiz-option ${answers[QUESTIONS[index].id] === i ? "active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mini-game-actions">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <button onClick={next} className="btn btn-primary">
              {index < QUESTIONS.length - 1 ? "Next scenario" : "Finish quiz"}
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-card">
          <div className="quiz-question">
            <p>Quiz complete</p>
          </div>
          <p className="text-white/70 text-sm">Results saved to your scenarios{saving ? "…" : "."}</p>
          <div className="mini-game-actions">
            <button
              onClick={() => {
                setCompleted(false);
                setIndex(0);
                setAnswers({});
                setScore(null);
              }}
              className="btn btn-ghost"
            >
              Retry quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
