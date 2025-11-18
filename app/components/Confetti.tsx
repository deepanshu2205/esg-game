"use client";

import React, { useEffect, useState } from "react";

export default function Confetti({ show }: { show: boolean }) {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    if (show) {
      const arr = Array.from({ length: 30 }, (_, i) => i);
      setPieces(arr);
      const t = setTimeout(() => setPieces([]), 4000);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {pieces.map((p) => (
        <span key={p} className="absolute" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 20}%`,
          width: 8,
          height: 16,
          background: ["#16a34a", "#06b6d4", "#f59e0b", "#f97316"][Math.floor(Math.random() * 4)],
          transform: `translateY(${Math.random() * 300 + 100}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0.95,
          borderRadius: 2,
          animation: `confetti-fall ${3 + Math.random() * 2}s linear forwards`
        }} />
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1 }
          100% { transform: translateY(400px) rotate(360deg); opacity: 0 }
        }
      `}</style>
    </div>
  );
}
