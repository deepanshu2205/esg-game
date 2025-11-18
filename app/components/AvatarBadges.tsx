"use client";

import React from "react";

export default function AvatarBadges() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold">CE</div>
      <div>
        <div className="font-semibold">CEO: You</div>
        <div className="text-xs text-white/50">Badges: <span className="inline-block bg-green-600 px-2 py-0.5 rounded text-xs ml-2">Green Leader</span><span className="inline-block bg-blue-600 px-2 py-0.5 rounded text-xs ml-2">Ethical Exec</span></div>
      </div>
    </div>
  );
}
