"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const router = useRouter();

	async function submit(e: any) {
		e.preventDefault();
		try {
			if (mode === "signin") {
				const { data, error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				// set HttpOnly cookie on server so API routes can use it
				try {
					const accessToken = (data as any)?.session?.access_token ?? null;
					if (accessToken) {
						await fetch("/api/auth/set-cookie", { method: "POST", credentials: 'include', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_token: accessToken }) });
					}
				} catch (cookieErr) {
					console.error("failed to set cookie", cookieErr);
				}
			} else {
				const { data, error } = await supabase.auth.signUp({ email, password });
				if (error) throw error;
				try {
					const accessToken = (data as any)?.session?.access_token ?? null;
					if (accessToken) {
						await fetch("/api/auth/set-cookie", { method: "POST", credentials: 'include', headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_token: accessToken }) });
					}
				} catch (cookieErr) {
					console.error("failed to set cookie", cookieErr);
				}
			}
			router.push("/");
		} catch (err: any) {
			alert(err.message);
		}
	}

	return (
		<div className="split-panel mt-8">
			<div className="card card-animated">
				<h2 className="text-3xl font-semibold mb-2">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
				<p className="text-white/70 mb-6">Secure Supabase auth with automatic server cookies for API access.</p>
				<form onSubmit={submit} className="space-y-4">
					<input
						placeholder="Work email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>

					<input
						placeholder="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<div className="flex flex-col sm:flex-row gap-3">
						<button className="btn btn-primary w-full sm:w-auto">
							{mode === "signin" ? "Sign in" : "Create account"}
						</button>

						<button
							type="button"
							className="btn btn-ghost w-full sm:w-auto"
							onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
						>
							{mode === "signin" ? "Need an account?" : "Have an account?"}
						</button>
					</div>
				</form>
			</div>

			<div className="card card-animated">
				<h3 className="text-xl font-semibold mb-2">Why sign in?</h3>
				<ul className="space-y-2 text-white/75 text-sm">
					<li>• Save ESG sessions and resume progress across devices.</li>
					<li>• Submit live leaderboard scores and collect achievement badges.</li>
					<li>• Sync with Supabase auth, keeping tokens in secure HttpOnly cookies.</li>
				</ul>
			</div>
		</div>
	);
}