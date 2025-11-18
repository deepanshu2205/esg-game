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
		<div className="max-w-md mx-auto mt-10 card">
			<h2 className="text-2xl font-semibold mb-4">{mode === "signin" ? "Sign in" : "Create account"}</h2>
			<form onSubmit={submit} className="space-y-3">
				<input
					className="w-full p-2 bg-white/6 rounded"
					placeholder="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>

				<input
					className="w-full p-2 bg-white/6 rounded"
					placeholder="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>

				<div className="flex gap-3">
					<button className="bg-yellow-400 text-black px-4 py-2 rounded">
						{mode === "signin" ? "Sign in" : "Create"}
					</button>

					<button
						type="button"
						className="underline"
						onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
					>
						{mode === "signin" ? "Create account" : "Have an account?"}
					</button>
				</div>
			</form>
		</div>
	);
}