"use client";

import React from "react";
import ScenariosHistory from "@/app/components/ScenariosHistory";

export default function ScenariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Scenarios</h1>
      <ScenariosHistory />
    </div>
  );
}
