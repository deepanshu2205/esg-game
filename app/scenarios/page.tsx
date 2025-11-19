"use client";

import React from "react";
import ScenariosHistory from "@/app/components/ScenariosHistory";
import RequireAuth from "@/app/components/RequireAuth";

export default function ScenariosPage() {
  return (
    <RequireAuth>
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">History</p>
        <h1 className="text-3xl font-bold">Saved Scenarios</h1>
        <p className="text-white/70 mt-2">Review past quiz results, AI simulations, and supplier vetting summaries.</p>
      </div>
      <ScenariosHistory />
    </div>
    </RequireAuth>
  );
}
