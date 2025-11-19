"use client";

import React, { useMemo, useState } from "react";
import WasteSorter from "./WasteSorter";
import EmissionsDragDrop from "./EmissionsDragDrop";
import SocialQuiz from "./SocialQuiz";

type TabId = "E" | "S" | "G";

const MODULES: Record<
  TabId,
  {
    label: string;
    subtitle: string;
    tone: string;
    description: string;
    badges: string[];
  }
> = {
  E: {
    label: "Environment",
    subtitle: "Carbon, waste, climate resilience",
    tone: "var(--accent)",
    description: "Optimize operations to lower carbon intensity, reduce waste, and unlock green investments.",
    badges: ["Waste Sorter Master", "Emissions Optimizer"],
  },
  S: {
    label: "Social",
    subtitle: "People, safety, community",
    tone: "#fb923c",
    description: "Balance ethics and performance: safety responses, fair wage policies, and CSR trade-offs.",
    badges: ["Culture Builder"],
  },
  G: {
    label: "Governance",
    subtitle: "Audits, transparency, controls",
    tone: "#60a5fa",
    description: "Simulate board approvals, supplier vetting, and internal controls to reduce governance risks.",
    badges: ["Audit Ace (coming soon)"],
  },
};

export default function ModuleTabs() {
  const [tab, setTab] = useState<TabId>("E");
  const active = MODULES[tab];
  const badgeList = useMemo(() => active.badges, [active]);

  return (
    <div className="module-tabs">
      <div className="pill-tabs">
        {Object.entries(MODULES).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setTab(key as TabId)}
            className={`pill-tab ${tab === key ? "active" : ""}`}
            style={tab === key ? { borderColor: meta.tone } : undefined}
          >
            <span className="pill-label">{meta.label}</span>
            <span className="pill-subtitle">{meta.subtitle}</span>
          </button>
        ))}
      </div>

      <div className="module-panel card card-animated">
        <div className="module-header">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">{active.label} module</p>
            <h3 className="text-2xl font-semibold mt-1">{active.description}</h3>
          </div>
          <div className="badge-list">
            {badgeList.map((badge) => (
              <span key={badge} className="score-chip">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {tab === "E" && (
          <div className="module-content">
            <WasteSorter
              onWin={async () => {
                try {
                  await fetch("/api/badges", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ badgeId: "waste_sorter_master" }),
                  });
                } catch (e) {
                  console.error("badge award failed", e);
                }
              }}
            />

            <EmissionsDragDrop
              onWin={async () => {
                try {
                  await fetch("/api/badges", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ badgeId: "emissions_optimizer" }),
                  });
                } catch (e) {
                  console.error("badge award failed", e);
                }
              }}
            />
          </div>
        )}

        {tab === "S" && (
          <div className="module-content">
            <SocialQuiz />
          </div>
        )}

        {tab === "G" && (
          <div className="module-content governance-placeholder">
            <div className="mini-game-card card-animated">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">Coming soon</p>
              <h4 className="text-xl font-semibold mt-2">Governance Challenges</h4>
              <p className="text-white/70 mt-2">
                Upcoming mini-games will cover mock board approvals, policy audits, and transparent procurement bids.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                <span className="score-chip">Risk committee drill</span>
                <span className="score-chip">Anti-corruption audit</span>
                <span className="score-chip">Supplier whistleblower flow</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
