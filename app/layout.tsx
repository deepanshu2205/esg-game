import "./globals.css";
import Link from "next/link";
import AuthNavClient from "./components/AuthNavClient";
import NavLinksClient from "./components/NavLinksClient";
import type { ReactNode } from "react";


export const metadata = {
title: "ESG Game - Full",
description: "Minimal ESG training game with Supabase + Next.js + OpenAI"
};


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="en">
<body>
<nav className="border-b border-white/6 bg-black/20">
	<div className="container topbar">
		<div className="flex items-center gap-4">
			<Link href="/" className="brand">ESG Game</Link>
		</div>
		<div className="nav-links">
			<NavLinksClient />
		</div>
		<div className="text-sm">
			<AuthNavClient />
		</div>
	</div>
</nav>
<main className="container">{children}</main>
</body>
</html>
);
}

// Auth UI implemented in client component at ./components/AuthNavClient.tsx