"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type KPI = { carbon: number; profit: number; reputation: number };

export default function GamePage() {
	const [kpi, setKpi] = useState<KPI>({ carbon: 100, profit: 1000, reputation: 50 });
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Create a new session when page loads
	useEffect(() => {
		(async () => {
			// Try to include the authenticated user id if present; otherwise create an anonymous session.
			let userId: string | null = null;
			let accessToken: string | null = null;
			try {
				const userResp = await supabase.auth.getUser();
				userId = (userResp as any)?.data?.user?.id ?? null;
				const sessionResp = await supabase.auth.getSession();
				accessToken = (sessionResp as any)?.data?.session?.access_token ?? null;
			} catch (e) {
				// ignore - proceed as anonymous
			}

			const headers: Record<string, string> = { "Content-Type": "application/json" };
			if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

			const res = await fetch("/api/session", {
				method: "POST",
				headers,
				body: JSON.stringify(userId ? { userId, kpi } : { kpi })
			});

			if (res.ok) {
				const d = await res.json();
				setSessionId(d.sessionId);
			} else {
				console.warn("Failed to create session", await res.text());
			}
		})();
	}, []);


	// Apply an action (upgrade machine, train staff, waste sorting)
	async function doAction(action: string) {
		if (!sessionId) return alert("No session started yet!");
		setLoading(true);

		const res = await fetch("/api/action", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ sessionId, action, currentKpi: kpi })
		});

		const data = await res.json();
		if (data.newKpi) setKpi(data.newKpi);

		setLoading(false);
	}

	// Run a simulation using the AI endpoint before performing an action
	const [simulation, setSimulation] = useState<any>(null);
	const [simLoading, setSimLoading] = useState(false);

	async function simulateAction(action: string) {
		if (!sessionId) return alert("No session started yet!");
		setSimLoading(true);
		try {
			const payload = { baseline: kpi, action };
			const res = await fetch("/api/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "simulate", query: JSON.stringify(payload) })
			});

			const d = await res.json();
			// api returns { action: 'simulate', simulation: {...}, raw }
			if (d.simulation) {
				setSimulation(d.simulation);
			} else {
				// fallback: show raw
				setSimulation({ explanation: d.raw ?? d.response ?? "No response" });
			}
		} catch (err) {
			console.error("simulate error", err);
			setSimulation({ explanation: String(err) });
		} finally {
			setSimLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Game</h1>

			<div className="grid grid-cols-3 gap-4">
				<div className="card">
					<div className="text-white/70">Carbon</div>
					<div className="text-2xl">{kpi.carbon}</div>
				</div>

				<div className="card">
					<div className="text-white/70">Profit</div>
					<div className="text-2xl">₹{kpi.profit}</div>
				</div>

				<div className="card">
					<div className="text-white/70">Reputation</div>
					<div className="text-2xl">{kpi.reputation}</div>
				</div>
			</div>

			<div className="flex gap-3">
				<button onClick={() => doAction("upgrade machine")} disabled={loading} className="bg-yellow-400 px-4 py-2 rounded">Upgrade machine</button>
				<button onClick={() => doAction("train staff")} disabled={loading} className="bg-yellow-400 px-4 py-2 rounded">Train staff</button>
				<button onClick={() => doAction("waste sorting")} disabled={loading} className="bg-yellow-400 px-4 py-2 rounded">Waste sorting</button>
			</div>
			<div className="flex gap-3">
				<div className="space-y-2">
					<div className="flex gap-2">
						<button onClick={() => doAction("upgrade machine")} disabled={loading} className="bg-yellow-400 px-4 py-2 rounded">Apply: Upgrade machine</button>
						<button onClick={() => simulateAction("upgrade machine")} disabled={simLoading} className="bg-white/6 px-3 py-2 rounded">Simulate</button>
					</div>

					<div className="flex gap-2">
						<button onClick={() => doAction("train staff")} disabled={loading} className="bg-yellow-400 px-4 py-2 rounded">Apply: Train staff</button>
						<button onClick={() => simulateAction("train staff")} disabled={simLoading} className="bg-white/6 px-3 py-2 rounded">Simulate</button>
					</div>

					<div className="flex gap-2">
						<button onClick={() => doAction("waste sorting")} disabled={loading} className="bg-yellow-400 px-4 py-2 rounded">Apply: Waste sorting</button>
						<button onClick={() => simulateAction("waste sorting")} disabled={simLoading} className="bg-white/6 px-3 py-2 rounded">Simulate</button>
					</div>
				</div>
			</div>

			{simulation && (
				<div className="card mt-4 p-4">
					<h3 className="font-semibold">Simulation result</h3>
					{simulation.carbon_delta !== undefined ? (
						<div className="space-y-2">
							<div>Carbon Δ: {simulation.carbon_delta}</div>
							<div>Profit Δ: {simulation.profit_delta}</div>
							<div>Reputation Δ: {simulation.reputation_delta}</div>
							<div className="text-sm text-white/70">{simulation.explanation}</div>
							<div className="mt-2">
								<button onClick={async () => {
									// compute new KPI from simulation deltas and send to server
									const sim = simulation;
									const computed = {
										carbon: Math.max(0, kpi.carbon + (sim.carbon_delta ?? sim.carbon ?? 0)),
										profit: Math.max(-999999, kpi.profit + (sim.profit_delta ?? sim.profit ?? 0)),
										reputation: Math.min(100, Math.max(0, kpi.reputation + (sim.reputation_delta ?? sim.reputation ?? 0))),
									};
									try {
										setLoading(true);
										const res = await fetch(`/api/action`, {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ sessionId, action: "apply_simulation", currentKpi: kpi, newKpi: computed })
										});
										const data = await res.json();
										if (data.newKpi) setKpi(data.newKpi);
										// clear simulation after apply
										setSimulation(null);
									} catch (e) {
										console.error(e);
									} finally {
										setLoading(false);
									}
								}} className="bg-green-500 px-3 py-1 rounded">Apply simulated action</button>
							</div>
						</div>
					) : (
						<pre className="whitespace-pre-wrap">{simulation.explanation}</pre>
					)}
				</div>
			)}
			</div>
		);
	}