"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "@/app/components/RequireAuth";

type KPI = { carbon: number; profit: number; reputation: number };
const INITIAL_KPI: KPI = { carbon: 100, profit: 1000, reputation: 50 };

export default function GamePage() {
	const [kpi, setKpi] = useState<KPI>(() => ({ ...INITIAL_KPI }));
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const [{ data: { user } }, { data: { session } }] = await Promise.all([
					supabase.auth.getUser(),
					supabase.auth.getSession()
				]);
				setUserId(user?.id ?? null);
				setAccessToken(session?.access_token ?? null);
			} catch (err) {
				console.error("Failed to load auth state", err);
			}
		})();
	}, []);

	// Create a new authenticated session when auth data is available
	useEffect(() => {
		if (!userId || !accessToken || sessionId) return;

		(async () => {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`
			};

			const res = await fetch("/api/session", {
				method: "POST",
				headers,
				body: JSON.stringify({ userId, kpi: INITIAL_KPI })
			});

			if (res.ok) {
				const d = await res.json();
				setSessionId(d.sessionId);
			} else {
				console.warn("Failed to create session", await res.text());
			}
		})();
	}, [userId, accessToken, sessionId]);


	// Apply an action (upgrade machine, train staff, waste sorting)
	function requireAccessToken() {
		if (!accessToken) {
			throw new Error("No active session token");
		}
		return accessToken;
	}

	async function doAction(action: string) {
		if (!sessionId) return alert("No session started yet!");
		setLoading(true);
		try {
			const token = requireAccessToken();
			const res = await fetch("/api/action", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ sessionId, action, currentKpi: kpi })
			});

			const data = await res.json();
			if (res.ok && data.newKpi) {
				setKpi(data.newKpi);
			} else {
				alert(data.error ?? "Failed to apply action");
			}
		} catch (err: any) {
			alert(err.message ?? String(err));
		} finally {
			setLoading(false);
		}
	}

	// Run a simulation using the AI endpoint before performing an action
	const [simulation, setSimulation] = useState<any>(null);
	const [simLoading, setSimLoading] = useState(false);

	async function simulateAction(action: string) {
		if (!sessionId) return alert("No session started yet!");
		setSimLoading(true);
		try {
			const token = requireAccessToken();
			const payload = { baseline: kpi, action };
			const res = await fetch("/api/ai", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ action: "simulate", query: JSON.stringify(payload) })
			});

			const d = await res.json();
			// api returns { action: 'simulate', simulation: {...}, raw }
			if (res.ok && d.simulation) {
				setSimulation(d.simulation);
			} else {
				setSimulation({ explanation: d.raw ?? d.response ?? d.error ?? "No response" });
			}
		} catch (err) {
			console.error("simulate error", err);
			setSimulation({ explanation: String(err) });
		} finally {
			setSimLoading(false);
		}
	}

	return (
		<RequireAuth>
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Game</h1>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

			<div className="flex flex-col md:flex-row gap-3">
				<button onClick={() => doAction("upgrade machine")} disabled={loading} className="btn btn-primary flex-1">Upgrade machine</button>
				<button onClick={() => doAction("train staff")} disabled={loading} className="btn btn-primary flex-1">Train staff</button>
				<button onClick={() => doAction("waste sorting")} disabled={loading} className="btn btn-primary flex-1">Waste sorting</button>
			</div>
			<div className="flex flex-col gap-3">
				<div className="space-y-2">
					<div className="flex flex-col sm:flex-row gap-2">
						<button onClick={() => doAction("upgrade machine")} disabled={loading} className="btn btn-primary flex-1">Apply: Upgrade machine</button>
						<button onClick={() => simulateAction("upgrade machine")} disabled={simLoading} className="btn btn-ghost flex-1">Simulate</button>
					</div>

					<div className="flex flex-col sm:flex-row gap-2">
						<button onClick={() => doAction("train staff")} disabled={loading} className="btn btn-primary flex-1">Apply: Train staff</button>
						<button onClick={() => simulateAction("train staff")} disabled={simLoading} className="btn btn-ghost flex-1">Simulate</button>
					</div>

					<div className="flex flex-col sm:flex-row gap-2">
						<button onClick={() => doAction("waste sorting")} disabled={loading} className="btn btn-primary flex-1">Apply: Waste sorting</button>
						<button onClick={() => simulateAction("waste sorting")} disabled={simLoading} className="btn btn-ghost flex-1">Simulate</button>
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
										try {
											const token = requireAccessToken();
											const res = await fetch(`/api/action`, {
												method: "POST",
												headers: {
													"Content-Type": "application/json",
													Authorization: `Bearer ${token}`
												},
												body: JSON.stringify({ sessionId, action: "apply_simulation", currentKpi: kpi, newKpi: computed })
											});
											const data = await res.json();
											if (res.ok && data.newKpi) {
												setKpi(data.newKpi);
												setSimulation(null);
											} else {
												alert(data.error ?? "Failed to apply simulation");
											}
										} catch (err: any) {
											alert(err.message ?? String(err));
										}
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
		</RequireAuth>
	);
}